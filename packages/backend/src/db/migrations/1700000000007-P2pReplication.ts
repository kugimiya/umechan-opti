import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from "typeorm";
import { randomUUID } from "crypto";

const addReplicationColumns = async (queryRunner: QueryRunner, table: string, withUpdatedAt: boolean) => {
  if (withUpdatedAt) {
    const hasUpdatedAt = await queryRunner.hasColumn(table, "updatedAt");
    if (!hasUpdatedAt) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "updatedAt", type: "integer", default: 0, isNullable: false }),
      );
    }
  }
  await queryRunner.addColumn(
    table,
    new TableColumn({ name: "revision", type: "integer", default: 0, isNullable: false }),
  );
  await queryRunner.addColumn(
    table,
    new TableColumn({ name: "originNodeId", type: "text", isNullable: true }),
  );
};

const backfillSyncIds = async (queryRunner: QueryRunner, table: string) => {
  const rows: Array<{ id: number }> = await queryRunner.query(`SELECT id FROM "${table}"`);
  for (const row of rows) {
    await queryRunner.query(`UPDATE "${table}" SET "syncId" = ? WHERE id = ?`, [randomUUID(), row.id]);
  }
};

export class P2pReplication1700000000007 implements MigrationInterface {
  name = "P2pReplication1700000000007";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "SyncChangeLog",
        columns: [
          { name: "revision", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
          { name: "tableName", type: "text", isNullable: false },
          { name: "recordKey", type: "text", isNullable: false },
          { name: "op", type: "text", isNullable: false },
          { name: "originNodeId", type: "text", isNullable: false },
          { name: "updatedAt", type: "integer", isNullable: false },
          { name: "createdAt", type: "integer", isNullable: false },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      "SyncChangeLog",
      new TableIndex({ name: "IDX_SyncChangeLog_createdAt", columnNames: ["createdAt"] }),
    );
    await queryRunner.createIndex(
      "SyncChangeLog",
      new TableIndex({ name: "IDX_SyncChangeLog_table_key", columnNames: ["tableName", "recordKey"] }),
    );

    await addReplicationColumns(queryRunner, "Board", true);
    await addReplicationColumns(queryRunner, "Post", false);

    await queryRunner.addColumn(
      "Media",
      new TableColumn({ name: "syncId", type: "text", isNullable: true }),
    );
    await queryRunner.addColumn(
      "Media",
      new TableColumn({ name: "contentSha256", type: "text", isNullable: true }),
    );
    await queryRunner.addColumn(
      "Media",
      new TableColumn({ name: "previewSha256", type: "text", isNullable: true }),
    );
    await addReplicationColumns(queryRunner, "Media", true);
    await backfillSyncIds(queryRunner, "Media");
    await queryRunner.query(`UPDATE "Media" SET "syncId" = lower(hex(randomblob(16))) WHERE "syncId" IS NULL`);
    // Ensure non-null then recreate uniqueness via index
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_Media_syncId" ON "Media" ("syncId")`);

    for (const table of ["ChatProfile", "ChatFolder", "ProfileThreadState", "ProfileOwnPost"]) {
      await queryRunner.addColumn(
        table,
        new TableColumn({ name: "syncId", type: "text", isNullable: true }),
      );
      await addReplicationColumns(queryRunner, table, table === "ProfileOwnPost");
      await backfillSyncIds(queryRunner, table);
      await queryRunner.query(
        `UPDATE "${table}" SET "syncId" = lower(hex(randomblob(16))) WHERE "syncId" IS NULL`,
      );
      await queryRunner.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_${table}_syncId" ON "${table}" ("syncId")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ["ChatProfile", "ChatFolder", "ProfileThreadState", "ProfileOwnPost", "Media"]) {
      await queryRunner.query(`DROP INDEX IF EXISTS "UQ_${table}_syncId"`);
      await queryRunner.dropColumn(table, "originNodeId");
      await queryRunner.dropColumn(table, "revision");
      if (table === "Media" || table === "ProfileOwnPost") {
        await queryRunner.dropColumn(table, "updatedAt");
      }
      await queryRunner.dropColumn(table, "syncId");
    }
    await queryRunner.dropColumn("Media", "previewSha256");
    await queryRunner.dropColumn("Media", "contentSha256");

    await queryRunner.dropColumn("Post", "originNodeId");
    await queryRunner.dropColumn("Post", "revision");
    await queryRunner.dropColumn("Board", "originNodeId");
    await queryRunner.dropColumn("Board", "revision");
    await queryRunner.dropColumn("Board", "updatedAt");

    await queryRunner.dropTable("SyncChangeLog");
  }
}
