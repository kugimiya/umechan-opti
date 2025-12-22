export type EpdsResponseBoard = { item: EpdsBoard };
export type EpdsResponseBoards = { items: EpdsBoard[] };
export type EpdsResponseBoardThreads = { items: EpdsPost[], count: number };
export type EpdsResponseThread = { item: EpdsPost };
export type EpdsResponseFeed = { items: EpdsPost[], count: number };
export type EpdsResponsePostById = { item: EpdsPost };

export type EpdsBoard = {
  id: number;
  tag: string;
  name: string;
};

export type EpdsPost = {
  id: number;
  poster: string;
  posterVerified: boolean;
  subject: string;
  message: string;
  messageTruncated: string;
  timestamp: number;
  updatedAt: number;
  boardId: number;
  parentId: number | null;
  replies?: EpdsPost[];
  media?: EpdsPostMedia[];
  board: EpdsBoard;
  _count?: EpdsPostCount;
}

export type EpdsPostMedia = {
  id: number;
  urlOrigin: string;
  urlPreview: string;
  mediaType: EpdsPostMediaType;
  postId: number;
}

export enum EpdsPostMediaType {
  PISSYKAKA_IMAGE = 'image',
  YOUTUBE = 'youtube',
  VIDEO = 'video',
}

type EpdsPostCount = {
  media: number;
  replies: number;
}