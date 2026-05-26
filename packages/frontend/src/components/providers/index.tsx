'use client';

import {
  modalPostFormContext,
  modalPostFormContextDefaultValue,
  ModalPostFormContextType
} from "@/utils/contexts/modalPostForm";
import { ImagesMap, imagesOnPageContext } from "@/utils/contexts/imagesOnPage";
import { ReplyMap, threadReplyMapContext } from "@/utils/contexts/threadReplyMap";
import { PropsWithChildren, useState } from "react";
import { MediaModalHostProvider } from "@/components/common/MediaModal/MediaModalHost";

export const AppProviders = (props: PropsWithChildren<{}>) => {
  const [formContextValue, setFormContextValue] = useState<Omit<ModalPostFormContextType, 'set'>>(modalPostFormContextDefaultValue);

  return (
    <modalPostFormContext.Provider value={{ ...formContextValue, set: setFormContextValue }}>
      <MediaModalHostProvider>
        {props.children}
      </MediaModalHostProvider>
    </modalPostFormContext.Provider>
  );
};

export const ThreadReplyMapWrapper = (props: PropsWithChildren<{ replyMap: ReplyMap }>) => {
  return (
    <threadReplyMapContext.Provider value={{ replyMap: props.replyMap }}>
      {props.children}
    </threadReplyMapContext.Provider>
  );
};

export const ImagesOnPageWrapper = (props: PropsWithChildren<{ imagesMap: ImagesMap }>) => {
  return (
    <imagesOnPageContext.Provider value={{ imagesMap: props.imagesMap }}>
      {props.children}
    </imagesOnPageContext.Provider>
  );
};
