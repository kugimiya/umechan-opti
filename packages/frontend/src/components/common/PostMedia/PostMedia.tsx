'use client';

import { EpdsPostMedia, EpdsPostMediaType } from "@/types/epds";
import { useContext, useState } from "react";
import { imagesOnPageContext } from "@/utils/contexts/images_on_page";
import { MediaModal } from "@/components/common/MediaModal/MediaModal";

type Props = {
  media_item: EpdsPostMedia;
  disable_modal?: boolean;
}

export const PostMedia = (props: Props) => {
  const [is_open, set_is_open] = useState(false);
  const { images_map } = useContext(imagesOnPageContext);
  const [index, set_index] = useState(images_map.findIndex((item) => item[0] === props.media_item.urlOrigin));

  if (!props.media_item.urlPreview || !props.media_item.urlOrigin) {
    return null;
  }

  const is_youtube_video = props.media_item.mediaType === EpdsPostMediaType.YOUTUBE;

  return (
    <>
      <MediaModal
        item={images_map[index]}
        is_open={is_open}
        on_close={() => set_is_open(false)}
        on_back={() => {
          set_index(_ => {
            const next = _ > 0 ? _ - 1 : 0;
            const target_post_elm = document
              ?.querySelector(`[data-image-index="${next}"]`) as HTMLImageElement;
            target_post_elm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return next;
          });
        }}
        on_forward={() => {
          set_index(_ => {
            const next = _ < images_map.length - 1 ? _ + 1 : images_map.length - 1;
            const target_post_elm = document
              ?.querySelector(`[data-image-index="${next}"]`) as HTMLImageElement;
            target_post_elm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return next;
          });
        }}
      />

      <div
        data-image-index={index}
        style={{
          width: is_youtube_video ? 168 * 1.5 : "auto",
          height: is_youtube_video ? 94 * 1.5  : "auto",
          cursor: 'pointer'
        }}
        onClick={() => {
          if (props.disable_modal !== undefined) {
            return;
          }

          set_index(images_map.findIndex((item) => item[0] === props.media_item.urlOrigin));
          set_is_open(true);
        }}
      >
        <img
          src={props.media_item.urlPreview}
          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
          alt="post media"
        />
      </div>
    </>
  );
}
