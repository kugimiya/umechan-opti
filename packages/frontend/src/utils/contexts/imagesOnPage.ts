import { createContext } from "react";
import { EpdsPostMediaType } from "@umechan/shared";

export type ImagesMapItem = [mediaUrl: string, postId: number, type: EpdsPostMediaType];
export type ImagesMap = Array<ImagesMapItem>;
export type ImagesOnPageContextType = {
  imagesMap: ImagesMap;
}

export const imagesOnPageContextDefaultValue = {
  imagesMap: [],
};

export const imagesOnPageContext = createContext<ImagesOnPageContextType>(imagesOnPageContextDefaultValue);
