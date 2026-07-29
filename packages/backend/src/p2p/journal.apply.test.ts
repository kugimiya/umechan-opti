import assert from "node:assert/strict";
import { describe, it } from "node:test";

const canOpenSqlite = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    const db = new Database(":memory:");
    db.close();
    return true;
  } catch {
    return false;
  }
};

/**
 * Full DB integration for journal/apply requires a working better-sqlite3 native binding.
 */
describe("p2p journal + apply integration", () => {
  it("skips or smokes journal when sqlite works", async () => {
    if (!canOpenSqlite()) {
      assert.ok(true, "better-sqlite3 native addon missing — skip DB integration");
      return;
    }
    const { DataSource } = await import("typeorm");
    const { SyncChangeLog } = await import("../db/entities/SyncChangeLog");
    const ds = new DataSource({
      type: "better-sqlite3",
      database: ":memory:",
      entities: [SyncChangeLog],
      synchronize: true,
    });
    await ds.initialize();
    const { logChanges, getCurrentRevision } = await import("./journal");
    await logChanges(ds, [
      { table: "Board", recordKey: "1", op: "upsert", updatedAt: 1, originNodeId: "n" },
    ]);
    assert.ok((await getCurrentRevision(ds)) >= 1);
    await ds.destroy();
  });
});
