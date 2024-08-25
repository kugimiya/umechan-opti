import { memo } from "react";
import Link from "next/link";
import { Box } from "@/components/layout/Box/Box";

type Props = {
  limit?: number;
  offset?: number;
  items_count: number;
  location: string;
}

export const Paginator = memo(function PaginatorInner(props: Props) {
  const { location, limit = Number(process.env.DEFAULT_LIMIT), offset = 0, items_count } = props;
  const pages = Math.ceil(items_count / limit);

  const url = new URL(location);
  url.searchParams.delete('limit');
  url.searchParams.delete('offset');

  const paging_items = [];

  for (let i = 0; i < pages; i++) {
    const url_next = new URL(url);
    url_next.searchParams.set('limit', limit.toString());
    url_next.searchParams.set('offset', (limit * i).toString());

    const is_current_page = limit * i === offset;

    paging_items.push(is_current_page ? <span>{i}</span> : <Link key={i} href={url_next.toString()}>{i}</Link>);
  }

  return (
    <Box gap="8px" style={{ maxWidth: "100%", flexWrap: 'wrap' }}>
      Пагинация: {paging_items}
    </Box>
  );
});