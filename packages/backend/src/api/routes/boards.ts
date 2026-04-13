import { FastifyInstance, FastifyRequest } from "fastify";
import type { DbConnection } from "../../db/connection";

const CHAT_COOKIE_NAME = "umechan_chat_profile";
const identifyRateLimit = new Map<string, number[]>();

const readCookie = (cookieHeader: string | undefined, cookieName: string): string | null => {
  if (!cookieHeader) return null;
  const chunks = cookieHeader.split(";").map((item) => item.trim());
  for (const chunk of chunks) {
    const [key, ...rest] = chunk.split("=");
    if (key === cookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
};

const getProfileToken = (request: FastifyRequest, fallbackToken?: string): string => {
  const fromCookie = readCookie(request.headers.cookie, CHAT_COOKIE_NAME);
  if (fromCookie) return fromCookie;
  return String(fallbackToken ?? "");
};

export const bindBoardsRoutes = (fastify: FastifyInstance, db: DbConnection) => {
  type ReqBoardsList = FastifyRequest<{ Querystring: { unmod?: string } }>;
  fastify.get('/api/v2/boards', async (request: ReqBoardsList, reply) => {
    const boards = await db.apis.boards.getAll(request.query.unmod !== 'true');
    reply.send({ items: boards });
  });

  type ReqBoard = FastifyRequest<{ Querystring: { unmod?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/board/:boardTag', async (request: ReqBoard, reply) => {
    const board = await db.apis.boards.getByTag(request.query.unmod !== 'true', request.params.boardTag);
    reply.send({ item: board });
  });

  type ReqBoardThreads = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/board/:boardTag/threads', async (request: ReqBoardThreads, reply) => {
    const threads = await db.apis.threads.getByBoardTag(
      request.query.unmod !== 'true',
      request.params.boardTag,
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threadsCount = await db.apis.threads.getCountByBoardTag(request.query.unmod !== 'true', request.params.boardTag);

    reply.send({ items: threads, count: threadsCount });
  });

  type ReqThread = FastifyRequest<{ Querystring: { unmod?: string }, Params: { postId: string } }>;
  fastify.get('/api/v2/thread/:postId', async (request: ReqThread, reply) => {
    const data = await db.apis.threads.getById(
      request.query.unmod !== 'true',
      Number(request.params.postId)
    );
    reply.send({ item: data });
  });

  type ReqPostById = FastifyRequest<{ Querystring: { unmod?: string }, Params: { postId: string } }>;
  fastify.get('/api/v2/post/:postId', async (request: ReqPostById, reply) => {
    const data = await db.apis.posts.getById(
      request.query.unmod !== 'true',
      Number(request.params.postId)
    );
    reply.send({ item: data });
  });

  type ReqFeed = FastifyRequest<{ Querystring: { unmod?: string, offset?: string, limit?: string, thread_size?: string } }>;
  fastify.get('/api/v2/feed', async (request: ReqFeed, reply) => {
    const data = await db.apis.feed.getAll(
      request.query.unmod !== 'true',
      Number(request.query.offset) || undefined,
      Number(request.query.limit) || undefined,
      Number(request.query.thread_size) || undefined,
    );
    const threadsCount = await db.apis.feed.getCount(request.query.unmod !== 'true');

    reply.send({ items: data, count: threadsCount });
  });

  type ReqChatIdentify = FastifyRequest<{ Body: { passphrase?: string } }>;
  fastify.post('/api/v2/chat/identify', async (request: ReqChatIdentify, reply) => {
    const identity = request.ip ?? "unknown";
    const now = Date.now();
    const history = (identifyRateLimit.get(identity) ?? []).filter((ts) => now - ts < 60_000);
    if (history.length >= 10) {
      reply.status(429).send({ error: "too many identify attempts" });
      return;
    }
    identifyRateLimit.set(identity, [...history, now]);

    const passphrase = String(request.body?.passphrase ?? "").trim();
    if (passphrase.length < 3) {
      reply.status(400).send({ error: "passphrase is too short" });
      return;
    }
    const profile = await db.chat.identify(passphrase);
    reply.header("Set-Cookie", `${CHAT_COOKIE_NAME}=${encodeURIComponent(profile.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    reply.send({ profileToken: profile.token, ok: true });
  });

  fastify.get('/api/v2/chat/session', async (request, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request));
    if (!profile) {
      reply.status(401).send({ ok: false });
      return;
    }
    reply.send({ ok: true });
  });

  type ReqChatBoardThreads = FastifyRequest<{ Querystring: { profileToken?: string, offset?: string, limit?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/chat/board/:boardTag/threads', async (request: ReqChatBoardThreads, reply) => {
    const profileToken = getProfileToken(request, request.query.profileToken);
    const profile = await db.chat.profileByToken(profileToken);
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }

    const board = await db.boards.findByTag(request.params.boardTag);
    if (!board) {
      reply.status(404).send({ error: "board not found" });
      return;
    }

    const offset = Number(request.query.offset) || 0;
    const limit = Number(request.query.limit) || undefined;
    const threads = await db.chat.listThreadsByBoard(request.params.boardTag, offset, limit);
    const count = await db.chat.countThreadsByBoard(request.params.boardTag);
    const threadIds = threads.map((item) => Number(item.id));
    const states = await db.chat.listStatesByProfileAndThreads(profile.id, threadIds);
    const folders = await db.chat.listFolders(profile.id, board.id);
    const statesMap = new Map(states.map((item) => [item.threadId, item]));

    const responseItems = await Promise.all(threads.map(async (thread) => {
      const state = statesMap.get(thread.id);
      const lastSeenPostId = Number(state?.lastSeenPostId ?? 0);
      const unreadCounter = await db.chat.unreadCountForThread(profile.id, thread.id, lastSeenPostId);
      const displayTitle = state?.alias?.trim() || thread.subject?.trim() || `Thread #${thread.id}`;
      return {
        ...thread,
        unreadCounter,
        isNewThread: state?.lastSeenPostId == null,
        isHidden: Boolean(state?.hidden),
        alias: state?.alias ?? null,
        folderId: state?.folderId ?? null,
        displayTitle,
      };
    }));

    reply.send({
      items: responseItems.filter((item) => !item.isHidden),
      hiddenItems: responseItems.filter((item) => item.isHidden),
      count,
      folders: folders.map((item) => ({ id: item.id, name: item.name, boardId: item.boardId })),
    });
  });

  type ReqChatThread = FastifyRequest<{ Querystring: { profileToken?: string }, Params: { postId: string } }>;
  fastify.get('/api/v2/chat/thread/:postId', async (request: ReqChatThread, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.query.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const thread = await db.chat.threadWithReplies(Number(request.params.postId));
    if (!thread) {
      reply.status(404).send({ error: "thread not found" });
      return;
    }
    const lastPostId = Number(thread.replies?.length ? thread.replies[thread.replies.length - 1].id : thread.id);
    await db.chat.markThreadRead(profile.id, thread.id, lastPostId);
    reply.send({ item: thread });
  });

  type ReqChatMarkRead = FastifyRequest<{ Body: { profileToken?: string }, Params: { postId: string } }>;
  fastify.post('/api/v2/chat/thread/:postId/read', async (request: ReqChatMarkRead, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const thread = await db.chat.threadWithReplies(Number(request.params.postId));
    if (!thread) {
      reply.status(404).send({ error: "thread not found" });
      return;
    }
    const lastPostId = Number(thread.replies?.length ? thread.replies[thread.replies.length - 1].id : thread.id);
    await db.chat.markThreadRead(profile.id, thread.id, lastPostId);
    reply.send({ ok: true });
  });

  type ReqChatMarkAllRead = FastifyRequest<{ Body: { profileToken?: string }, Params: { boardTag: string } }>;
  fastify.post('/api/v2/chat/board/:boardTag/read_all', async (request: ReqChatMarkAllRead, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    await db.chat.markAllReadByBoard(profile.id, request.params.boardTag);
    reply.send({ ok: true });
  });

  type ReqChatSetHidden = FastifyRequest<{ Body: { profileToken?: string, hidden?: boolean }, Params: { postId: string } }>;
  fastify.post('/api/v2/chat/thread/:postId/hidden', async (request: ReqChatSetHidden, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    await db.chat.setHidden(profile.id, Number(request.params.postId), Boolean(request.body?.hidden));
    reply.send({ ok: true });
  });

  type ReqChatSetAlias = FastifyRequest<{ Body: { profileToken?: string, alias?: string | null }, Params: { postId: string } }>;
  fastify.post('/api/v2/chat/thread/:postId/alias', async (request: ReqChatSetAlias, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    await db.chat.setAlias(profile.id, Number(request.params.postId), request.body?.alias ?? null);
    reply.send({ ok: true });
  });

  type ReqChatFolders = FastifyRequest<{ Querystring: { profileToken?: string }, Params: { boardTag: string } }>;
  fastify.get('/api/v2/chat/board/:boardTag/folders', async (request: ReqChatFolders, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.query.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const board = await db.boards.findByTag(request.params.boardTag);
    if (!board) {
      reply.status(404).send({ error: "board not found" });
      return;
    }
    const items = await db.chat.listFolders(profile.id, board.id);
    reply.send({ items });
  });

  type ReqChatCreateFolder = FastifyRequest<{ Body: { profileToken?: string, name?: string }, Params: { boardTag: string } }>;
  fastify.post('/api/v2/chat/board/:boardTag/folders', async (request: ReqChatCreateFolder, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const board = await db.boards.findByTag(request.params.boardTag);
    if (!board) {
      reply.status(404).send({ error: "board not found" });
      return;
    }
    const name = String(request.body?.name ?? "").trim();
    if (!name) {
      reply.status(400).send({ error: "folder name is required" });
      return;
    }
    const item = await db.chat.createFolder(profile.id, board.id, name);
    reply.send({ item });
  });

  type ReqChatRenameFolder = FastifyRequest<{ Body: { profileToken?: string, name?: string }, Params: { folderId: string } }>;
  fastify.put('/api/v2/chat/folder/:folderId', async (request: ReqChatRenameFolder, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const name = String(request.body?.name ?? "").trim();
    if (!name) {
      reply.status(400).send({ error: "folder name is required" });
      return;
    }
    const folder = await db.chat.renameFolder(profile.id, Number(request.params.folderId), name);
    if (!folder) {
      reply.status(404).send({ error: "folder not found" });
      return;
    }
    reply.send({ item: folder });
  });

  type ReqChatDeleteFolder = FastifyRequest<{ Body: { profileToken?: string }, Params: { folderId: string } }>;
  fastify.delete('/api/v2/chat/folder/:folderId', async (request: ReqChatDeleteFolder, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const ok = await db.chat.deleteFolder(profile.id, Number(request.params.folderId));
    if (!ok) {
      reply.status(404).send({ error: "folder not found" });
      return;
    }
    reply.send({ ok: true });
  });

  type ReqChatAssignFolder = FastifyRequest<{ Body: { profileToken?: string, folderId?: number | null }, Params: { postId: string } }>;
  fastify.post('/api/v2/chat/thread/:postId/folder', async (request: ReqChatAssignFolder, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    await db.chat.assignThreadFolder(profile.id, Number(request.params.postId), request.body?.folderId ?? null);
    reply.send({ ok: true });
  });

  type ReqChatOwnPost = FastifyRequest<{ Body: { profileToken?: string, threadId?: number, postId?: number } }>;
  fastify.post('/api/v2/chat/own_post', async (request: ReqChatOwnPost, reply) => {
    const profile = await db.chat.profileByToken(getProfileToken(request, request.body?.profileToken));
    if (!profile) {
      reply.status(401).send({ error: "invalid profile token" });
      return;
    }
    const threadId = Number(request.body?.threadId);
    const postId = Number(request.body?.postId);
    if (!threadId || !postId) {
      reply.status(400).send({ error: "threadId and postId are required" });
      return;
    }
    await db.chat.addOwnPost(profile.id, threadId, postId);
    reply.send({ ok: true });
  });
};
