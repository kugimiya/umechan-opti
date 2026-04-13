import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from "typeorm";

export class ChatState1700000000002 implements MigrationInterface {
  name = "ChatState1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "ChatProfile",
      columns: [
        { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
        { name: "token", type: "text", isNullable: false },
        { name: "passphraseHash", type: "text", isNullable: false },
        { name: "createdAt", type: "integer", isNullable: false },
        { name: "updatedAt", type: "integer", isNullable: false },
      ],
    }), true);
    await queryRunner.createUniqueConstraint("ChatProfile", new TableUnique({ name: "UQ_ChatProfile_token", columnNames: ["token"] }));
    await queryRunner.createUniqueConstraint("ChatProfile", new TableUnique({ name: "UQ_ChatProfile_passphraseHash", columnNames: ["passphraseHash"] }));

    await queryRunner.createTable(new Table({
      name: "ChatFolder",
      columns: [
        { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
        { name: "profileId", type: "integer", isNullable: false },
        { name: "boardId", type: "bigint", isNullable: false },
        { name: "name", type: "text", isNullable: false },
        { name: "createdAt", type: "integer", isNullable: false },
        { name: "updatedAt", type: "integer", isNullable: false },
      ],
    }), true);
    await queryRunner.createForeignKey("ChatFolder", new TableForeignKey({
      columnNames: ["profileId"],
      referencedTableName: "ChatProfile",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createForeignKey("ChatFolder", new TableForeignKey({
      columnNames: ["boardId"],
      referencedTableName: "Board",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createIndex("ChatFolder", new TableIndex({ name: "IDX_ChatFolder_profile_board", columnNames: ["profileId", "boardId"] }));

    await queryRunner.createTable(new Table({
      name: "ProfileThreadState",
      columns: [
        { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
        { name: "profileId", type: "integer", isNullable: false },
        { name: "threadId", type: "bigint", isNullable: false },
        { name: "lastSeenPostId", type: "bigint", isNullable: true },
        { name: "lastSeenAt", type: "integer", isNullable: true },
        { name: "hidden", type: "boolean", isNullable: false, default: 0 },
        { name: "alias", type: "text", isNullable: true },
        { name: "folderId", type: "integer", isNullable: true },
        { name: "createdAt", type: "integer", isNullable: false },
        { name: "updatedAt", type: "integer", isNullable: false },
      ],
    }), true);
    await queryRunner.createForeignKey("ProfileThreadState", new TableForeignKey({
      columnNames: ["profileId"],
      referencedTableName: "ChatProfile",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createForeignKey("ProfileThreadState", new TableForeignKey({
      columnNames: ["threadId"],
      referencedTableName: "Post",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createForeignKey("ProfileThreadState", new TableForeignKey({
      columnNames: ["folderId"],
      referencedTableName: "ChatFolder",
      referencedColumnNames: ["id"],
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createUniqueConstraint("ProfileThreadState", new TableUnique({
      name: "UQ_ProfileThreadState_profile_thread",
      columnNames: ["profileId", "threadId"],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("ProfileThreadState", true);
    await queryRunner.dropTable("ChatFolder", true);
    await queryRunner.dropTable("ChatProfile", true);
  }
}

