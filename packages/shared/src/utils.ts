export type LinkItem = {
  title: string;
  hint?: string;
  target?: string;
  url: string;
};

export type UnmodFlag = "true" | "false";

export type WithPagination = {
  searchParams: Promise<{
    offset: string;
    limit: string;
    unmod: UnmodFlag;
  }>;
};

