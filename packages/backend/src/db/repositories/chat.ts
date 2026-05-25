import { randomUUID, scryptSync } from "crypto";
import { Brackets, DataSource, In } from "typeorm";
import { ChatProfile } from "../entities/ChatProfile";
import { ProfileThreadState } from "../entities/ProfileThreadState";
import { Post } from "../entities/Post";
import { Board } from "../entities/Board";
import { ChatFolder } from "../entities/ChatFolder";
import { defaultLimit } from "../../utils/config";
import { ProfileOwnPost } from "../entities/ProfileOwnPost";
import { Media } from "../entities/Media";

const hashPassphrase = (passphrase: string) => {
  const salt = process.env.CHAT_PASSPHRASE_SALT ?? "umechan-chat";
  return scryptSync(passphrase.trim(), salt, 64).toString("hex");
};

const now = () => Date.now();

/** Тип медиа в БД совпадает с {@link EpdsPostMediaType.PISSYKAKA_IMAGE} */
const PISSYKAKA_IMAGE_DB = "image";

type LastReplyPreview = { truncatedText: string; author: string };

export const dbModelChat = (dataSource: DataSource) => ({
  identify: async (passphrase: string) => {
    const profileRepo = dataSource.getRepository(ChatProfile);
    const passphraseHash = hashPassphrase(passphrase.trim());
    let profile = await profileRepo.findOne({ where: { passphraseHash } });
    if (!profile) {
      profile = await profileRepo.save(profileRepo.create({
        passphraseHash,
        token: randomUUID(),
        createdAt: now(),
        updatedAt: now(),
      }));
    }
    return profile;
  },
  profileByToken: async (token: string) => {
    return dataSource.getRepository(ChatProfile).findOne({ where: { token } });
  },
  threadWithReplies: async (threadId: number) => {
    const postRepository = dataSource.getRepository(Post);
    const thread = await postRepository
      .createQueryBuilder("thread")
      .leftJoinAndSelect("thread.replies", "replies")
      .leftJoinAndSelect("replies.media", "replyMedia")
      .leftJoinAndSelect("replies.board", "replyBoard")
      .leftJoinAndSelect("thread.media", "media")
      .leftJoinAndSelect("thread.board", "board")
      .where("thread.id = :threadId", { threadId })
      .getOne();
    if (thread?.replies) {
      thread.replies.sort((a: Post, b: Post) => a.id - b.id);
    }
    return thread;
  },
  listThreadsByBoard: async (boardTag: string, offset = 0, limit = defaultLimit) => {
    const postRepository = dataSource.getRepository(Post);
    return postRepository
      .createQueryBuilder("thread")
      .leftJoinAndSelect("thread.board", "board")
      .leftJoinAndSelect("thread.media", "media")
      .where("thread.parentId IS NULL")
      .andWhere("board.tag = :boardTag", { boardTag })
      .orderBy("thread.updatedAt", "DESC")
      .skip(offset)
      .take(limit)
      .getMany();
  },
  countThreadsByBoard: async (boardTag: string) => {
    const postRepository = dataSource.getRepository(Post);
    return postRepository
      .createQueryBuilder("thread")
      .leftJoin("thread.board", "board")
      .where("thread.parentId IS NULL")
      .andWhere("board.tag = :boardTag", { boardTag })
      .getCount();
  },
  /**
   * Для каждой доски: сколько корневых тредов имеют хотя бы один непрочитанный ответ
   * (та же модель, что и метод unreadCountForThread); скрытые треды не считаем.
   */
  countThreadsWithUnreadByBoardIds: async (profileId: number, boardIds: number[]) => {
    const map = new Map<number, number>(boardIds.map((id) => [Number(id), 0]));
    if (boardIds.length === 0) {
      return map;
    }
    const postRepository = dataSource.getRepository(Post);
    const threadRows = await postRepository
      .createQueryBuilder("t")
      .select("t.id", "threadId")
      .addSelect("t.boardId", "boardId")
      .where("t.parentId IS NULL")
      .andWhere("t.boardId IN (:...boardIds)", { boardIds })
      .getRawMany<{ threadId: unknown; boardId: unknown }>();
    if (threadRows.length === 0) {
      return map;
    }
    const threadIds = threadRows.map((r) => Number(r.threadId));
    const replies = await postRepository.find({
      where: { parentId: In(threadIds) },
      select: ["id", "parentId"],
    });
    const replyIdsByThread = new Map<number, number[]>();
    for (const r of replies) {
      const tid = Number(r.parentId);
      const idList = replyIdsByThread.get(tid) ?? [];
      idList.push(Number(r.id));
      replyIdsByThread.set(tid, idList);
    }
    const states = await dataSource.getRepository(ProfileThreadState).find({
      where: { profileId, threadId: In(threadIds) },
    });
    const stateByThread = new Map<number, ProfileThreadState>(states.map((s) => [Number(s.threadId), s]));

    const ownRows = await dataSource.getRepository(ProfileOwnPost).find({
      where: { profileId, threadId: In(threadIds) },
      select: ["postId", "threadId"],
    });
    const ownIdsByThread = new Map<number, Set<number>>();
    for (const o of ownRows) {
      const tid = Number(o.threadId);
      if (!ownIdsByThread.has(tid)) {
        ownIdsByThread.set(tid, new Set());
      }
      ownIdsByThread.get(tid)!.add(Number(o.postId));
    }

    for (const row of threadRows) {
      const threadId = Number(row.threadId);
      const boardId = Number(row.boardId);
      if (!map.has(boardId)) {
        continue;
      }
      if (stateByThread.get(threadId)?.hidden) {
        continue;
      }
      const lastSeenRaw = stateByThread.get(threadId)?.lastSeenPostId;
      const lastSeen = lastSeenRaw == null ? 0 : Number(lastSeenRaw);
      const replyIds = replyIdsByThread.get(threadId);
      if (replyIds == null || replyIds.length === 0) {
        continue;
      }
      const own = ownIdsByThread.get(threadId) ?? new Set();
      let hasUnread = false;
      for (const replyId of replyIds) {
        if (replyId > lastSeen && !own.has(replyId)) {
          hasUnread = true;
          break;
        }
      }
      if (hasUnread) {
        map.set(boardId, (map.get(boardId) ?? 0) + 1);
      }
    }
    return map;
  },
  /** Последний по id пост в треде (корень или ответ): обрезка текста и poster */
  lastReplyPreviewByThreadIds: async (threadIds: number[]) => {
    if (threadIds.length === 0) {
      return new Map<number, LastReplyPreview>();
    }
    const postRepository = dataSource.getRepository(Post);
    const rawRows = await postRepository
      .createQueryBuilder("p")
      .select("COALESCE(p.parentId, p.id)", "threadId")
      .addSelect("MAX(p.id)", "lastPostId")
      .where(
        new Brackets((qb) => {
          qb.where("p.id IN (:...threadIds) AND p.parentId IS NULL", { threadIds }).orWhere(
            "p.parentId IN (:...threadIds)",
            { threadIds },
          );
        }),
      )
      .groupBy("COALESCE(p.parentId, p.id)")
      .getRawMany();
    const lastPostIds = rawRows.map((r) => Number(r.lastPostId)).filter((id) => !Number.isNaN(id));
    if (lastPostIds.length === 0) {
      return new Map<number, LastReplyPreview>();
    }
    const lastPosts = await postRepository.find({
      where: { id: In(lastPostIds) },
      select: ["id", "messageTruncated", "poster"],
    });
    const previewByPostId = new Map<number, LastReplyPreview>(
      lastPosts.map((p) => [
        Number(p.id),
        { truncatedText: p.messageTruncated, author: p.poster },
      ]),
    );
    const emptyPreview: LastReplyPreview = { truncatedText: "", author: "" };
    return new Map(
      rawRows.map((r) => {
        const tid = Number(r.threadId);
        const pid = Number(r.lastPostId);
        return [tid, previewByPostId.get(pid) ?? emptyPreview];
      }),
    );
  },
  /** Первая картинка PISSYKAKA_IMAGE в треде по порядку: OP, затем ответы по возрастанию id */
  firstPissykakaImageMediaByThreadIds: async (threadIds: number[]) => {
    if (threadIds.length === 0) {
      return new Map<number, Media | null>();
    }
    const postRepository = dataSource.getRepository(Post);
    const posts = await postRepository
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.media", "media")
      .where(
        new Brackets((qb) => {
          qb.where("p.id IN (:...threadIds) AND p.parentId IS NULL", { threadIds }).orWhere(
            "p.parentId IN (:...threadIds)",
            { threadIds },
          );
        }),
      )
      .orderBy("COALESCE(p.parentId, p.id)", "ASC")
      .addOrderBy("CASE WHEN p.parentId IS NULL THEN 0 ELSE 1 END", "ASC")
      .addOrderBy("p.id", "ASC")
      .getMany();
    const byThread = new Map<number, Media | null>();
    for (const post of posts) {
      const threadId = Number(post.parentId ?? post.id);
      if (byThread.has(threadId)) continue;
      const picture = post.media?.find((m) => m.mediaType === PISSYKAKA_IMAGE_DB);
      if (picture) {
        byThread.set(threadId, picture);
      }
    }
    return byThread;
  },
  listStatesByProfileAndThreads: async (profileId: number, threadIds: number[]) => {
    if (threadIds.length === 0) {
      return [];
    }
    return dataSource.getRepository(ProfileThreadState).find({
      where: { profileId, threadId: In(threadIds) },
    });
  },
  unreadCountForThread: async (profileId: number, threadId: number, lastSeenPostId: number) => {
    const ownPosts = await dataSource.getRepository(ProfileOwnPost).find({ where: { profileId, threadId } });
    const ownIds = ownPosts.map((item) => item.postId);
    const qb = dataSource.getRepository(Post)
      .createQueryBuilder("post")
      .where("post.parentId = :threadId", { threadId })
      .andWhere("post.id > :lastSeenPostId", { lastSeenPostId });
    if (ownIds.length > 0) {
      qb.andWhere("post.id NOT IN (:...ownIds)", { ownIds });
    }
    return qb.getCount();
  },
  ensureState: async (profileId: number, threadId: number) => {
    const repo = dataSource.getRepository(ProfileThreadState);
    let state = await repo.findOne({ where: { profileId, threadId } });
    if (!state) {
      state = await repo.save(repo.create({
        profileId,
        threadId,
        lastSeenPostId: null,
        lastSeenAt: null,
        hidden: false,
        alias: null,
        folderId: null,
        createdAt: now(),
        updatedAt: now(),
      }));
    }
    return state;
  },
  markThreadRead: async (profileId: number, threadId: number, lastSeenPostId: number) => {
    const repo = dataSource.getRepository(ProfileThreadState);
    let state = await repo.findOne({ where: { profileId, threadId } });
    if (!state) {
      state = repo.create({
        profileId,
        threadId,
        hidden: false,
        alias: null,
        folderId: null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    state.lastSeenPostId = lastSeenPostId;
    state.lastSeenAt = now();
    state.updatedAt = now();
    return repo.save(state);
  },
  markAllReadByBoard: async (profileId: number, boardTag: string) => {
    const board = await dataSource.getRepository(Board).findOne({ where: { tag: boardTag } });
    if (!board) return;
    const threads = await dataSource.getRepository(Post).createQueryBuilder("thread")
      .where("thread.parentId IS NULL")
      .andWhere("thread.boardId = :boardId", { boardId: board.id })
      .getMany();
    for (const thread of threads) {
      const lastReply = await dataSource.getRepository(Post).createQueryBuilder("post")
        .where("(post.parentId = :threadId OR post.id = :threadId)", { threadId: thread.id })
        .orderBy("post.id", "DESC")
        .getOne();
      const repo = dataSource.getRepository(ProfileThreadState);
      let state = await repo.findOne({ where: { profileId, threadId: thread.id } });
      if (!state) {
        state = repo.create({
          profileId,
          threadId: thread.id,
          hidden: false,
          alias: null,
          folderId: null,
          createdAt: now(),
          updatedAt: now(),
        });
      }
      state.lastSeenPostId = Number(lastReply?.id ?? thread.id);
      state.lastSeenAt = now();
      state.updatedAt = now();
      await repo.save(state);
    }
  },
  setHidden: async (profileId: number, threadId: number, hidden: boolean) => {
    const repo = dataSource.getRepository(ProfileThreadState);
    let state = await repo.findOne({ where: { profileId, threadId } });
    if (!state) {
      state = repo.create({
        profileId,
        threadId,
        lastSeenPostId: null,
        lastSeenAt: null,
        hidden: false,
        alias: null,
        folderId: null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    state.hidden = hidden;
    state.updatedAt = now();
    return repo.save(state);
  },
  setAlias: async (profileId: number, threadId: number, alias: string | null) => {
    const repo = dataSource.getRepository(ProfileThreadState);
    let state = await repo.findOne({ where: { profileId, threadId } });
    if (!state) {
      state = repo.create({
        profileId,
        threadId,
        lastSeenPostId: null,
        lastSeenAt: null,
        hidden: false,
        alias: null,
        folderId: null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    state.alias = alias && alias.trim().length > 0 ? alias.trim() : null;
    state.updatedAt = now();
    return repo.save(state);
  },
  listFolders: async (profileId: number, boardId: number) => {
    return dataSource.getRepository(ChatFolder).find({
      where: { profileId, boardId },
      order: { updatedAt: "DESC" },
    });
  },
  createFolder: async (profileId: number, boardId: number, name: string) => {
    const folderRepo = dataSource.getRepository(ChatFolder);
    return folderRepo.save(folderRepo.create({
      profileId,
      boardId,
      name: name.trim(),
      createdAt: now(),
      updatedAt: now(),
    }));
  },
  renameFolder: async (profileId: number, folderId: number, name: string) => {
    const folderRepo = dataSource.getRepository(ChatFolder);
    const folder = await folderRepo.findOne({ where: { id: folderId, profileId } });
    if (!folder) return null;
    folder.name = name.trim();
    folder.updatedAt = now();
    return folderRepo.save(folder);
  },
  deleteFolder: async (profileId: number, folderId: number) => {
    const folderRepo = dataSource.getRepository(ChatFolder);
    const folder = await folderRepo.findOne({ where: { id: folderId, profileId } });
    if (!folder) return false;
    await dataSource.getRepository(ProfileThreadState).update({ profileId, folderId }, { folderId: null, updatedAt: now() });
    await folderRepo.delete({ id: folder.id });
    return true;
  },
  assignThreadFolder: async (profileId: number, threadId: number, folderId: number | null) => {
    const repo = dataSource.getRepository(ProfileThreadState);
    let state = await repo.findOne({ where: { profileId, threadId } });
    if (!state) {
      state = repo.create({
        profileId,
        threadId,
        lastSeenPostId: null,
        lastSeenAt: null,
        hidden: false,
        alias: null,
        folderId: null,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    state.folderId = folderId;
    state.updatedAt = now();
    return repo.save(state);
  },
  addOwnPost: async (profileId: number, threadId: number, postId: number) => {
    const repo = dataSource.getRepository(ProfileOwnPost);
    const exists = await repo.findOne({ where: { profileId, postId } });
    if (exists) {
      return exists;
    }
    return repo.save(repo.create({
      profileId,
      threadId,
      postId,
      createdAt: now(),
    }));
  },
});

