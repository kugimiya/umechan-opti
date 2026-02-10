export type ResponseMedia = {
  link: string;
  preview: string;
};

export type ResponsePost = {
  id: number;
  board_id: number;
  poster: string;
  is_verify: boolean;
  message: string;
  truncated_message: string;
  subject: string;
  timestamp: number;
  parent_id: number | null;
  updated_at: number;
  replies: ResponsePost[];
  media?: {
    images?: ResponseMedia[];
    youtubes?: ResponseMedia[];
    videos?: ResponseMedia[];
  };
};

export type ResponseThreadsList = {
  posts: ResponsePost[];
};
