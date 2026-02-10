import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { Layout } from "@/components/layout/Layout/Layout";
import { WithPagination } from "@umechan/shared";

type Props = WithPagination & {};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <Layout unmod={searchParams.unmod}>
      <Card className="pageMainCardWrapper" title='Главная'>
        <Box flexDirection='column' gap='12px'>
          Тут был цветущий сад, теперь по костям вы ходите.
        </Box>
      </Card>
    </Layout>
  );
}
