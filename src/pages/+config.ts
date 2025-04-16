import vikeReact from "vike-react/config";
import type { Config } from "vike/types";

export default {
  title: "Vike App",
  description: "Demo showcasing Vike",
  prerender: false,
  ssr: true,
  passToClient: ['boards'],
  extends: vikeReact
} satisfies Config;
