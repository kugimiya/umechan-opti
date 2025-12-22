'use client';

import { ImagesMapItem } from "@/utils/contexts/images_on_page";
import { useEffect, useRef, useState } from "react";
import { EpdsPostMediaType } from "@/types/epds";
import styles from './styles.module.css'

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

const getStoredVideoVolume = (): number => {
  if (typeof window === "undefined") {
    return 1;
  }

  const storedValue = localStorage.getItem("videoVolume") ?? '1';
  return isNaN(Number(storedValue)) ? 1 : Number(storedValue);
};

export const MediaModal = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [videoVolume, setVideoVolume] = useState(getStoredVideoVolume);

  useEffect(() => {
    localStorage.setItem("videoVolume", videoVolume.toString());
  }, [videoVolume]);

  useEffect(() => {
    if (ref.current && props.is_open) {
      (ref.current.firstChild as HTMLDivElement).focus();
    }
  }, [ref.current, props.is_open]);

  if (!props.is_open) {
    return null;
  }

  return (
    <div ref={ref} style={{ zIndex: 1 }}>
      <div
        onClick={props.on_close}
        className={styles.root}
        tabIndex={-1}
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
      >
        <div
          onClick={(ev) => ev.stopPropagation()}
          className={styles.inner}
        >
          <button onClick={props.on_back} style={{ padding: '4px' }}>{"<"}</button>

          {props.item[2] === EpdsPostMediaType.PISSYKAKA_IMAGE && (
            <img
              onClick={(ev) => ev.stopPropagation()}
              key={props.item[0]}
              src={props.item[0]}
              className={styles.media}
              style={{
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
              loop
              onPlay={(ev) => {
                const target = ev.nativeEvent.target as HTMLVideoElement;
                target.volume = videoVolume;
              }}
              onVolumeChange={(ev) => {
                const target = ev.nativeEvent.target as HTMLVideoElement;
                setVideoVolume(target.volume);
              }}
              className={styles.media}
              style={{
                background: 'rgba(0, 0, 0, 0.9)'
              }}
            />
          )}

          {props.item[2] === EpdsPostMediaType.YOUTUBE && (
            <iframe
              key={props.item[0]}
              className={styles.media}
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
