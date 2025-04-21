'use server';

import { epds_api } from "@/api/epds";
import { enrich_navbar } from "@/utils/enrichers/enrich_navbar";
import { Box } from "../Box/Box";
import { Navbar } from "@/components/common/Navbar/Navbar";
import { ModalPostForm } from "@/components/common/ModalPostForm/ModalPostForm";
import styles from './Layout.module.css';

export const Layout = async (props: Readonly<{ children: React.ReactNode; unmod: 'true' | 'false' }>) => {
  const { children, unmod } = props;
  // todo: can we move it out from layout?
  const boards = await epds_api.boards_list(unmod);
  const navbar_items = enrich_navbar(boards.items, unmod);

  return (
    <>
      <Navbar className={styles.navbar} items={navbar_items} />

      <Box className={styles.main} as='main'>
        {children}
      </Box>

      <ModalPostForm />
    </>
  );
}
