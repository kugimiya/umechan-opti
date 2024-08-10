import { Box } from "@/components/layout/Box/Box";
import { Card } from "@/components/layout/Card/Card";

export default function Home() {
  return (
    <Card title='Главная'>
      <Box flexDirection='column' gap='12px'>
        <Card>юмэчан</Card>
      </Box>
    </Card>
  );
}
