import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Post } from "./Post";
import { bigintTransformer } from "../transformers";

@Entity("Board")
export class Board {
  @PrimaryColumn({ type: "bigint", transformer: bigintTransformer })
  id!: number;

  @Column({ type: "text" })
  tag!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "boolean", default: true })
  isPublic!: boolean;

  @Column({ type: "integer", default: 0 })
  updatedAt!: number;

  @Column({ type: "integer", default: 0 })
  revision!: number;

  @Column({ type: "text", nullable: true })
  originNodeId!: string | null;

  @OneToMany(() => Post, (post: Post) => post.board)
  posts!: Post[];
}
