import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProfileThreadState } from "./ProfileThreadState";
import { ChatFolder } from "./ChatFolder";

@Entity("ChatProfile")
@Index("UQ_ChatProfile_syncId", ["syncId"], { unique: true })
export class ChatProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  syncId!: string;

  @Column({ type: "text", unique: true })
  token!: string;

  @Column({ type: "text", unique: true })
  passphraseHash!: string;

  @Column({ type: "integer" })
  createdAt!: number;

  @Column({ type: "integer" })
  updatedAt!: number;

  @Column({ type: "integer", default: 0 })
  revision!: number;

  @Column({ type: "text", nullable: true })
  originNodeId!: string | null;

  @OneToMany(() => ProfileThreadState, (item: ProfileThreadState) => item.profile)
  threadStates!: ProfileThreadState[];

  @OneToMany(() => ChatFolder, (item: ChatFolder) => item.profile)
  folders!: ChatFolder[];
}
