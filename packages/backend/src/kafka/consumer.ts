import { Kafka } from "kafkajs";
import type { DbConnection } from "../db/connection";
import { logger } from "../utils/logger";
import {
  kafkaBootstrapServers,
  kafkaConsumerGroupId,
  kafkaFromBeginning,
  kafkaSaslPassword,
  kafkaSaslUsername,
  kafkaTopics,
} from "../utils/config";
import { getHandler, parseMessage } from "./handlers";

export async function createKafkaConsumer(db: DbConnection) {
  const brokers = kafkaBootstrapServers.split(",").map((b) => b.trim()).filter(Boolean);
  if (brokers.length === 0) {
    throw new Error("KAFKA_BOOTSTRAP_SERVERS is empty");
  }

  const sasl =
    kafkaSaslUsername && kafkaSaslPassword
      ? { mechanism: "plain" as const, username: kafkaSaslUsername, password: kafkaSaslPassword }
      : undefined;

  const kafka = new Kafka({
    clientId: "umechan-opti-backend",
    brokers,
    sasl,
  });

  const consumer = kafka.consumer({
    groupId: kafkaConsumerGroupId,
    sessionTimeout: 60_000,
    heartbeatInterval: 10_000,
  });

  const { GROUP_JOIN, REBALANCING, CRASH, START_BATCH_PROCESS } = consumer.events;
  consumer.on(GROUP_JOIN, ({ payload }) => {
    logger.info(`[Kafka] Joined group, memberId=${payload.memberId}, assignments=${JSON.stringify(payload.memberAssignment)}`);
    logger.info("[Kafka] Consumer ready, waiting for messages");
  });
  consumer.on(REBALANCING, () => {
    logger.info("[Kafka] Rebalancing...");
  });
  consumer.on(CRASH, ({ payload }) => {
    logger.error(`[Kafka] Consumer crash: ${payload.error?.message ?? payload.error}`);
  });
  consumer.on(START_BATCH_PROCESS, ({ payload }) => {
    logger.debug(`[Kafka] Batch topic=${payload.topic} partition=${payload.partition} batchSize=${payload.batchSize}`);
  });

  const run = async () => {
    try {
      await consumer.connect();
      logger.info("[Kafka] Connected to broker(s)");
    } catch (e) {
      logger.error(`[Kafka] Connect failed: ${e}`);
      throw e;
    }

    const topics = kafkaTopics.length > 0 ? kafkaTopics : ["chan.boards", "chan.posts", "chan.files", "chan.passports"];
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: kafkaFromBeginning });
    }
    logger.info(`[Kafka] Subscribed to ${topics.join(", ")} (fromBeginning=${kafkaFromBeginning})`);

    await consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: { topic: string; partition: number; message: { value: Buffer | null; offset: string } }) => {
        logger.info(`[Kafka] Message received topic=${topic} partition=${partition} offset=${message.offset}`);
        const payload = parseMessage(message.value);
        if (payload == null) {
          logger.warn(`[Kafka] ${topic}/${partition} offset=${message.offset} invalid JSON — skip`);
          return;
        }
        const handler = getHandler(topic);
        if (handler) {
          try {
            await handler(payload, db);
            logger.info(`[Kafka] Message processed topic=${topic} partition=${partition} offset=${message.offset} ok`);
          } catch (e) {
            logger.error(`[Kafka] Message failed topic=${topic} partition=${partition} offset=${message.offset} error=${e}`);
          }
        } else {
          logger.debug(`[Kafka] ${topic} no handler`);
        }
      },
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();
    logger.info("[Kafka] Consumer disconnected");
  };

  return { run, disconnect, consumer };
}
