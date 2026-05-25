"use client";

import {
  type CSSProperties,
  type DependencyList,
  forwardRef,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import "./styles.css";

/** Если пользователь ближе к низу — считаем, что «держим» низ при подгрузке картинок */
const BOTTOM_PIN_THRESHOLD_PX = 80;

type Props = PropsWithChildren & {
  styles?: CSSProperties;
  /** По умолчанию совпадает с прежним сайдбаром чата */
  maxHeight?: CSSProperties["maxHeight"];
  className?: string;
  /** При изменении deps прокрутка к последнему сообщению (низ контейнера) */
  scrollToBottomOn?: DependencyList;
};

const isNearBottom = (el: HTMLElement) =>
  el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_PIN_THRESHOLD_PX;

export const PrettyScrollbarContainer = forwardRef<HTMLDivElement, Props>(function PrettyScrollbarContainer({
  children,
  styles,
  maxHeight = "100vh",
  className,
  scrollToBottomOn,
}, forwardedRef) {
  const rootRef = useRef<HTMLDivElement>(null);

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const pinnedToBottomRef = useRef(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollBottomRafRef = useRef<number | undefined>(undefined);

  const scrollToBottomEnabled = scrollToBottomOn !== undefined;

  const scrollToEnd = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const scheduleScrollToEnd = useCallback(() => {
    if (!pinnedToBottomRef.current) return;
    if (scrollBottomRafRef.current != null) {
      cancelAnimationFrame(scrollBottomRafRef.current);
    }
    scrollBottomRafRef.current = requestAnimationFrame(() => {
      scrollBottomRafRef.current = undefined;
      scrollToEnd();
    });
  }, [scrollToEnd]);

  useLayoutEffect(() => {
    if (!scrollToBottomEnabled) return;
    pinnedToBottomRef.current = true;
    scrollToEnd();
    requestAnimationFrame(scrollToEnd);
  }, scrollToBottomOn ?? []);

  useEffect(() => {
    if (!scrollToBottomEnabled) return;
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const resizeObserver = new ResizeObserver(() => {
      scheduleScrollToEnd();
    });
    resizeObserver.observe(content);

    const onImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement) {
        scheduleScrollToEnd();
      }
    };
    root.addEventListener("load", onImageLoad, true);

    return () => {
      resizeObserver.disconnect();
      root.removeEventListener("load", onImageLoad, true);
      if (scrollBottomRafRef.current != null) {
        cancelAnimationFrame(scrollBottomRafRef.current);
      }
    };
  }, [scrollToBottomEnabled, scheduleScrollToEnd, scrollToBottomOn]);

  const onScroll = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;

    if (scrollToBottomEnabled) {
      pinnedToBottomRef.current = isNearBottom(el);
    }

    el.classList.add("chat-thread-sidebar-scroll--active");
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      el.classList.remove("chat-thread-sidebar-scroll--active");
    }, 1000);
  }, [scrollToBottomEnabled]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (scrollBottomRafRef.current != null) {
        cancelAnimationFrame(scrollBottomRafRef.current);
      }
    },
    [],
  );

  const body = scrollToBottomEnabled ? (
    <div ref={contentRef} className="pretty-scrollbar-content">
      {children}
    </div>
  ) : (
    children
  );

  return (
    <div
      ref={setRootRef}
      className={["chat-thread-sidebar-scroll", className].filter(Boolean).join(" ")}
      onScroll={onScroll}
      style={{
        ...styles,
        maxHeight,
      }}
    >
      {body}
    </div>
  );
});
