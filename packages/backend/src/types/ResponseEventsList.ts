export enum ResponseEventType {
  ThreadUpdateTriggered = "thread_update_triggered",
  PostCreated = "post_created",
}

export type ResponseEvent = {
  timestamp: number;
  event_type: ResponseEventType;
  post_id?: number;
};

export type ResponseEventsList = {
  events: ResponseEvent[];
};
