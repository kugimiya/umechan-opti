import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("SyncChangeLog")
@Index("IDX_SyncChangeLog_createdAt", ["createdAt"])
@Index("IDX_SyncChangeLog_table_key", ["tableName", "recordKey"])
export class SyncChangeLog {
  @PrimaryGeneratedColumn({ type: "integer" })
  revision!: number;

  @Column({ type: "text" })
  tableName!: string;

  @Column({ type: "text" })
  recordKey!: string;

  @Column({ type: "text" })
  op!: "upsert" | "delete";

  @Column({ type: "text" })
  originNodeId!: string;

  @Column({ type: "integer" })
  updatedAt!: number;

  @Column({ type: "integer" })
  createdAt!: number;
}
