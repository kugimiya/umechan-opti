export const p2pNodeId = (): string => process.env.P2P_NODE_ID?.trim() || "";

export const p2pSyncToken = (): string => process.env.P2P_SYNC_TOKEN?.trim() || "";

export const p2pUpstreamUrl = (): string | null => {
  const url = process.env.P2P_UPSTREAM_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
};

export const isP2pReplica = (): boolean => Boolean(p2pUpstreamUrl());

export const p2pControlListenHost = (): string =>
  process.env.P2P_CONTROL_LISTEN_HOST || "0.0.0.0";

export const p2pControlListenPort = (): number =>
  Number(process.env.P2P_CONTROL_LISTEN_PORT) || 3002;

export const p2pAdvertiseWsUrl = (): string =>
  process.env.P2P_ADVERTISE_WS_URL?.trim() ||
  `ws://127.0.0.1:${p2pControlListenPort()}/p2p/ws`;

export const p2pAdvertisePushUrl = (): string =>
  process.env.P2P_ADVERTISE_PUSH_URL?.trim() ||
  `http://127.0.0.1:${p2pControlListenPort()}/p2p/push`;

export const p2pChangelogMaxAgeDays = (): number =>
  Number(process.env.P2P_CHANGELOG_MAX_AGE_DAYS) || 2;

export const p2pChangelogMaxRows = (): number =>
  Number(process.env.P2P_CHANGELOG_MAX_ROWS) || 500_000;

export const p2pCallbackBaseUrl = (): string =>
  process.env.P2P_CALLBACK_BASE_URL?.trim() ||
  process.env.API_PUBLIC_BASE_URL?.replace(/\/api\/?$/, "") ||
  `http://127.0.0.1:${Number(process.env.API_DEFAULT_LISTEN_PORT) || 3000}`;

export const assertP2pIdentity = () => {
  if (!p2pNodeId()) {
    throw new Error("P2P_NODE_ID is required when p2p server/client is enabled");
  }
  if (!p2pSyncToken()) {
    throw new Error("P2P_SYNC_TOKEN is required when p2p server/client is enabled");
  }
};
