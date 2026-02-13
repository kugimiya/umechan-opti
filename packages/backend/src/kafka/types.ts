/**
 * Типы событий по схемам из https://github.com/U-Me-Chan/raspredach-schemas
 * Топики: chan.boards, chan.posts, chan.files, chan.passports
 */

// --- chan.boards ---
export type BoardPayload = {
  tag: string;
  name: string;
  legal: boolean;
};

export type EventBoardCreate = {
  eventName: string;
  value: "EventBoardCreate";
  nodeSign: string;
  boardData: BoardPayload;
};

export type EventBoardDelete = {
  eventName: string;
  value: "EventBoardDelete";
  nodeSign: string;
  boardTag: string;
};

export type EventBoardModify = {
  eventName: string;
  value: "EventBoardModify";
  nodeSign: string;
  boardTag: string;
  boardData: Partial<BoardPayload>;
};

export type ChanBoardsEvent = EventBoardCreate | EventBoardDelete | EventBoardModify;

// --- chan.posts ---
export type PostId = string; // format ^[0-9]{12}$

export type PostPayload = {
  id: PostId;
  legacyId?: number;
};

export type CreateReplyOnThread = {
  eventName: string;
  value: "CreateReplyOnThread";
  nodeSign: string;
  postData: PostPayload;
};

export type EventPostDelete = {
  eventName: string;
  value: "EventPostDelete";
  nodeSign: string;
  postId: PostId;
};

export type EventPostModify = {
  eventName: string;
  value: "EventPostModify";
  nodeSign: string;
  postId: PostId;
  postData: Partial<PostPayload>;
};

export type EventPostBoardMigration = {
  eventName: string;
  value: "EventPostBoardMigration";
  nodeSign: string;
  postId: PostId;
  newBoardTag: string;
};

export type ChanPostsEvent =
  | CreateReplyOnThread
  | EventPostDelete
  | EventPostModify
  | EventPostBoardMigration;

// --- chan.files ---
export type FileId = string; // format ^(upload_time)-(node_id)$
export type CID = string;

export type FilePayload = {
  id: FileId;
  cid: CID;
};

export type EventFileCreate = {
  eventName: string;
  value: "EventFileCreate";
  nodeSign: string;
  fileData: FilePayload;
};

export type EventFileDelete = {
  eventName: string;
  value: "EventFileDelete";
  nodeSign: string;
  fileId: FileId;
};

export type EventFileModify = {
  eventName: string;
  value: "EventFileModify";
  nodeSign: string;
  fileId: FileId;
  fileData: Partial<FilePayload>;
};

export type ChanFilesEvent = EventFileCreate | EventFileDelete | EventFileModify;

// --- chan.passports ---
export type PassportId = string;

export type PassportPayload = {
  id: PassportId;
};

export type EventPassportCreate = {
  eventName: string;
  value: "EventPassportCreate";
  nodeSign: string;
  passportData: PassportPayload;
};

export type EventPassportDelete = {
  eventName: string;
  value: "EventPassportDelete";
  nodeSign: string;
  passportId: PassportId;
};

export type ChanPassportsEvent = EventPassportCreate | EventPassportDelete;

// Topic names
export const TOPIC_BOARDS = "chan.boards";
export const TOPIC_POSTS = "chan.posts";
export const TOPIC_FILES = "chan.files";
export const TOPIC_PASSPORTS = "chan.passports";
