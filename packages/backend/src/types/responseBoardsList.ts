export type ResponseBoard = {
  id: number;
  tag: string;
  name: string;
  is_public: boolean;
};

export type ResponseBoardsList = {
  boards: ResponseBoard[];
};
