import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lwwWins } from "./lww";
import { mediaSyncIdFromNaturalKey, newSyncId } from "./ids";
import { P2P_PROTOCOL_VERSION, P2P_REPLICATED_TABLES, isP2pReplicatedTable } from "./types";

describe("p2p protocol constants", () => {
  it("has protocol version 1", () => {
    assert.equal(P2P_PROTOCOL_VERSION, 1);
  });

  it("lists replicated tables", () => {
    assert.ok(P2P_REPLICATED_TABLES.includes("Board"));
    assert.ok(P2P_REPLICATED_TABLES.includes("ChatProfile"));
    assert.ok(P2P_REPLICATED_TABLES.includes("Media"));
    assert.equal(isP2pReplicatedTable("Settings"), false);
    assert.equal(isP2pReplicatedTable("SyncChangeLog"), false);
  });

  it("generates unique sync ids", () => {
    assert.notEqual(newSyncId(), newSyncId());
  });
});

describe("p2p LWW apply decision matrix", () => {
  it("accepts remote when local missing", () => {
    assert.equal(lwwWins(undefined, { updatedAt: 1, originNodeId: "r" }), true);
  });

  it("keeps local on equal updatedAt and higher local origin", () => {
    assert.equal(
      lwwWins({ updatedAt: 10, originNodeId: "z" }, { updatedAt: 10, originNodeId: "a" }),
      false,
    );
  });

  it("stable media sync ids match natural key", () => {
    const id = mediaSyncIdFromNaturalKey(1, "image", null);
    assert.match(id, /^[0-9a-f-]{36}$/i);
  });
});
