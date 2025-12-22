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

  @OneToMany(() => Post, (post: Post) => post.board)
  posts!: Post[];
}

