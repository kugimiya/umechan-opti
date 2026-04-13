import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class ProfileOwnPost1700000000003 implements MigrationInterface {
  name = "ProfileOwnPost1700000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: "ProfileOwnPost",
      columns: [
        { name: "id", type: "integer", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
        { name: "profileId", type: "integer", isNullable: false },
        { name: "threadId", type: "bigint", isNullable: false },
        { name: "postId", type: "bigint", isNullable: false },
        { name: "createdAt", type: "integer", isNullable: false },
      ],
    }), true);
    await queryRunner.createForeignKey("ProfileOwnPost", new TableForeignKey({
      columnNames: ["profileId"],
      referencedTableName: "ChatProfile",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createForeignKey("ProfileOwnPost", new TableForeignKey({
      columnNames: ["threadId"],
      referencedTableName: "Post",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createForeignKey("ProfileOwnPost", new TableForeignKey({
      columnNames: ["postId"],
      referencedTableName: "Post",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    }));
    await queryRunner.createUniqueConstraint("ProfileOwnPost", new TableUnique({
      name: "UQ_ProfileOwnPost_profile_post",
      columnNames: ["profileId", "postId"],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("ProfileOwnPost", true);
  }
}

