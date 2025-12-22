import { DataSource } from "typeorm";
import { Settings } from "../../db/entities/Settings";

export const db_model_settings = (dataSource: DataSource) => ({
  get: async (name: string) => {
    const settingsRepository = dataSource.getRepository(Settings);
    const row = await settingsRepository.findOne({
      where: { name },
    });

    if (!row) {
      throw new Error(`Setting with name "${name}" not found`);
    }

    switch (row.type) {
      case 'number':
        return Number(row.value);

      default:
        return row.value;
    }
  },
  create: async (name: string, type: 'string' | 'number', value: string) => {
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
    await settingsRepository.update(
      { name },
      { value }
    );
  },
});
