import type { PrismaClient } from "@prisma/client";

export const db_model_settings = (client: PrismaClient) => ({
  get: async (name: string) => {
    const row = await client.settings.findFirstOrThrow({
      select: {
        value: true,
        type: true,
      },
      where: {
        name,
      },
    });

    switch (row.type) {
      case 'number':
        return Number(row.value);

      default:
        return row.value;
    }
  },
  create: async (name: string, type: 'string' | 'number', value: string) => {
    return client.settings.create({
      data: {
        name,
        type,
        value,
      },
    });
  },
  set: async (name: string, value: string) => {
    await client.settings.updateMany({
      where: {
        name,
      },
      data: {
        value,
      },
    });
  },
});
