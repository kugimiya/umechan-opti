export type Post = {
    id: string;
    poster: string;
    subject: string;
    message: string;
    timestamp: string;
    parent_id: string;
    tag: string;
};

export type ThreadData = Post & {
    replies: Post[];
};
