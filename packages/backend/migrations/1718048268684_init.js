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
  pgm.createTable("boards", {
    id: { type: "integer", primaryKey: true },
    tag: "varchar(16)",
    name: "varchar(64)",
  });

  pgm.createTable("posts", {
    id: { type: "integer", primaryKey: true },
    board_id: "integer",
    poster: "varchar(128)",
    subject: "text",
    message: "text",
    timestamp: "integer",
    parent_id: "integer",
    is_verify: "boolean",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("boards", { cascade: true });
  pgm.dropTable("posts", { cascade: true });
};
