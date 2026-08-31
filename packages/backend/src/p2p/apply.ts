import type { DataSource } from "typeorm";
import { Board } from "../db/entities/Board";
import { Post } from "../db/entities/Post";
import { Media } from "../db/entities/Media";
import { ChatProfile } from "../db/entities/ChatProfile";
import { ChatFolder } from "../db/entities/ChatFolder";
import { ProfileThreadState } from "../db/entities/ProfileThreadState";
import { ProfileOwnPost } from "../db/entities/ProfileOwnPost";
import { deleteFilesForMedia } from "../media/storage";
import { logChanges } from "./journal";
import { lwwWins } from "./lww";
import type { RawRow } from "./raw";
import type { P2pChangeOp, P2pChangePointer } from "./types";
import { getP2pHub } from "./hub";

const num = (v: unknown): number => Number(v);
const str = (v: unknown): string => String(v ?? "");
const strOrNull = (v: unknown): string | null => (v == null ? null : String(v));
const numOrNull = (v: unknown): number | null => (v == null ? null : Number(v));

export const applyDelete = async (
  dataSource: DataSource,
  table: string,
  key: string,
  meta: { originNodeId: string; updatedAt: number },
  opts?: { fromUpstream?: boolean },
): Promise<boolean> => {
  let deleted = false;
  switch (table) {
    case "Board":
      deleted = (await dataSource.getRepository(Board).delete({ id: num(key) })).affected === 1;
      break;
    case "Post": {
      const media = await dataSource.getRepository(Media).find({ where: { postId: num(key) } });
      for (const m of media) await deleteFilesForMedia(m);
      await dataSource.getRepository(Media).delete({ postId: num(key) });
      deleted = (await dataSource.getRepository(Post).delete({ id: num(key) })).affected === 1;
      break;
    }
    case "Media": {
      const row = await dataSource.getRepository(Media).findOne({ where: { syncId: key } });
      if (row) {
        await deleteFilesForMedia(row);
        await dataSource.getRepository(Media).delete({ id: row.id });
        deleted = true;
      }
      break;
    }
    case "ChatProfile":
      deleted =
        (await dataSource.getRepository(ChatProfile).delete({ syncId: key })).affected === 1;
      break;
    case "ChatFolder":
      deleted = (await dataSource.getRepository(ChatFolder).delete({ syncId: key })).affected === 1;
      break;
    case "ProfileThreadState":
      deleted =
        (await dataSource.getRepository(ProfileThreadState).delete({ syncId: key })).affected === 1;
      break;
    case "ProfileOwnPost":
      deleted =
        (await dataSource.getRepository(ProfileOwnPost).delete({ syncId: key })).affected === 1;
      break;
    default:
      return false;
  }
  if (deleted) {
    const pointers = await logChanges(dataSource, [
      {
        table,
        recordKey: key,
        op: "delete",
        originNodeId: meta.originNodeId,
        updatedAt: meta.updatedAt,
      },
    ]);
    getP2pHub()?.broadcast(pointers);
    if (!opts?.fromUpstream) {
      getP2pHub()?.enqueueOutbox(pointers);
    }
  }
  return deleted;
};

