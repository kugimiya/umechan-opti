import React from "react";
import { Box, BoxProps } from "@/components/layout/Box/Box";
import styles from './Card.module.css';
import clsx from "clsx";

type CardProps = React.PropsWithChildren & {
  title?: string;
  rootElmProps?: BoxProps;
  className?: string;
  variant?: 'default' | 'filled';
}

export const Card = ({ title, rootElmProps, className, variant = 'default', children }: CardProps) => {
  return (
    <Box {...(rootElmProps || {})} className={clsx(styles.root, className, [styles[variant]], { [styles.withTitle]: Boolean(title) })}>
      {Boolean(title)
        ? (
          <Box className={styles.withTitleContainer} flexDirection='column'>
            <span className={styles.titleElm}>{title}</span>
            <Box className={styles.titleChildrenElm}>{children}</Box>
          </Box>
        )
        : <>{children}</>
      }
    </Box>
  );
}
