export type ResponseBoard = {
  id: number;
  tag: string;
  name: string;
};

export type ResponseBoardsList = {
  boards: ResponseBoard[];
};
