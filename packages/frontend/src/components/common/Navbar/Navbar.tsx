import { LinkItem } from "@umechan/shared";
import { Card } from "@/components/layout/Card/Card";
import Link from "next/link";
import { Box } from "@/components/layout/Box/Box";
import styles from './Navbar.module.css';
import clsx from "clsx";

type Props = {
  items: Record<string, LinkItem[]>;
  className?: string;
}

export const Navbar = (props: Props) => {
  const sectionEntries = Object.entries(props.items);

  const sections = sectionEntries.map(([sectionTitle, sectionItems]) => (
    <Card key={sectionTitle} title={sectionTitle}>
      <Box flexDirection='column' as='nav'>
        {sectionItems.map((item: LinkItem) => (
          <Link key={item.url} href={item.url} title={item.hint} target={item.target}>{item.title}</Link>
        ))}
      </Box>
    </Card>
  ));

  return (
    <Box className={clsx(styles.root, props.className)} flexDirection='column' as='aside'>
      {sections}
    </Box>
  );
}
