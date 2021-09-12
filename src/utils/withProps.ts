import { GetServerSidePropsContext } from "next";
import { getAll } from "./service";

export function withProps<T = unknown>(getter: (context: GetServerSidePropsContext) => Promise<T>) {
  return async (context: GetServerSidePropsContext) => ({
    props: {
      ...await getAll(),
      ...await getter(context)
    },
  });
};
