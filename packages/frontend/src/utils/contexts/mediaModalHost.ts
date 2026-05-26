import { createContext } from "react";
import type { ImagesMap, ImagesMapItem } from "./imagesOnPage";

export type MediaModalHostOpenParams = {
  items: ImagesMap;
  index?: number;
  navigation?: boolean;
};

export type MediaModalHostContextType = {
  open: (params: MediaModalHostOpenParams) => void;
  close: () => void;
};

export const mediaModalHostContextDefaultValue: MediaModalHostContextType = {
  open: () => {},
  close: () => {},
};

export const mediaModalHostContext = createContext<MediaModalHostContextType>(
  mediaModalHostContextDefaultValue,
);

export type MediaModalHostSession = {
  items: ImagesMap;
  index: number;
  navigation: boolean;
};

export const getMediaModalItem = (
  session: MediaModalHostSession,
): ImagesMapItem | undefined => session.items[session.index];
