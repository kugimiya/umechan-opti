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
  pgm.createIndex("boards", ["tag", "name"], { name: "boards_index", method: "btree" });
  pgm.createIndex("posts", ["board_id", "parent_id"], { name: "posts_by_boards_index", method: "btree" });
  pgm.createIndex("media", ["post_id"], { name: "media_by_posts", method: "btree" });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("boards", ["tag", "name"], { name: "boards_index" });
  pgm.dropIndex("posts", ["board_id", "parent_id"], { name: "posts_by_boards_index" });
  pgm.dropIndex("media", ["post_id"], { name: "media_by_posts" });
};
