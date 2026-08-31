import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { Post } from "./Post";
import { bigintTransformer } from "../transformers";

@Entity("Media")
@Index("UQ_Media_syncId", ["syncId"], { unique: true })
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  syncId!: string;

  @Column({ nullable: true, type: "text" })
  urlOrigin!: string | null;

  @Column({ nullable: true, type: "text" })
  urlPreview!: string | null;

  @Column({ nullable: true, type: "text" })
  localPath!: string | null;

  @Column({ nullable: true, type: "text" })
  localPreviewPath!: string | null;

  @Column({ type: "text", nullable: true })
  contentSha256!: string | null;

  @Column({ type: "text", nullable: true })
  previewSha256!: string | null;

  @Column({ type: "text" })
  mediaType!: string;

  @Column({ type: "integer", default: 0 })
  updatedAt!: number;

  @Column({ type: "integer", default: 0 })
  revision!: number;

  @Column({ type: "text", nullable: true })
  originNodeId!: string | null;

  @ManyToOne(() => Post, (post: Post) => post.media)
  @JoinColumn({ name: "postId" })
  post!: Post | null;

  @Column({ nullable: true, type: "bigint", transformer: bigintTransformer })
  postId!: number | null;
}
