import Link from 'next/link';
import { A } from 'src/components/common/A';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';

export const Pager = ({ pages }: { pages: { title: string; href: string; active: boolean }[] }) => {
  return (
    <Box gap='8px'>
      <Text variant={TextVariant.textButton}>Страница: </Text>

      {pages.map((item) => (
        <Link href={item.href} key={item.title}>
          <A
            variant={item.active ? TextVariant.textButton : TextVariant.textInput}
            href={item.href}
            color='colorTextLink'
          >
            {item.title}
          </A>
        </Link>
      ))}
    </Box>
  );
};
