export const PISSYKAKA_HOSTNAME = process.env.PISSYKAKA_HOSTNAME || "scheoble.xyz";
export const PISSYKAKA_API = process.env.PISSYKAKA_API || "https://scheoble.xyz/api";
export const DELAY_AFTER_UPDATE_TICK = Number(process.env.DELAY_AFTER_UPDATE_TICK) || 5000; // 5 sec
export const FETCH_ENTITIES_FROM_API_BASE_LIMIT = Number(process.env.FETCH_ENTITIES_FROM_API_BASE_LIMIT) || 1000; // if board got more than 1000 threads, so... hit me!
export const FETCH_ENTITIES_MAX_PARALLEL_JOBS = Number(process.env.FETCH_ENTITIES_MAX_PARALLEL_JOBS) || 10;

export const DEFAULT_LIMIT = Number(process.env.DEFAULT_LIMIT) || 20;
export const DEFAULT_THREAD_SIZE = Number(process.env.DEFAULT_THREAD_SIZE) || 5;

export const API_DEFAULT_LISTEN_PORT = Number(process.env.API_DEFAULT_LISTEN_PORT) || 3000;
export const API_DEFAULT_LISTEN_HOST = process.env.API_DEFAULT_LISTEN_HOST || '0.0.0.0';
