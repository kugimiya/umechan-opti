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
  pgm.createTable("moderated", {
    id: { type: "integer", primaryKey: true },
    record_type: "varchar(128)",
    timestamp: "integer",
    reason: "varchar(128)",
    post_id: { type: "integer", notNull: false },
    board_id: { type: "integer", notNull: false },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("moderated", { cascade: true });
};
