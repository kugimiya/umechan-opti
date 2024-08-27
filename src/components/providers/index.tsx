'use client';

import {
  modalPostFormContext,
  modalPostFormContextDefaultValue,
  ModalPostFormContextType
} from "@/utils/contexts/modal-post-form";
import { useState } from "react";

export const AppProviders = ({ children }: React.PropsWithChildren<{}>) => {
  const [formContextValue, setFormContextValue] = useState<Omit<ModalPostFormContextType, 'set'>>(modalPostFormContextDefaultValue);

  return (
    <modalPostFormContext.Provider value={{ ...formContextValue, set: setFormContextValue }}>
      {children}
    </modalPostFormContext.Provider>
  );
};
