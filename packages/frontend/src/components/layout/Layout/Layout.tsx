'use server';

import { UnmodFlag } from "@umechan/shared";
import { epdsApi } from "@/api/epds";
import { enrichNavbar } from "@/utils/enrichers/enrichNavbar";
import { Box } from "../Box/Box";
import { Navbar } from "@/components/common/Navbar/Navbar";
import { ModalPostForm } from "@/components/common/ModalPostForm/ModalPostForm";
import styles from './Layout.module.css';

export const Layout = async (props: Readonly<{ children: React.ReactNode; unmod: UnmodFlag }>) => {
  const { children, unmod } = props;
  const boards = await epdsApi.boardsList(unmod);
  const navbarItems = enrichNavbar(boards.items, unmod);

  return (
    <>
      <Navbar className={styles.navbar} items={navbarItems} />

      <Box className={styles.main} as='main'>
        {children}
      </Box>

      <ModalPostForm />
    </>
  );
}
