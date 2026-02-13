import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class KafkaFilePassportBoardPost1700000000001 implements MigrationInterface {
  name = "KafkaFilePassportBoardPost1700000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // File (chan.files)
    await queryRunner.createTable(
      new Table({
        name: "File",
        columns: [
          { name: "id", type: "text", isPrimary: true },
          { name: "cid", type: "text", isNullable: false },
        ],
      }),
      true
    );

    // Passport (chan.passports)
    await queryRunner.createTable(
      new Table({
        name: "Passport",
        columns: [{ name: "id", type: "text", isPrimary: true }],
      }),
      true
    );

    // Board: unique tag (for Kafka lookup), optional legal
    await queryRunner.createUniqueConstraint(
      "Board",
      new TableUnique({ columnNames: ["tag"], name: "UQ_Board_tag" })
    );
    await queryRunner.addColumn(
      "Board",
      new TableColumn({ name: "legal", type: "integer", isNullable: true })
    );

    // Post: legacyId (Kafka), boardId nullable (Kafka create before migration)
    await queryRunner.addColumn(
      "Post",
      new TableColumn({ name: "legacyId", type: "integer", isNullable: true })
    );

    // SQLite: make boardId nullable by recreating Post
    await queryRunner.query("PRAGMA foreign_keys=OFF");
    await queryRunner.query(
      `CREATE TABLE "Post_new" (
        "id" bigint NOT NULL PRIMARY KEY,
        "poster" text NOT NULL,
        "posterVerified" integer NOT NULL,
        "subject" text NOT NULL,
        "message" text NOT NULL,
        "messageTruncated" text NOT NULL,
        "timestamp" integer NOT NULL,
        "updatedAt" integer NOT NULL,
        "boardId" bigint,
        "parentId" bigint,
        "legacyId" integer
      )`
    );
    await queryRunner.query(
      `INSERT INTO Post_new (id, poster, posterVerified, subject, message, messageTruncated, timestamp, updatedAt, boardId, parentId, legacyId)
       SELECT id, poster, posterVerified, subject, message, messageTruncated, timestamp, updatedAt, boardId, parentId, legacyId FROM Post`
    );
    await queryRunner.query("DROP TABLE Post");
    await queryRunner.query("ALTER TABLE Post_new RENAME TO Post");
    await queryRunner.createForeignKey(
      "Post",
      new TableForeignKey({
        columnNames: ["boardId"],
        referencedTableName: "Board",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      })
    );
    await queryRunner.createForeignKey(
      "Post",
      new TableForeignKey({
        columnNames: ["parentId"],
        referencedTableName: "Post",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      })
    );
    await queryRunner.query("PRAGMA foreign_keys=ON");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("File");
    await queryRunner.dropTable("Passport");
    await queryRunner.dropUniqueConstraint("Board", "UQ_Board_tag");
    await queryRunner.dropColumn("Board", "legal");
    await queryRunner.dropColumn("Post", "legacyId");
    // Revert Post.boardId to NOT NULL would require table recreate - skip
  }
}
