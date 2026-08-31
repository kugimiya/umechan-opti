import { createHash, randomUUID } from "crypto";

/** Deterministic UUID-like id for media natural key (stable across root re-sync). */
export const mediaSyncIdFromNaturalKey = (
  postId: number,
  mediaType: string,
  urlOrigin: string | null,
): string => {
  const digest = createHash("sha256")
    .update(`media|${postId}|${mediaType}|${urlOrigin ?? ""}`)
    .digest();
  const hex = digest.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

export const newSyncId = (): string => randomUUID();

export const sha256Buffer = (buf: Buffer): string => createHash("sha256").update(buf).digest("hex");
