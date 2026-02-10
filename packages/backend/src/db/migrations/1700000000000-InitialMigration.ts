import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class InitialMigration1700000000000 implements MigrationInterface {
  name = "InitialMigration1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу Board
    await queryRunner.createTable(
      new Table({
        name: "Board",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: "tag",
            type: "text",
            isNullable: false,
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Создаем таблицу Post
    await queryRunner.createTable(
      new Table({
        name: "Post",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: "poster",
            type: "text",
            isNullable: false,
          },
          {
            name: "posterVerified",
            type: "boolean",
            isNullable: false,
          },
          {
            name: "subject",
            type: "text",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "messageTruncated",
            type: "text",
            isNullable: false,
          },
          {
            name: "timestamp",
            type: "integer",
            isNullable: false,
          },
          {
            name: "updatedAt",
            type: "integer",
            isNullable: false,
          },
          {
            name: "boardId",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "parentId",
            type: "bigint",
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Создаем внешний ключ для Post.boardId -> Board.id
    await queryRunner.createForeignKey(
      "Post",
      new TableForeignKey({
        columnNames: ["boardId"],
        referencedColumnNames: ["id"],
        referencedTableName: "Board",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      })
    );

    // Создаем внешний ключ для Post.parentId -> Post.id
    await queryRunner.createForeignKey(
      "Post",
      new TableForeignKey({
        columnNames: ["parentId"],
        referencedColumnNames: ["id"],
        referencedTableName: "Post",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      })
    );

    // Создаем таблицу Media
    await queryRunner.createTable(
      new Table({
        name: "Media",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "urlOrigin",
            type: "text",
            isNullable: true,
          },
          {
            name: "urlPreview",
            type: "text",
            isNullable: true,
          },
          {
            name: "mediaType",
            type: "text",
            isNullable: false,
          },
          {
            name: "postId",
            type: "bigint",
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Создаем внешний ключ для Media.postId -> Post.id
    await queryRunner.createForeignKey(
      "Media",
      new TableForeignKey({
        columnNames: ["postId"],
        referencedColumnNames: ["id"],
        referencedTableName: "Post",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      })
    );

    // Создаем таблицу Settings
    await queryRunner.createTable(
      new Table({
        name: "Settings",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
          {
            name: "value",
            type: "text",
            isNullable: false,
          },
          {
            name: "type",
            type: "text",
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем таблицы в обратном порядке
    await queryRunner.dropTable("Settings");
    await queryRunner.dropTable("Media");
    await queryRunner.dropTable("Post");
    await queryRunner.dropTable("Board");
  }
}
