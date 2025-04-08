export type LinkItem = {
  title: string;
  hint?: string;
  target?: string;
  url: string;
};

export type WithPagination = {
  searchParams: Promise<{
    offset: string;
    limit: string;
    unmod: 'true' | 'false';
  }>;
};
