const toString = (v: unknown): string =>
  v instanceof Error ? [v.name, v.message, v.stack, v.cause].join('\n') : String(v);

export const logger = {
  info: (text: string) => console.log(`INFO: ${text}`),
  error: (err: unknown) => console.error(`ERR: ${toString(err)}`),
  warn: (text: string) => console.warn(`WRN: ${text}`),
  debug: (text: string) => console.warn(`DBUG: ${text}`),
};
