import { LinkItem } from "@/types/utils";
import { Card } from "@/components/layout/Card/Card";
import Link from "next/link";
import { Box } from "@/components/layout/Box/Box";
import styles from './Navbar.module.css';

type Props = {
  items: Record<string, LinkItem[]>;
}

export const Navbar = (props: Props) => {
  const section_entries = Object.entries(props.items);

  const sections = section_entries.map(([section_title, section_items]) => (
    <Card key={section_title} title={section_title}>
      <Box flexDirection='column'>
        {section_items.map((item: LinkItem) => (
          <Link key={item.url} href={item.url} title={item.hint} target={item.target}>{item.title}</Link>
        ))}
      </Box>
    </Card>
  ));

  return (
    <Box className={styles.root} flexDirection='column' as='nav'>
      {sections}
    </Box>
  );
}
