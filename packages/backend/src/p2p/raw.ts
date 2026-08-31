import type { DataSource } from "typeorm";
import { Board } from "../db/entities/Board";
import { Post } from "../db/entities/Post";
import { Media } from "../db/entities/Media";
import { ChatProfile } from "../db/entities/ChatProfile";
import { ChatFolder } from "../db/entities/ChatFolder";
import { ProfileThreadState } from "../db/entities/ProfileThreadState";
import { ProfileOwnPost } from "../db/entities/ProfileOwnPost";
import type { P2pReplicatedTable } from "./types";

export type RawRow = Record<string, unknown>;

const boardToRaw = (b: Board): RawRow => ({
  id: Number(b.id),
  tag: b.tag,
  name: b.name,
  isPublic: b.isPublic,
  updatedAt: b.updatedAt,
  revision: b.revision,
  originNodeId: b.originNodeId,
});

const postToRaw = (p: Post): RawRow => ({
  id: Number(p.id),
  poster: p.poster,
  posterVerified: p.posterVerified,
  subject: p.subject,
  message: p.message,
  messageTruncated: p.messageTruncated,
  timestamp: p.timestamp,
  updatedAt: p.updatedAt,
  revision: p.revision,
  originNodeId: p.originNodeId,
  boardId: p.boardId == null ? null : Number(p.boardId),
  isSticky: p.isSticky,
  isBlocked: p.isBlocked,
  parentId: p.parentId == null ? null : Number(p.parentId),
});

const mediaToRaw = (m: Media): RawRow => ({
  syncId: m.syncId,
  postId: m.postId == null ? null : Number(m.postId),
  mediaType: m.mediaType,
  urlOrigin: m.urlOrigin,
  urlPreview: m.urlPreview,
  contentSha256: m.contentSha256,
  previewSha256: m.previewSha256,
  updatedAt: m.updatedAt,
  revision: m.revision,
  originNodeId: m.originNodeId,
  // local paths are peer-local; files transferred separately
});

const profileToRaw = (p: ChatProfile): RawRow => ({
  syncId: p.syncId,
  token: p.token,
  passphraseHash: p.passphraseHash,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  revision: p.revision,
  originNodeId: p.originNodeId,
});

const folderToRaw = async (dataSource: DataSource, f: ChatFolder): Promise<RawRow> => {
  const profile = await dataSource.getRepository(ChatProfile).findOne({ where: { id: f.profileId } });
  return {
    syncId: f.syncId,
    profileSyncId: profile?.syncId ?? null,
    boardId: Number(f.boardId),
    name: f.name,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
    revision: f.revision,
    originNodeId: f.originNodeId,
  };
};

const stateToRaw = async (dataSource: DataSource, s: ProfileThreadState): Promise<RawRow> => {
  const profile = await dataSource.getRepository(ChatProfile).findOne({ where: { id: s.profileId } });
  let folderSyncId: string | null = null;
  if (s.folderId != null) {
    const folder = await dataSource.getRepository(ChatFolder).findOne({ where: { id: s.folderId } });
    folderSyncId = folder?.syncId ?? null;
  }
  return {
    syncId: s.syncId,
    profileSyncId: profile?.syncId ?? null,
    threadId: Number(s.threadId),
    lastSeenPostId: s.lastSeenPostId == null ? null : Number(s.lastSeenPostId),
    lastSeenAt: s.lastSeenAt,
    hidden: s.hidden,
    alias: s.alias,
    folderSyncId,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    revision: s.revision,
    originNodeId: s.originNodeId,
  };
};

const ownPostToRaw = async (dataSource: DataSource, o: ProfileOwnPost): Promise<RawRow> => {
  const profile = await dataSource.getRepository(ChatProfile).findOne({ where: { id: o.profileId } });
  return {
    syncId: o.syncId,
    profileSyncId: profile?.syncId ?? null,
    threadId: Number(o.threadId),
    postId: Number(o.postId),
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    revision: o.revision,
    originNodeId: o.originNodeId,
  };
};

export const loadRawRow = async (
  dataSource: DataSource,
  table: P2pReplicatedTable | string,
  key: string,
): Promise<RawRow | null> => {
  switch (table) {
    case "Board": {
      const row = await dataSource.getRepository(Board).findOne({ where: { id: Number(key) } });
      return row ? boardToRaw(row) : null;
    }
    case "Post": {
      const row = await dataSource.getRepository(Post).findOne({ where: { id: Number(key) } });
      return row ? postToRaw(row) : null;
    }
    case "Media": {
      const row = await dataSource.getRepository(Media).findOne({ where: { syncId: key } });
      return row ? mediaToRaw(row) : null;
    }
    case "ChatProfile": {
      const row = await dataSource.getRepository(ChatProfile).findOne({ where: { syncId: key } });
      return row ? profileToRaw(row) : null;
    }
    case "ChatFolder": {
      const row = await dataSource.getRepository(ChatFolder).findOne({ where: { syncId: key } });
      return row ? folderToRaw(dataSource, row) : null;
    }
    case "ProfileThreadState": {
      const row = await dataSource.getRepository(ProfileThreadState).findOne({ where: { syncId: key } });
      return row ? stateToRaw(dataSource, row) : null;
    }
    case "ProfileOwnPost": {
      const row = await dataSource.getRepository(ProfileOwnPost).findOne({ where: { syncId: key } });
      return row ? ownPostToRaw(dataSource, row) : null;
    }
    default:
      return null;
  }
};

export type SnapshotFrame = {
  table: string;
  key: string;
  op: "upsert";
  row: RawRow;
};

export async function* iterateSnapshot(dataSource: DataSource): AsyncGenerator<SnapshotFrame> {
  for (const board of await dataSource.getRepository(Board).find()) {
    yield { table: "Board", key: String(board.id), op: "upsert", row: boardToRaw(board) };
  }
  for (const post of await dataSource.getRepository(Post).find()) {
    yield { table: "Post", key: String(post.id), op: "upsert", row: postToRaw(post) };
  }
  for (const media of await dataSource.getRepository(Media).find()) {
    yield { table: "Media", key: media.syncId, op: "upsert", row: mediaToRaw(media) };
  }
  for (const profile of await dataSource.getRepository(ChatProfile).find()) {
    yield { table: "ChatProfile", key: profile.syncId, op: "upsert", row: profileToRaw(profile) };
  }
  for (const folder of await dataSource.getRepository(ChatFolder).find()) {
    yield {
      table: "ChatFolder",
      key: folder.syncId,
      op: "upsert",
      row: await folderToRaw(dataSource, folder),
    };
  }
  for (const state of await dataSource.getRepository(ProfileThreadState).find()) {
    yield {
      table: "ProfileThreadState",
      key: state.syncId,
      op: "upsert",
      row: await stateToRaw(dataSource, state),
    };
  }
  for (const own of await dataSource.getRepository(ProfileOwnPost).find()) {
    yield {
      table: "ProfileOwnPost",
      key: own.syncId,
      op: "upsert",
      row: await ownPostToRaw(dataSource, own),
    };
  }
}
