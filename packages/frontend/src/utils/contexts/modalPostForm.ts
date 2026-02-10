import { createContext, useContext } from "react";

export type ModalPostFormContextType = {
  isOpen: boolean;
  target: 'board' | 'thread' | null;
  targetId: number | null;
  targetTag: string | null;
  nickname: string | null;
  message: string | null;
  subject: string | null;
  sage: boolean | null;
  separatePictures: boolean | null;
  files: FileList | null;
  set: (args: Omit<ModalPostFormContextType, 'set'>) => void;
}

export const modalPostFormContextDefaultValue = {
  isOpen: false,
  target: null,
  targetId: null,
  targetTag: null,
  nickname: null,
  message: '',
  subject: '',
  sage: false,
  separatePictures: false,
  files: null,
  set: () => void 0,
};

export const modalPostFormContext = createContext<ModalPostFormContextType>(modalPostFormContextDefaultValue);
