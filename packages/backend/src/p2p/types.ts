export const P2P_PROTOCOL_VERSION = 1;

export const P2P_REPLICATED_TABLES = [
  "Board",
  "Post",
  "Media",
  "ChatProfile",
  "ChatFolder",
  "ProfileThreadState",
  "ProfileOwnPost",
] as const;

export type P2pReplicatedTable = (typeof P2P_REPLICATED_TABLES)[number];

export type P2pChangeOp = "upsert" | "delete";

export type P2pChangePointer = {
  revision: number;
  table: P2pReplicatedTable | string;
  key: string;
  op: P2pChangeOp;
  originNodeId: string;
  updatedAt: number;
};

export type P2pMetaResponse = {
  nodeId: string;
  protocolVersion: number;
  schemaVersion: string;
  currentRevision: number;
  changelogOldestRevision: number;
  wsUrl: string;
  pushUrl: string;
};

export const isP2pReplicatedTable = (table: string): table is P2pReplicatedTable =>
  (P2P_REPLICATED_TABLES as readonly string[]).includes(table);
