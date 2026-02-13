import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Board } from "./Board";
import { Media } from "./Media";
import { bigintTransformer } from "../transformers";

@Entity("Post")
export class Post {
  @PrimaryColumn({ type: "bigint", transformer: bigintTransformer })
  id!: number;

  @Column({ type: "text" })
  poster!: string;

  @Column({ type: "boolean" })
  posterVerified!: boolean;

  @Column({ type: "text" })
  subject!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({ type: "text" })
  messageTruncated!: string;

  @Column()
  timestamp!: number;

  @Column()
  updatedAt!: number;

  @ManyToOne(() => Board, (board: Board) => board.posts)
  @JoinColumn({ name: "boardId" })
  board!: Board | null;

  @Column({ nullable: true, type: "bigint", transformer: bigintTransformer })
  boardId!: number | null;

  @Column({ type: "integer", nullable: true })
  legacyId!: number | null;

  @OneToMany(() => Media, (media: Media) => media.post)
  media!: Media[];

  @Column({ nullable: true, type: "bigint", transformer: bigintTransformer })
  parentId!: number | null;

  @ManyToOne(() => Post, (post: Post) => post.replies)
  @JoinColumn({ name: "parentId" })
  parent!: Post | null;

  @OneToMany(() => Post, (post: Post) => post.parent)
  replies!: Post[];
}

