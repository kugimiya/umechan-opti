export const pissykakaHostname = process.env.PISSYKAKA_HOSTNAME || "scheoble.xyz";
export const pissykakaApi = process.env.PISSYKAKA_API || "https://scheoble.xyz/api";
/** Seconds between periodic full sync runs (only when full sync is enabled). */
export const fullSyncIntervalSeconds = Number(process.env.FULL_SYNC_INTERVAL_SECONDS) || 3600; // 1 hour
export const fetchEntitiesFromApiBaseLimit = Number(process.env.FETCH_ENTITIES_FROM_API_BASE_LIMIT) || 20;
export const fetchEntitiesMaxParallelJobs = Number(process.env.FETCH_ENTITIES_MAX_PARALLEL_JOBS) || 10;

export const defaultLimit = Number(process.env.DEFAULT_LIMIT) || 20;
export const defaultThreadSize = Number(process.env.DEFAULT_THREAD_SIZE) || 5;

export const apiDefaultListenPort = Number(process.env.API_DEFAULT_LISTEN_PORT) || 3000;
export const apiDefaultListenHost = process.env.API_DEFAULT_LISTEN_HOST || '0.0.0.0';

/** Directory for locally stored media files (relative to backend package cwd). */
export const getMediaDataDir = (): string => process.env.MEDIA_DATA_DIR || "./media-data";
/** @deprecated use getMediaDataDir() */
export const mediaDataDir = getMediaDataDir();

/** Public base URL for API responses, e.g. http://localhost:3000/api */
export const getApiPublicBaseUrl = (): string =>
  process.env.API_PUBLIC_BASE_URL || `http://localhost:${apiDefaultListenPort}/api`;
/** @deprecated use getApiPublicBaseUrl() */
export const apiPublicBaseUrl = getApiPublicBaseUrl();

export const getMediaDownloadTimeoutMs = (): number =>
  Number(process.env.MEDIA_DOWNLOAD_TIMEOUT_MS) || 30_000;
export const getMediaDownloadRetryDelayMs = (): number =>
  Number(process.env.MEDIA_DOWNLOAD_RETRY_DELAY_MS) || 2_000;
export const getMediaDownloadMaxRetries = (): number =>
  Number(process.env.MEDIA_DOWNLOAD_MAX_RETRIES) || 5;

/** Запрещенные тэги досок (через запятую) */
export const bannedBoardTags = process.env.BANNED_BOARD_TAGS ? process.env.BANNED_BOARD_TAGS.split(',').map((t) => t.trim()).filter(Boolean) : [];

/** Игнорируемые при full sync тэги досок */
export const ignoredBoardTags = process.env.IGNORED_BOARD_TAGS ? process.env.IGNORED_BOARD_TAGS.split(',').map((t) => t.trim()).filter(Boolean) : [];

export {
  p2pNodeId,
  p2pSyncToken,
  p2pUpstreamUrl,
  isP2pReplica,
  p2pControlListenHost,
  p2pControlListenPort,
  p2pAdvertiseWsUrl,
  p2pAdvertisePushUrl,
  p2pChangelogMaxAgeDays,
  p2pChangelogMaxRows,
  p2pCallbackBaseUrl,
  assertP2pIdentity,
} from "../p2p/config";
