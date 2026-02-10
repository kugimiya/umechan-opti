#!/usr/bin/env node
import "reflect-metadata";
import { AppDataSource } from "./dataSource";
import { runMigrations } from "./runMigrations";

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case "migrate":
        await runMigrations();
        break;
      case "migrate:revert":
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        await AppDataSource.undoLastMigration();
        console.log("Last migration reverted successfully");
        break;
      case "migrate:show":
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        const executedMigrations = await AppDataSource.showMigrations();
        console.log("Executed migrations:", executedMigrations);
        break;
      default:
        console.log("Usage: node cli.js [migrate|migrate:revert|migrate:show]");
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main();

