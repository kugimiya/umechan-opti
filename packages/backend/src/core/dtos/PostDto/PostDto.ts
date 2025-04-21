import { MediaType, TableMedia, TablePosts } from "../../../types/Tables";
import { PostMedia, PostMediaType } from "./types";

const dbMediaType2DtoMediaType: Record<MediaType, PostMediaType> = {
  [MediaType.Video]: PostMediaType.VIDEO,
  [MediaType.YouTube]: PostMediaType.YOUTUBE,
  [MediaType.Image]: PostMediaType.PISSYKAKA_IMAGE,
};

export class PostDto {
  public id: number;
  public board_tag: string;
  public parent_id?: number;
  public poster: string;
  public poster_verified: boolean;
  public post_subject: string;
  public post_message: string;
  public created_at: number;
  public replies_total?: number;
  public replies?: PostDto[];
  public media?: PostMedia[];

  constructor(db_post: TablePosts & { replies?: TablePosts[], replies_total?: number, media?: TableMedia[] }) {
    this.id = db_post.id;
    this.board_tag = db_post.tag;
    this.poster = db_post.poster;
    this.poster_verified = db_post.is_verify;
    this.post_subject = db_post.subject.trim();
    this.post_message = db_post.message.trim();
    this.created_at = db_post.timestamp;
    this.replies = db_post.replies?.map((reply) => new PostDto(reply));
    this.replies_total = db_post.replies_total;
    this.media = (db_post.media ?? []).map((rawMedia) => ({
      type: dbMediaType2DtoMediaType[rawMedia.media_type],
      media_url: rawMedia.original_path,
      preview_image_url: rawMedia.thumbnail_path,
    }));

    if (db_post.parent_id) {
      this.parent_id = db_post.parent_id;
    }
  }
}
