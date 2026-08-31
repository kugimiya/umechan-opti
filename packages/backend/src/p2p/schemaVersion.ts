import { AppDataSource } from "../db/dataSource";

/** Last applied TypeORM migration name — used as schemaVersion gate. */
export const getSchemaVersion = async (): Promise<string> => {
  try {
    const rows: Array<{ name: string; timestamp: number }> = await AppDataSource.query(
      `SELECT name, timestamp FROM migrations ORDER BY timestamp DESC, id DESC LIMIT 1`,
    );
    if (rows[0]?.name) return rows[0].name;
  } catch {
    // migrations table may not exist yet
  }
  return "unknown";
};
