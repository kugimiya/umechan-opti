import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class BoardIsPublic1700000000008 implements MigrationInterface {
  name = "BoardIsPublic1700000000008";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "Board",
      new TableColumn({
        name: "isPublic",
        type: "boolean",
        default: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("Board", "isPublic");
  }
}
