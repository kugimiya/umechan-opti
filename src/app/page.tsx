import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";
import { Layout } from "@/components/layout/Layout/Layout";
import { WithUnmod } from "@/types/utils";

type Props = WithUnmod & {};

export default function Home(props: Props) {
  return (
    <Layout unmod={props.searchParams.unmod}>
      <Card className="pageMainCardWrapper" title='Главная'>
        <Box flexDirection='column' gap='12px'>
          Тут был цветущий сад, теперь по костям вы ходите.
        </Box>
      </Card>
    </Layout>
  );
}
