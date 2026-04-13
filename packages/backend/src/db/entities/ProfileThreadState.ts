import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChatProfile } from "./ChatProfile";
import { Post } from "./Post";
import { ChatFolder } from "./ChatFolder";
import { bigintTransformer } from "../transformers";

@Entity("ProfileThreadState")
@Unique("UQ_ProfileThreadState_profile_thread", ["profileId", "threadId"])
export class ProfileThreadState {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  profileId!: number;

  @ManyToOne(() => ChatProfile, (profile: ChatProfile) => profile.threadStates, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profileId" })
  profile!: ChatProfile;

  @Column({ type: "bigint", transformer: bigintTransformer })
  threadId!: number;

  @ManyToOne(() => Post, { onDelete: "CASCADE" })
  @JoinColumn({ name: "threadId" })
  thread!: Post;

  @Column({ type: "bigint", transformer: bigintTransformer, nullable: true })
  lastSeenPostId!: number | null;

  @Column({ type: "integer", nullable: true })
  lastSeenAt!: number | null;

  @Column({ type: "boolean", default: false })
  hidden!: boolean;

  @Column({ type: "text", nullable: true })
  alias!: string | null;

  @Column({ nullable: true })
  folderId!: number | null;

  @ManyToOne(() => ChatFolder, { onDelete: "SET NULL" })
  @JoinColumn({ name: "folderId" })
  folder!: ChatFolder | null;

  @Column({ type: "integer" })
  createdAt!: number;

  @Column({ type: "integer" })
  updatedAt!: number;
}

