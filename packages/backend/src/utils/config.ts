export const pissykakaHostname = process.env.PISSYKAKA_HOSTNAME || "scheoble.xyz";
export const pissykakaApi = process.env.PISSYKAKA_API || "https://scheoble.xyz/api";
export const delayAfterUpdateTick = Number(process.env.DELAY_AFTER_UPDATE_TICK) || 5000; // 5 sec
/** Seconds between periodic full sync runs (only when full sync is enabled). */
export const fullSyncIntervalSeconds = Number(process.env.FULL_SYNC_INTERVAL_SECONDS) || 3600; // 1 hour
export const fetchEntitiesFromApiBaseLimit = Number(process.env.FETCH_ENTITIES_FROM_API_BASE_LIMIT) || 1000;
export const fetchEntitiesMaxParallelJobs = Number(process.env.FETCH_ENTITIES_MAX_PARALLEL_JOBS) || 10;

export const defaultLimit = Number(process.env.DEFAULT_LIMIT) || 20;
export const defaultThreadSize = Number(process.env.DEFAULT_THREAD_SIZE) || 5;

export const apiDefaultListenPort = Number(process.env.API_DEFAULT_LISTEN_PORT) || 3000;
export const apiDefaultListenHost = process.env.API_DEFAULT_LISTEN_HOST || '0.0.0.0';
