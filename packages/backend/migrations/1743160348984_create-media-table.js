/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createType("media_type_enum", [
    "image",
    "youtube",
    "video"
  ]);

  pgm.createTable("media", {
    id: { type: "serial", primaryKey: true },
    post_id: { type: "integer", notNull: true },
    media_type: "media_type_enum",
    thumbnail_path: "varchar(1024)",
    original_path: "varchar(1024)",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("media");
  pgm.dropType("media_type_enum");
};
