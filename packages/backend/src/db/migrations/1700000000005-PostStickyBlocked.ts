import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class PostStickyBlocked1700000000005 implements MigrationInterface {
  name = "PostStickyBlocked1700000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "Post",
      new TableColumn({
        name: "isSticky",
        type: "boolean",
        default: false,
      }),
    );
    await queryRunner.addColumn(
      "Post",
      new TableColumn({
        name: "isBlocked",
        type: "boolean",
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("Post", "isBlocked");
    await queryRunner.dropColumn("Post", "isSticky");
  }
}
