'use client';

import Lightbox from "react-modal-image";
import { EpdsPostMedia, EpdsPostMediaType } from "@/types/epds";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { imagesOnPageContext } from "@/utils/contexts/images_on_page";

type Props = {
  media_item: EpdsPostMedia;
}

const backdropClassname = '__react_modal_image__modal_content';

export const PostMedia = (props: Props) => {
  const { images_map } = useContext(imagesOnPageContext);
  const [is_open, set_is_open] = useState(false);
  const index = images_map.findIndex((item) => item[0] === props.media_item.media_url);

  useEffect(() => {
    const key_listener = (event: KeyboardEvent) => {
      if (is_open) {
        const is_left = event.key === "ArrowLeft";
        const is_right = event.key === "ArrowRight";

        if (!is_left && !is_right) {
          return;
        }

        const index = images_map.findIndex((item) => item[0] === props.media_item.media_url);
        const nextIndex = index + (is_left ? -1 : 0) + (is_right ? 1 : 0);

        if (nextIndex >= 0 && nextIndex < images_map.length) {
          const cur_post_elm = document
            ?.querySelector(`[data-image-index="${index}"] .${backdropClassname}`) as HTMLDivElement;
          const mousedown = new Event('mousedown', { bubbles: true });
          const click = new Event('click', { bubbles: true });

          const item = images_map[nextIndex];
          const target_post_elm = document
            ?.querySelector(`[data-image-index="${nextIndex}"] img`) as HTMLImageElement;

          target_post_elm?.scrollIntoView();
          target_post_elm?.dispatchEvent(click);
          cur_post_elm?.dispatchEvent(mousedown);
        }
      }
    };

    const close_listener = (event: MouseEvent) => {
      const elm = (event.target as HTMLElement);
      if (is_open && elm.classList.contains(backdropClassname)) {
        set_is_open(false);
      }
    }

    window.addEventListener('keyup', key_listener);
    window.addEventListener('mousedown', close_listener);

    return () => {
      window.removeEventListener('keyup', key_listener);
      window.removeEventListener('mousedown', close_listener);
    };
  }, [is_open]);

  if (!props.media_item.preview_image_url || !props.media_item.media_url) {
    return null;
  }

  const is_video = props.media_item.type === EpdsPostMediaType.YOUTUBE || props.media_item.type === EpdsPostMediaType.VIDEO;

  return (
    <div
      style={{
        position: 'relative',
        width: is_video ? 168 * 1.5 : "auto",
        height: is_video ? 94 * 1.5  : "auto",
        cursor: 'pointer'
      }}
      onClick={() => {
        if (is_video) {
          window.open(props.media_item.media_url);
        } else {
          set_is_open(true);
        }
      }}
    >
      {is_video && (
        <Image
          src={props.media_item.preview_image_url}
          style={{ objectFit: 'cover' }}
          fill={true}
          alt="post video"
        />
      )}

      {!is_video && (
        <div data-image-index={index}>
          <Lightbox
            small={props.media_item.preview_image_url}
            large={props.media_item.media_url}
            alt="post image"
          />
        </div>
      )}
    </div>
  );
}
