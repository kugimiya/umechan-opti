'use client';

import { ImagesMapItem } from "@/utils/contexts/images_on_page";
import { useEffect, useRef } from "react";
import { EpdsPostMediaType } from "@/types/epds";

type Props = {
  item: ImagesMapItem;
  is_open: boolean;
  on_close: () => void;
  on_back: () => void;
  on_forward: () => void;
};

const makeYouTubeEmbedLink = (link: string) => {
  const url = new URL(link);
  const path = url.pathname;
  return `https://www.youtube.com/embed${path}`;
};

export const MediaModal = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && props.is_open) {
      (ref.current.firstChild as HTMLDivElement).focus();
    }
  }, [ref.current, props.is_open]);

  if (!props.is_open) {
    return null;
  }

  return (
    <div ref={ref}>
      <div
        onClick={props.on_close}
        onKeyDown={(ev) => {
          if (ev.key === 'Escape') {
            props.on_close();
          }

          if (ev.key === 'ArrowLeft') {
            props.on_back();
          }

          if (ev.key === 'ArrowRight') {
            props.on_forward();
          }
        }}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          onClick={(ev) => ev.stopPropagation()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--post-content-gap)',
            flexDirection: 'row',
          }}
        >
          <button onClick={props.on_back} style={{ padding: '4px' }}>{"<"}</button>

          {props.item[2] === EpdsPostMediaType.PISSYKAKA_IMAGE && (
            <img
              onClick={(ev) => ev.stopPropagation()}
              key={props.item[0]}
              src={props.item[0]}
              style={{
                maxWidth: 'calc(100vw - 160px)',
                maxHeight: 'calc(100vh - 86px)',
                background: 'rgba(0, 0, 0, 0.9)'
              }}
            />
          )}

          {props.item[2] === EpdsPostMediaType.VIDEO && (
            <video
              onClick={(ev) => ev.stopPropagation()}
              key={props.item[0]}
              src={props.item[0]}
              controls
              autoPlay
              style={{
                maxWidth: 'calc(100vw - 160px)',
                maxHeight: 'calc(100vh - 86px)',
                background: 'rgba(0, 0, 0, 0.9)'
              }}
            />
          )}

          {props.item[2] === EpdsPostMediaType.YOUTUBE && (
            <iframe
              key={props.item[0]}
              style={{
                minWidth: 'calc(100vw - 160px)',
                minHeight: 'calc(100vh - 86px)',
              }}
              width="100%"
              height="100%"
              src={makeYouTubeEmbedLink(props.item[0])}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}

          <button onClick={props.on_forward} style={{ padding: '4px' }}>{">"}</button>
        </div>

        {props.item[0]}
      </div>
    </div>
  );
}
