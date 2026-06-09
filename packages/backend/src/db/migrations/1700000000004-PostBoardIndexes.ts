import { MigrationInterface, QueryRunner, TableIndex } from "typeorm";

export class PostBoardIndexes1700000000004 implements MigrationInterface {
  name = "PostBoardIndexes1700000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      "Post",
      new TableIndex({ name: "IDX_Post_parentId", columnNames: ["parentId"] }),
    );
    await queryRunner.createIndex(
      "Post",
      new TableIndex({ name: "IDX_Post_parentId_id", columnNames: ["parentId", "id"] }),
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_Post_boardId_updatedAt_threads" ON "Post" ("boardId", "updatedAt" DESC) WHERE "parentId" IS NULL`,
    );
    await queryRunner.createIndex(
      "Board",
      new TableIndex({ name: "IDX_Board_tag", columnNames: ["tag"] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("Board", "IDX_Board_tag");
    await queryRunner.dropIndex("Post", "IDX_Post_boardId_updatedAt_threads");
    await queryRunner.dropIndex("Post", "IDX_Post_parentId_id");
    await queryRunner.dropIndex("Post", "IDX_Post_parentId");
  }
}
