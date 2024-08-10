import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";

export default function Home() {
  return (
    <Card className="pageMainCardWrapper" title='Главная'>
      <Box flexDirection='column' gap='12px'>
        Тут был цветущий сад, теперь по костям вы ходите.
      </Box>
    </Card>
  );
}
