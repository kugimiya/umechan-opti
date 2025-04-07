export type LinkItem = {
  title: string;
  hint?: string;
  target?: string;
  url: string;
};

export type WithPagination = {
  searchParams: {
    offset: string;
    limit: string;
  };
};

export type WithUnmod = {
  searchParams: {
    unmod: 'true' | 'false';
  };
};
