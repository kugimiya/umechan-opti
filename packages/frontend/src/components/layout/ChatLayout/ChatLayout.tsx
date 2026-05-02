'use server';

import { Box } from "../Box/Box";
import { ModalPostForm } from "@/components/common/ModalPostForm/ModalPostForm";
import styles from './ChatLayout.module.css';

export const ChatLayout = async (props: Readonly<{ children: React.ReactNode; }>) => {
  const { children } = props;

  return (
    <>
      <Box className={styles.main} as='main'>
        {children}
      </Box>

      <ModalPostForm />
    </>
  );
}
