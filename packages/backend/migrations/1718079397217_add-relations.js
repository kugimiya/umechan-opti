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
  pgm.addConstraint("posts", "board_id_constraint", "foreign key (board_id) references boards (id)");
  pgm.addConstraint("posts", "parent_id_constraint", "foreign key (parent_id) references posts (id)");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint("posts", "board_id_constraint");
  pgm.dropConstraint("posts", "parent_id_constraint");
};
