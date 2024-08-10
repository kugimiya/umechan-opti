import React from "react";
import { Box, BoxProps } from "@/components/layout/Box/Box";
import styles from './Card.module.css';
import clsx from "clsx";

type CardProps = React.PropsWithChildren & {
  title?: string;
  rootElmProps?: BoxProps;
  className?: string;
}

export const Card = (props: CardProps) => {
  return (
    <Box {...(props.rootElmProps || {})} className={clsx(styles.root, props.className, { [styles.withTitle]: Boolean(props.title) })}>
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
