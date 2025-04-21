export type TableBoards = {
  id: number;
  tag: string;
  name: string;
};

export type TablePosts = {
  id: number;
  board_id: number;
  tag: string;
  poster: string;
  subject: string;
  message: string;
  timestamp: number;
  updated_at: number;
  parent_id: number | null;
  is_verify: boolean;
};

export type TableSettings = {
  id: number;
  name: string;
  value: string;
  type: SettingType;
};

export enum SettingType {
  Number = 0,
  String = 1,
  Boolean = 2,
  DateString = 3,
  DateTimestamp = 4
}

export type TableEvents = {
  id: number;
  event_type: EventType;
  timestamp: number;
  post_id: number;
  board_id: number;
}

export enum EventType {
  PostCreated = 'PostCreated',
  PostDeleted = 'PostDeleted',
  BoardUpdateTriggered = 'BoardUpdateTriggered',
  ThreadUpdateTriggered = 'ThreadUpdateTriggered',
}

export enum MediaType {
  Image = 'image',
  YouTube = 'youtube',
  Video = 'video',
}

export type TableMedia = {
  id: number;
  post_id: number;
  media_type: MediaType;
  thumbnail_path: string;
  original_path: string;
}
