import type { DataSource, EntityManager } from "typeorm";
import { SyncChangeLog } from "../db/entities/SyncChangeLog";
import { p2pChangelogMaxAgeDays, p2pChangelogMaxRows, p2pNodeId } from "./config";
import type { P2pChangeOp, P2pChangePointer, P2pReplicatedTable } from "./types";

export type JournalNotify = (entries: P2pChangePointer[]) => void;

let notifyHandler: JournalNotify | null = null;

export const setJournalNotify = (handler: JournalNotify | null) => {
  notifyHandler = handler;
};

export type LogChangeInput = {
  table: P2pReplicatedTable | string;
  recordKey: string;
  op: P2pChangeOp;
  originNodeId?: string;
  updatedAt: number;
};

const insertLog = async (
  manager: EntityManager | DataSource,
  input: LogChangeInput,
): Promise<P2pChangePointer> => {
  const repo = manager.getRepository(SyncChangeLog);
  const originNodeId = input.originNodeId || p2pNodeId() || "unknown";
  const createdAt = Date.now();
  const row = await repo.save(
    repo.create({
      tableName: input.table,
      recordKey: input.recordKey,
      op: input.op,
      originNodeId,
      updatedAt: input.updatedAt,
      createdAt,
    }),
  );
  return {
    revision: row.revision,
    table: input.table,
    key: input.recordKey,
    op: input.op,
    originNodeId,
    updatedAt: input.updatedAt,
  };
};

export const logChanges = async (
  dataSource: DataSource,
  inputs: LogChangeInput[],
  opts?: { notify?: boolean; manager?: EntityManager },
): Promise<P2pChangePointer[]> => {
  if (!inputs.length) return [];
  const manager = opts?.manager;
  const pointers: P2pChangePointer[] = [];
  if (manager) {
    for (const input of inputs) {
      pointers.push(await insertLog(manager, input));
    }
  } else {
    await dataSource.transaction(async (tx) => {
      for (const input of inputs) {
        pointers.push(await insertLog(tx, input));
      }
    });
  }
  if (opts?.notify !== false && notifyHandler) {
    notifyHandler(pointers);
  }
  return pointers;
};

export const getCurrentRevision = async (dataSource: DataSource): Promise<number> => {
  const row = await dataSource
    .getRepository(SyncChangeLog)
    .createQueryBuilder("log")
    .select("MAX(log.revision)", "max")
    .getRawOne<{ max: number | null }>();
  return Number(row?.max ?? 0);
};

export const getOldestRevision = async (dataSource: DataSource): Promise<number> => {
  const row = await dataSource
    .getRepository(SyncChangeLog)
    .createQueryBuilder("log")
    .select("MIN(log.revision)", "min")
    .getRawOne<{ min: number | null }>();
  return Number(row?.min ?? 0);
};

export const listChangesSince = async (
  dataSource: DataSource,
  since: number,
): Promise<P2pChangePointer[]> => {
  const rows = await dataSource
    .getRepository(SyncChangeLog)
    .createQueryBuilder("log")
    .where("log.revision > :since", { since })
    .orderBy("log.revision", "ASC")
    .getMany();
  return rows.map((row) => ({
    revision: row.revision,
    table: row.tableName,
    key: row.recordKey,
    op: row.op,
    originNodeId: row.originNodeId,
    updatedAt: row.updatedAt,
  }));
};

export const pruneChangeLog = async (dataSource: DataSource): Promise<number> => {
  const maxAgeMs = p2pChangelogMaxAgeDays() * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - maxAgeMs;
  const repo = dataSource.getRepository(SyncChangeLog);
  const oldResult = await repo
    .createQueryBuilder()
    .delete()
    .where("createdAt < :cutoff", { cutoff })
    .execute();
  let deleted = oldResult.affected ?? 0;

  const count = await repo.count();
  const maxRows = p2pChangelogMaxRows();
  if (count > maxRows) {
    const overflow = count - maxRows;
    const oldest = await repo.find({
      order: { revision: "ASC" },
      take: overflow,
      select: { revision: true },
    });
    if (oldest.length) {
      const ids = oldest.map((r) => r.revision);
      const r = await repo
        .createQueryBuilder()
        .delete()
        .where("revision IN (:...ids)", { ids })
        .execute();
      deleted += r.affected ?? 0;
    }
  }
  return deleted;
};
