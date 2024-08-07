import React from "react";
import { Box } from "@/components/layout/Box/Box";
import styles from './Card.module.css';

type CardProps = React.PropsWithChildren & {

}

export const Card = (props: CardProps) => {
  return (
    <Box className={styles.root}>
      {props.children}
    </Box>
  );
}