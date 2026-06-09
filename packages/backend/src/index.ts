import "reflect-metadata";
import { parseAppFlags, runMonolith } from "./app/roles";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required!");
  process.exit(1);
}

if (process.argv.includes("--help")) {
  const help = [
    `${process.env.npm_package_name}@${process.env.npm_package_version}`,
    "",
    "Usage:",
    "",
    "pnpm run start -- --no-tick-sync      disable event sync tick only (periodic full sync still runs if enabled)",
    "pnpm run start -- --no-full-sync      disable full sync only (initial + periodic; event tick still runs)",
    "pnpm run start -- --no-api-server     disable api server",
    "pnpm run start -- --no-kafka-consumer disable Kafka consumer (raspredach topics)",
    "",
    "pnpm run start:cluster                N API workers (CPU count) + sync/Kafka in primary",
    "CLUSTER_WORKERS=2 pnpm run start:cluster   override worker count",
    "",
    "For configuration look at .env.example file",
  ];
  console.log(help.join("\n"));
  process.exit(0);
}

runMonolith(parseAppFlags());
