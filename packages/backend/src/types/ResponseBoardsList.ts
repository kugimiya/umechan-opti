export type ResponseBoardsList = {
  boards: ResponseBoard[];
};

export type ResponseBoard = {
  id: number;
  tag: string;
  name: string;
  threads_count: number;
  new_posts_count: number;
};