export const applyUpsert = async (
  dataSource: DataSource,
  table: string,
  key: string,
  row: RawRow,
  opts?: { fromUpstream?: boolean },
): Promise<boolean> => {
  const incomingMeta = {
    updatedAt: num(row.updatedAt),
    originNodeId: strOrNull(row.originNodeId),
  };

  const finish = async (applied: boolean, recordKey: string) => {
    if (!applied) return false;
    const pointers = await logChanges(dataSource, [
      {
        table,
        recordKey,
        op: "upsert",
        originNodeId: incomingMeta.originNodeId || "remote",
        updatedAt: incomingMeta.updatedAt,
      },
    ]);
    getP2pHub()?.broadcast(pointers);
    if (!opts?.fromUpstream) {
      getP2pHub()?.enqueueOutbox(pointers);
    }
    return true;
  };

  switch (table) {
    case "Board": {
      const repo = dataSource.getRepository(Board);
      const existing = await repo.findOne({ where: { id: num(row.id) } });
      if (!lwwWins(existing, incomingMeta)) return false;
      await repo.save(
        repo.create({
          id: num(row.id),
          tag: str(row.tag),
          name: str(row.name),
          updatedAt: incomingMeta.updatedAt,
          revision: num(row.revision ?? 0),
          originNodeId: incomingMeta.originNodeId,
        }),
      );
      return finish(true, String(row.id));
    }
    case "Post": {
      const repo = dataSource.getRepository(Post);
      const existing = await repo.findOne({ where: { id: num(row.id) } });
      if (!lwwWins(existing, incomingMeta)) return false;
      await repo.save(
        repo.create({
          id: num(row.id),
          poster: str(row.poster),
          posterVerified: Boolean(row.posterVerified),
          subject: str(row.subject),
          message: str(row.message),
          messageTruncated: str(row.messageTruncated),
          timestamp: num(row.timestamp),
          updatedAt: incomingMeta.updatedAt,
          revision: num(row.revision ?? 0),
          originNodeId: incomingMeta.originNodeId,
          boardId: numOrNull(row.boardId),
          isSticky: Boolean(row.isSticky),
          isBlocked: Boolean(row.isBlocked),
          parentId: numOrNull(row.parentId),
        }),
      );
      return finish(true, String(row.id));
    }
    case "Media": {
      const repo = dataSource.getRepository(Media);
      const syncId = str(row.syncId || key);
      const existing = await repo.findOne({ where: { syncId } });
      if (!lwwWins(existing, incomingMeta)) return false;
      if (existing) {
        existing.mediaType = str(row.mediaType);
        existing.urlOrigin = strOrNull(row.urlOrigin);
        existing.urlPreview = strOrNull(row.urlPreview);
        existing.contentSha256 = strOrNull(row.contentSha256);
        existing.previewSha256 = strOrNull(row.previewSha256);
        existing.postId = numOrNull(row.postId);
        existing.updatedAt = incomingMeta.updatedAt;
        existing.revision = num(row.revision ?? 0);
        existing.originNodeId = incomingMeta.originNodeId;
        await repo.save(existing);
      } else {
        await repo.save(
          repo.create({
            syncId,
            mediaType: str(row.mediaType),
            urlOrigin: strOrNull(row.urlOrigin),
            urlPreview: strOrNull(row.urlPreview),
            contentSha256: strOrNull(row.contentSha256),
            previewSha256: strOrNull(row.previewSha256),
            postId: numOrNull(row.postId),
            localPath: null,
            localPreviewPath: null,
            updatedAt: incomingMeta.updatedAt,
            revision: num(row.revision ?? 0),
            originNodeId: incomingMeta.originNodeId,
          }),
        );
      }
      return finish(true, syncId);
    }
    case "ChatProfile": {
      const repo = dataSource.getRepository(ChatProfile);
      const syncId = str(row.syncId || key);
      const existing = await repo.findOne({ where: { syncId } });
      if (!lwwWins(existing, incomingMeta)) return false;
      if (existing) {
        existing.token = str(row.token);
        existing.passphraseHash = str(row.passphraseHash);
        existing.updatedAt = incomingMeta.updatedAt;
        existing.revision = num(row.revision ?? 0);
        existing.originNodeId = incomingMeta.originNodeId;
        await repo.save(existing);
      } else {
        await repo.save(
          repo.create({
            syncId,
            token: str(row.token),
            passphraseHash: str(row.passphraseHash),
            createdAt: num(row.createdAt),
            updatedAt: incomingMeta.updatedAt,
            revision: num(row.revision ?? 0),
            originNodeId: incomingMeta.originNodeId,
          }),
        );
      }
      return finish(true, syncId);
    }
    case "ChatFolder": {
      const repo = dataSource.getRepository(ChatFolder);
      const syncId = str(row.syncId || key);
      const profileSyncId = str(row.profileSyncId);
      const profile = await dataSource
        .getRepository(ChatProfile)
        .findOne({ where: { syncId: profileSyncId } });
      if (!profile) return false;
      const existing = await repo.findOne({ where: { syncId } });
      if (!lwwWins(existing, incomingMeta)) return false;
      if (existing) {
        existing.profileId = profile.id;
        existing.boardId = num(row.boardId);
        existing.name = str(row.name);
        existing.updatedAt = incomingMeta.updatedAt;
        existing.revision = num(row.revision ?? 0);
        existing.originNodeId = incomingMeta.originNodeId;
        await repo.save(existing);
      } else {
        await repo.save(
          repo.create({
            syncId,
            profileId: profile.id,
            boardId: num(row.boardId),
            name: str(row.name),
            createdAt: num(row.createdAt),
            updatedAt: incomingMeta.updatedAt,
            revision: num(row.revision ?? 0),
            originNodeId: incomingMeta.originNodeId,
          }),
        );
      }
      return finish(true, syncId);
    }
    case "ProfileThreadState": {
      const repo = dataSource.getRepository(ProfileThreadState);
      const syncId = str(row.syncId || key);
      const profile = await dataSource
        .getRepository(ChatProfile)
        .findOne({ where: { syncId: str(row.profileSyncId) } });
      if (!profile) return false;
      let folderId: number | null = null;
      if (row.folderSyncId) {
        const folder = await dataSource
          .getRepository(ChatFolder)
          .findOne({ where: { syncId: str(row.folderSyncId) } });
        folderId = folder?.id ?? null;
      }
      const existing = await repo.findOne({ where: { syncId } });
      if (!lwwWins(existing, incomingMeta)) return false;
      if (existing) {
        existing.profileId = profile.id;
        existing.threadId = num(row.threadId);
        existing.lastSeenPostId = numOrNull(row.lastSeenPostId);
        existing.lastSeenAt = numOrNull(row.lastSeenAt);
        existing.hidden = Boolean(row.hidden);
        existing.alias = strOrNull(row.alias);
        existing.folderId = folderId;
        existing.updatedAt = incomingMeta.updatedAt;
        existing.revision = num(row.revision ?? 0);
        existing.originNodeId = incomingMeta.originNodeId;
        await repo.save(existing);
      } else {
        await repo.save(
          repo.create({
            syncId,
            profileId: profile.id,
            threadId: num(row.threadId),
            lastSeenPostId: numOrNull(row.lastSeenPostId),
            lastSeenAt: numOrNull(row.lastSeenAt),
            hidden: Boolean(row.hidden),
            alias: strOrNull(row.alias),
            folderId,
            createdAt: num(row.createdAt),
            updatedAt: incomingMeta.updatedAt,
            revision: num(row.revision ?? 0),
            originNodeId: incomingMeta.originNodeId,
          }),
        );
      }
      return finish(true, syncId);
    }
    case "ProfileOwnPost": {
      const repo = dataSource.getRepository(ProfileOwnPost);
      const syncId = str(row.syncId || key);
      const profile = await dataSource
        .getRepository(ChatProfile)
        .findOne({ where: { syncId: str(row.profileSyncId) } });
      if (!profile) return false;
      const existing = await repo.findOne({ where: { syncId } });
      if (!lwwWins(existing, incomingMeta)) return false;
      if (existing) {
        existing.profileId = profile.id;
        existing.threadId = num(row.threadId);
        existing.postId = num(row.postId);
        existing.updatedAt = incomingMeta.updatedAt;
        existing.revision = num(row.revision ?? 0);
        existing.originNodeId = incomingMeta.originNodeId;
        await repo.save(existing);
      } else {
        await repo.save(
          repo.create({
            syncId,
            profileId: profile.id,
            threadId: num(row.threadId),
            postId: num(row.postId),
            createdAt: num(row.createdAt),
            updatedAt: incomingMeta.updatedAt,
            revision: num(row.revision ?? 0),
            originNodeId: incomingMeta.originNodeId,
          }),
        );
      }
      return finish(true, syncId);
    }
    default:
      return false;
  }
};

export const applyPointerWithRow = async (
  dataSource: DataSource,
  pointer: P2pChangePointer,
  row: RawRow | null,
  opts?: { fromUpstream?: boolean },
): Promise<boolean> => {
  if (pointer.op === "delete") {
    return applyDelete(dataSource, pointer.table, pointer.key, pointer, opts);
  }
  if (!row) return false;
  return applyUpsert(dataSource, pointer.table, pointer.key, row, opts);
};

export type ApplyOp = {
  table: string;
  key: string;
  op: P2pChangeOp;
  row?: RawRow | null;
  originNodeId: string;
  updatedAt: number;
};
