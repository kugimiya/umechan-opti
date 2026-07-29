import { DataSource } from "typeorm";
import { Settings } from "../entities/Settings";

export const dbModelSettings = (dataSource: DataSource) => ({
  get: async (name: string) => {
    const settingsRepository = dataSource.getRepository(Settings);
    const row = await settingsRepository.findOne({
      where: { name },
    });

    if (!row) {
      throw new Error(`Setting with name "${name}" not found`);
    }

    switch (row.type) {
      case "number":
        return Number(row.value);

      default:
        return row.value;
    }
  },
  getOptional: async (name: string): Promise<string | number | null> => {
    const row = await dataSource.getRepository(Settings).findOne({ where: { name } });
    if (!row) return null;
    return row.type === "number" ? Number(row.value) : row.value;
  },
  create: async (name: string, type: "string" | "number", value: string) => {
    const settingsRepository = dataSource.getRepository(Settings);
    const newSetting = settingsRepository.create({
      name,
      type,
      value,
    });
    return settingsRepository.save(newSetting);
  },
  set: async (name: string, value: string) => {
    const settingsRepository = dataSource.getRepository(Settings);
    await settingsRepository.update({ name }, { value });
  },
  upsert: async (name: string, type: "string" | "number", value: string) => {
    const repo = dataSource.getRepository(Settings);
    const existing = await repo.findOne({ where: { name } });
    if (existing) {
      existing.value = value;
      existing.type = type;
      return repo.save(existing);
    }
    return repo.save(repo.create({ name, type, value }));
  },
});
