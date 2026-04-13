import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatProfile } from "./ChatProfile";
import { Board } from "./Board";

@Entity("ChatFolder")
export class ChatFolder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  profileId!: number;

  @ManyToOne(() => ChatProfile, (profile: ChatProfile) => profile.folders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profileId" })
  profile!: ChatProfile;

  @Column({ type: "bigint" })
  boardId!: number;

  @ManyToOne(() => Board, { onDelete: "CASCADE" })
  @JoinColumn({ name: "boardId" })
  board!: Board;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "integer" })
  createdAt!: number;

  @Column({ type: "integer" })
  updatedAt!: number;
}

