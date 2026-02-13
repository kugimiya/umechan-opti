import { DataSource } from "typeorm";
import { Passport } from "../entities/Passport";

export const dbModelPassports = (dataSource: DataSource) => ({
  insert: async (id: string) => {
    const repo = dataSource.getRepository(Passport);
    return repo.save(repo.create({ id }));
  },
  deleteById: async (id: string) => {
    return dataSource.getRepository(Passport).delete({ id });
  },
  exists: async (id: string) => {
    const count = await dataSource.getRepository(Passport).count({ where: { id } });
    return count > 0;
  },
});
