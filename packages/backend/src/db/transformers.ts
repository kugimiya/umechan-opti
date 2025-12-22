import { ValueTransformer } from "typeorm";

/**
 * Трансформер для преобразования bigint (в БД) <-> number (в коде)
 */
export const bigintTransformer: ValueTransformer = {
  to: (value: number | null | undefined): string | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return String(value);
  },
  from: (value: string | null | undefined): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    return Number(value);
  },
};

