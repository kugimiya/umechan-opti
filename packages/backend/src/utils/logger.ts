export const logger = {
  info: (text: string) => console.log(`INFO: ${text}`),
  error: (text: string) => console.error(`ERRR: ${text}`),
  debug: (text: string) => console.warn(`DBUG: ${text}`),
};
