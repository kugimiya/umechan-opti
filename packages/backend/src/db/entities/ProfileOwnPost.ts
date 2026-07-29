import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChatProfile } from "./ChatProfile";
import { Post } from "./Post";
import { bigintTransformer } from "../transformers";

@Entity("ProfileOwnPost")
@Unique("UQ_ProfileOwnPost_profile_post", ["profileId", "postId"])
@Index("UQ_ProfileOwnPost_syncId", ["syncId"], { unique: true })
export class ProfileOwnPost {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  syncId!: string;

  @Column()
  profileId!: number;

  @ManyToOne(() => ChatProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profileId" })
  profile!: ChatProfile;

  @Column({ type: "bigint", transformer: bigintTransformer })
  threadId!: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "threadId" })
  thread!: Post;

  @Column({ type: "bigint", transformer: bigintTransformer })
  postId!: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post!: Post;

  @Column({ type: "integer" })
  createdAt!: number;

  @Column({ type: "integer", default: 0 })
  updatedAt!: number;

  @Column({ type: "integer", default: 0 })
  revision!: number;

  @Column({ type: "text", nullable: true })
  originNodeId!: string | null;
}
