import Link from 'next/link';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';

export const Pager = ({ pages }: { pages: { title: string; href: string; active: boolean }[] }) => {
  return (
    <Box $gap='8px'>
      <Text $variant={TextVariant.textButton}>Страница: </Text>

      {pages.map((item) => (
        <Link href={item.href} key={item.title}>
          <Text
            $variant={item.active ? TextVariant.textButton : TextVariant.textInput}
            $color='colorTextLink'
          >
            {item.title}
          </Text>
        </Link>
      ))}
    </Box>
  );
};
