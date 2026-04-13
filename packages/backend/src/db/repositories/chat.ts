import { randomUUID, scryptSync } from "crypto";
import { DataSource, In } from "typeorm";
import { ChatProfile } from "../entities/ChatProfile";
import { ProfileThreadState } from "../entities/ProfileThreadState";
import { Post } from "../entities/Post";
import { Board } from "../entities/Board";
import { ChatFolder } from "../entities/ChatFolder";
import { defaultLimit } from "../../utils/config";
import { ProfileOwnPost } from "../entities/ProfileOwnPost";

const hashPassphrase = (passphrase: string) => {
  const salt = process.env.CHAT_PASSPHRASE_SALT ?? "umechan-chat";
  return scryptSync(passphrase.trim(), salt, 64).toString("hex");
};

const now = () => Date.now();

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

