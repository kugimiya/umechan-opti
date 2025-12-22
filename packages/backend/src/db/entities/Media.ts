import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Post } from "./Post";
import { bigintTransformer } from "../transformers";

@Entity("Media")
export class Media {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, type: "text" })
  urlOrigin!: string | null;

  @Column({ nullable: true, type: "text" })
  urlPreview!: string | null;

  @Column({ type: "text" })
  mediaType!: string;

  @ManyToOne(() => Post, (post: Post) => post.media)
  @JoinColumn({ name: "postId" })
  post!: Post | null;

  @Column({ nullable: true, type: "bigint", transformer: bigintTransformer })
  postId!: number | null;
}

