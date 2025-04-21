import { ResponseBoard } from "./ResponseBoardsList";

export type ResponseThreadsList = {
  count: number;
  posts: ResponsePost[];
};

export type ResponsePost = {
  id: number;
  poster: string;
  subject: string;
  message: string;
  truncated_message: string;
  timestamp: string;
  updated_at: number;
  datetime: string;
  board: ResponseBoard;
  board_id: number;
  parent_id: null | number;
  estimate: number;
  replies: ResponsePost[];
  replies_count: number;
  is_verify: boolean;
  media?: {
    images?: ResponseMedia[];
    youtubes?: ResponseMedia[];
    videos?: ResponseMedia[];
  };
};

export type ResponseMedia = {
  link: string;
  preview: string;
};
