import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { WithPagination } from "@/types/utils";

type FeedPageLayoutProps = WithPagination & {
  children: React.ReactNode;
};

export default async function FeedPageLayout(props: FeedPageLayoutProps) {
  return (
    <Card className="pageMainCardWrapper" title='Последнее'>
      <Box flexDirection='column' gap='12px' style={{ width: '100%' }}>
        {props.children}
      </Box>
    </Card>
  );
}
