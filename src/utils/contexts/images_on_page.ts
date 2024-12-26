import { createContext } from "react";

export type ImagesMap = Array<[image_url: string, post_id: number]>;

export type ImagesOnPageContextType = {
  images_map: ImagesMap;
}

export const imagesOnPageContextDefaultValue = {
  images_map: [],
};

export const imagesOnPageContext = createContext<ImagesOnPageContextType>(imagesOnPageContextDefaultValue);
