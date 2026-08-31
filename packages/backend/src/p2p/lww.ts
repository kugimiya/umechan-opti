export type LwwFields = {
  updatedAt: number;
  originNodeId: string | null | undefined;
};

/** Returns true if incoming should replace local. */
export const lwwWins = (local: LwwFields | null | undefined, incoming: LwwFields): boolean => {
  if (!local) return true;
  if (incoming.updatedAt > local.updatedAt) return true;
  if (incoming.updatedAt < local.updatedAt) return false;
  const localOrigin = local.originNodeId ?? "";
  const incomingOrigin = incoming.originNodeId ?? "";
  return incomingOrigin > localOrigin;
};
