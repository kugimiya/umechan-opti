export type Post = {
    id?: number;
    poster?: string;
    subject?: string;
    message?: string;
    truncated_message?: string;
    timestamp?: number;
    board_id?: number;
    parent_id?: null;
    updated_at?: number;
    estimate?: number;
    media?: Media;
    is_verify?: boolean;
    replies_count?: number;
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

export type ThreadData = Post & {
    replies: Post[];
};
