/**
 * Deterministic numeric id from board tag (for Kafka-originated boards).
 * Same tag always yields same id; fits in safe integer.
 */
export function hashTagToId(tag: string): number {
  let h = 5381;
  for (let i = 0; i < tag.length; i++) {
    h = ((h << 5) + h) ^ tag.charCodeAt(i);
  }
  return Math.abs(h >>> 0) || 1;
}
