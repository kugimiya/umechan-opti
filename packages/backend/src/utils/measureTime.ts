const entriesStorage: Record<string, number> = {};

export const measureTime = (entryName: string, type: "start" | "end") => {
  if (type === "start") {
    entriesStorage[entryName] = Date.now();
    return 0;
  } else {
    return Date.now() - entriesStorage[entryName];
  }
};
