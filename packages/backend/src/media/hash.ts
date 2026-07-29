import fs from "node:fs";
import { resolveAbsolutePath } from "./storage";
import { sha256Buffer } from "../p2p/ids";

export const hashLocalFile = async (relativePath: string | null): Promise<string | null> => {
  if (!relativePath) return null;
  const absolute = resolveAbsolutePath(relativePath);
  if (!absolute) return null;
  try {
    const buf = await fs.promises.readFile(absolute);
    return sha256Buffer(buf);
  } catch {
    return null;
  }
};
