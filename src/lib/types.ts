export type BoardApiResponse<T> = {
  payload: T;
  version: string;
  error: null;
};

export type BoardAll = {
  boards: Board[];
  posts: Post[];
};

export type Board = {
  id: number;
  tag: string;
  name: string;
};

export type Post = {
  id: number;
  poster: Poster;
  subject: Subject;
  message: string;
  timestamp: number;
  parent_id: number | null;
  is_verify: boolean;
  tag: Tag;
};

type Poster = string;
type Subject = string;
type Tag = string;
type Name = string;

export type AllPosts = {
  count: number;
  posts: AllPostsPost[];
};

export type AllPostsPost = {
  id: number;
  poster: Poster;
  subject: string;
  message: string;
  timestamp: number;
  board: PostBoardAggregated;
  parent_id: number | null;
  updated_at: number;
  estimate: number;
  replies: AllPostsPost[];
  replies_count: number;
  is_verify: boolean;
  board_id: number;
  media: Media;
  truncated_message: string;
  datetime: string;
};

export type PostBoardAggregated = {
  id: number;
  tag: Tag;
  name: Name;
  threads_count: number;
  new_posts_count: number;
};

export type Media = {
  images: Image[];
  youtubes: Image[];
};

export type Image = {
  link: string;
  preview: string;
};
