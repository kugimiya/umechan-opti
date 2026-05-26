"use client";

import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  mediaModalHostContext,
  type MediaModalHostOpenParams,
  type MediaModalHostSession,
  getMediaModalItem,
} from "@/utils/contexts/mediaModalHost";
import { MediaModal } from "./MediaModal";

export const MediaModalHostProvider: FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<MediaModalHostSession | null>(null);

  const close = useCallback(() => {
    setSession(null);
  }, []);

  const open = useCallback((params: MediaModalHostOpenParams) => {
    const items = params.items;
    if (!items.length) return;

    const index = Math.min(
      Math.max(params.index ?? 0, 0),
      items.length - 1,
    );

    setSession({
      items,
      index,
      navigation: params.navigation ?? true,
    });
  }, []);

  const scrollToImageIndex = useCallback((index: number) => {
    const target = document.querySelector(`[data-image-index="${index}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const shiftIndex = useCallback((delta: -1 | 1) => {
    setSession((prev) => {
      if (!prev) return prev;

      const next = delta < 0
        ? Math.max(prev.index - 1, 0)
        : Math.min(prev.index + 1, prev.items.length - 1);

      scrollToImageIndex(next);
      return { ...prev, index: next };
    });
  }, [scrollToImageIndex]);

  const contextValue = useMemo(
    () => ({ open, close }),
    [open, close],
  );

  const modalItem = session ? getMediaModalItem(session) : undefined;

  const modalPortal = session && modalItem && typeof document !== "undefined"
    ? createPortal(
      <MediaModal
        item={modalItem}
        isOpen
        navigation={session.navigation}
        onClose={close}
        onBack={session.navigation ? () => shiftIndex(-1) : undefined}
        onForward={session.navigation ? () => shiftIndex(1) : undefined}
      />,
      document.body,
    )
    : null;

  return (
    <mediaModalHostContext.Provider value={contextValue}>
      {children}
      {modalPortal}
    </mediaModalHostContext.Provider>
  );
};
