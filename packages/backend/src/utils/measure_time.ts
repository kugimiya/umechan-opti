const entries_storage: Record<string, number> = {};

export const measure_time = (entry_name: string, type: "start" | "end") => {
  if (type === "start") {
    entries_storage[entry_name] = Date.now();
    return 0;
  } else {
    return Date.now() - entries_storage[entry_name];
  }
};
