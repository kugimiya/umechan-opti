import { createContext } from "react";
import { EpdsPostMediaType } from "@/types/epds";

export type ImagesMapItem = [media_url: string, post_id: number, type: EpdsPostMediaType];
export type ImagesMap = Array<ImagesMapItem>;
export type ImagesOnPageContextType = {
  images_map: ImagesMap;
}

export const imagesOnPageContextDefaultValue = {
  images_map: [],
};

export const imagesOnPageContext = createContext<ImagesOnPageContextType>(imagesOnPageContextDefaultValue);
