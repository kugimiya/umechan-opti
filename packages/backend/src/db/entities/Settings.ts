import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Settings")
export class Settings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  value!: string;

  @Column({ type: "text" })
  type!: string;
}

