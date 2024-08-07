export type EpdsResponseBoards = EpdsBoard[];
export type EpdsResponseBoardThreads = EpdsPost[];
export type EpdsResponseThread = EpdsPost;

export type EpdsBoard = {
  id: number;
  tag: string;
  name: string;
};

export type EpdsPost = {
  id: number;
  board_tag: string;
  parent_id?: number;
  poster: string;
  poster_verified: boolean;
  post_subject: string;
  post_message: string;
  created_at: number;
  replies_total?: number;
  replies?: EpdsPost[];
  media?: EpdsPostMedia[];
}

type EpdsPostMedia = {
  type: EpdsPostMediaType;
  media_url: string;
  preview_image_url?: string;
}

export enum EpdsPostMediaType {
  PISSYKAKA_IMAGE = 0,
  YOUTUBE = 1,
}
