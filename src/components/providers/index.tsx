'use client';

import {
  modalPostFormContext,
  modalPostFormContextDefaultValue,
  ModalPostFormContextType
} from "@/utils/contexts/modal_post_form";
import { ImagesMap, imagesOnPageContext } from "@/utils/contexts/images_on_page";
import { ReplyMap, threadReplyMapContext } from "@/utils/contexts/thread_reply_map";
import { PropsWithChildren, useState } from "react";

export const AppProviders = (props: PropsWithChildren<{}>) => {
  const [formContextValue, setFormContextValue] = useState<Omit<ModalPostFormContextType, 'set'>>(modalPostFormContextDefaultValue);

  return (
    <modalPostFormContext.Provider value={{ ...formContextValue, set: setFormContextValue }}>
      {props.children}
    </modalPostFormContext.Provider>
  );
};

export const ThreadReplyMapWrapper = (props: PropsWithChildren<{ reply_map: ReplyMap }>) => {
  return (
    <threadReplyMapContext.Provider value={{ reply_map: props.reply_map }}>
      {props.children}
    </threadReplyMapContext.Provider>
  );
};

export const ImagesOnPageWrapper = (props: PropsWithChildren<{ images_map: ImagesMap }>) => {
  return (
    <imagesOnPageContext.Provider value={{ images_map: props.images_map }}>
      {props.children}
    </imagesOnPageContext.Provider>
  );
};
