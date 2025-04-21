export type ResponseEventsList = {
  count: number;
  posts: ResponseEvent[];
};

export enum ResponseEventType {
  PostCreated = 'PostCreated',
  PostDeleted = 'PostDeleted',
  BoardUpdateTriggered = 'BoardUpdateTriggered',
  ThreadUpdateTriggered = 'ThreadUpdateTriggered',
};

export type ResponseEvent = {
  id: number;
  event_type: ResponseEventType;
  timestamp: number;
  post_id: number | null;
  board_id: number | null;
};
