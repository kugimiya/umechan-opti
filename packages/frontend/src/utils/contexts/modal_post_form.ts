import { createContext, useContext } from "react";

export type ModalPostFormContextType = {
  isOpen: boolean;
  target: 'board' | 'thread' | null,
  target_id: number | null,
  target_tag: string | null,
  nickname: string | null,
  message: string | null,
  subject: string | null,
  sage: boolean | null,
  separate_pictures: boolean | null,
  files: FileList | null,
  set: (args: Omit<ModalPostFormContextType, 'set'>) => void,
}

export const modalPostFormContextDefaultValue = {
  isOpen: false,
  target: null,
  target_id: null,
  target_tag: null,
  nickname: null,
  message: '',
  subject: '',
  sage: false,
  separate_pictures: false,
  files: null,
  set: () => void 0,
};

export const modalPostFormContext = createContext<ModalPostFormContextType>(modalPostFormContextDefaultValue);
