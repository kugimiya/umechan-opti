import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("File")
export class File {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text" })
  cid!: string;
}
