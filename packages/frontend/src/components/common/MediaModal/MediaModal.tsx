'use client';

import { ImagesMapItem } from "@/utils/contexts/imagesOnPage";
import { useEffect, useRef, useState } from "react";
import { EpdsPostMediaType } from "@umechan/shared";
import styles from './styles.module.css'

type Props = {
  item: ImagesMapItem;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onForward: () => void;
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
    if (ref.current && props.isOpen) {
      (ref.current.firstChild as HTMLDivElement).focus();
    }
  }, [ref.current, props.isOpen]);

  if (!props.isOpen) {
    return null;
  }

  return (
    <div ref={ref} style={{ zIndex: 1 }}>
      <div
        onClick={props.onClose}
        className={styles.root}
        tabIndex={-1}
        onKeyDown={(ev) => {
          if (ev.key === 'Escape') {
            props.onClose();
          }

          if (ev.key === 'ArrowLeft') {
            props.onBack();
          }

          if (ev.key === 'ArrowRight') {
            props.onForward();
          }
        }}
      >
        <div
          onClick={(ev) => ev.stopPropagation()}
          className={styles.inner}
        >
          <button onClick={props.onBack} style={{ padding: '4px' }}>{"<"}</button>

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

          <button onClick={props.onForward} style={{ padding: '4px' }}>{">"}</button>
        </div>

        {props.item[0]}
      </div>
    </div>
  );
}
