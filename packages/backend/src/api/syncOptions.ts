import type { CreateUpdateTickReturn } from "../sync";

export type ApiServerSyncOptions = {
  tickService?: CreateUpdateTickReturn;
  requestForceSync?: (threadId: number) => Promise<void>;
};
