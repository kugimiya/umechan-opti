import { Entity, PrimaryColumn } from "typeorm";

@Entity("Passport")
export class Passport {
  @PrimaryColumn({ type: "text" })
  id!: string;
}
