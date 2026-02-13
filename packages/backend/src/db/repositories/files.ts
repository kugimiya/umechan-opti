import { DataSource } from "typeorm";
import { File } from "../entities/File";

export const dbModelFiles = (dataSource: DataSource) => ({
  upsert: async (id: string, cid: string) => {
    const repo = dataSource.getRepository(File);
    let file = await repo.findOne({ where: { id } });
    if (file) {
      file.cid = cid;
      return repo.save(file);
    }
    return repo.save(repo.create({ id, cid }));
  },
  deleteById: async (id: string) => {
    return dataSource.getRepository(File).delete({ id });
  },
  findById: async (id: string) => {
    return dataSource.getRepository(File).findOne({ where: { id } });
  },
});
