import React from "react";
import { Box } from "@/components/layout/Box/Box";
import styles from './Card.module.css';
import clsx from "clsx";

type CardProps = React.PropsWithChildren & {
  title?: string;
}

export const Card = (props: CardProps) => {
  return (
    <Box className={clsx(styles.root, { [styles.withTitle]: Boolean(props.title) })}>
      {Boolean(props.title)
        ? (
          <Box className={styles.withTitleContainer} flexDirection='column'>
            <span className={styles.titleElm}>{props.title}</span>
            <Box className={styles.titleChildrenElm}>{props.children}</Box>
          </Box>
        )
        : <>{props.children}</>
      }
    </Box>
  );
}