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

/** Kafka consumer (raspredach): bootstrap servers, e.g. "kafka1:9092,kafka2:9092" */
export const kafkaBootstrapServers = process.env.KAFKA_BOOTSTRAP_SERVERS || '';
export const kafkaSaslUsername = process.env.KAFKA_SASL_USERNAME || '';
export const kafkaSaslPassword = process.env.KAFKA_SASL_PASSWORD || '';
export const kafkaConsumerGroupId = process.env.KAFKA_CONSUMER_GROUP_ID || 'umechan-opti-consumer';
export const kafkaTopics = (process.env.KAFKA_TOPICS || 'chan.boards,chan.posts,chan.files,chan.passports').split(',').map((t) => t.trim()).filter(Boolean);
/** If true, read from earliest offset (for replay/debug). Default false = only new messages. */
export const kafkaFromBeginning = process.env.KAFKA_READ_FROM_BEGINNING === 'true' || process.env.KAFKA_READ_FROM_BEGINNING === '1';
