export type Board = {
  id: number;
  tag: string;
  name: string;
  threads_count: number;
};

export interface BoardData {
  count?: number;
  posts?: Post[];
}

export interface Post {
  id?: number;
  poster?: string;
  subject?: string;
  message?: string;
  timestamp?: number;
  board?: Board;
  parent_id?: number | null;
  updated_at?: number;
  estimate?: number;
  replies?: Post[];
  replies_count?: number;
  is_verify?: boolean;
  board_id?: number;
  media?: Media;
  truncated_message?: string;
  datetime?: Date;
}

export interface Media {
  images?: Image[];
  youtubes?: YouTube[];
}

export interface Image {
  link?: string;
  preview?: string;
}

export interface YouTube {
  link?: string;
  preview?: string;
}

export interface ThreadData extends Post {
  replies: Post[];
}

export interface RadioStatus {
  scheduling?: boolean;
  playing?: boolean;
  syncing?: boolean;
  streaming?: boolean;
  currentFile?: string;
  thumbnailPath?: string;
  fileData?: FileData;
  playlistData?: PlaylistData;
  currentPlaylistId?: string;
}

export interface FileData {
  filehash?: string;
  path?: string;
  name?: string;
  type?: string;
  id3Artist?: string;
  id3Title?: string;
  duration?: number;
  trimStart?: number;
  trimEnd?: number;
}

export interface PlaylistData {
  id?: number;
  name?: string;
  type?: string;
}
