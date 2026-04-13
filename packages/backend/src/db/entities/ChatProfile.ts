import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProfileThreadState } from "./ProfileThreadState";
import { ChatFolder } from "./ChatFolder";

@Entity("ChatProfile")
export class ChatProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text", unique: true })
  token!: string;

  @Column({ type: "text", unique: true })
  passphraseHash!: string;

  @Column({ type: "integer" })
  createdAt!: number;

  @Column({ type: "integer" })
  updatedAt!: number;

  @OneToMany(() => ProfileThreadState, (item: ProfileThreadState) => item.profile)
  threadStates!: ProfileThreadState[];

  @OneToMany(() => ChatFolder, (item: ChatFolder) => item.profile)
  folders!: ChatFolder[];
}

