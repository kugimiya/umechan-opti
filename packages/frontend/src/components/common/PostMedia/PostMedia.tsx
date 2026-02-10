'use client';

import { EpdsPostMedia, EpdsPostMediaType } from "@umechan/shared";
import { useContext, useState } from "react";
import { imagesOnPageContext } from "@/utils/contexts/imagesOnPage";
import { MediaModal } from "@/components/common/MediaModal/MediaModal";

type Props = {
  mediaItem: EpdsPostMedia;
  disableModal?: boolean;
}

export const PostMedia = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { imagesMap } = useContext(imagesOnPageContext);
  const [index, setIndex] = useState(imagesMap.findIndex((item) => item[0] === props.mediaItem.urlOrigin));

  if (!props.mediaItem.urlPreview || !props.mediaItem.urlOrigin) {
    return null;
  }

  const isYoutubeVideo = props.mediaItem.mediaType === EpdsPostMediaType.YOUTUBE;

  return (
    <>
      <MediaModal
        item={imagesMap[index]}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBack={() => {
          setIndex(_ => {
            const next = _ > 0 ? _ - 1 : 0;
            const targetPostElm = document
              ?.querySelector(`[data-image-index="${next}"]`) as HTMLImageElement;
            targetPostElm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return next;
          });
        }}
        onForward={() => {
          setIndex(_ => {
            const next = _ < imagesMap.length - 1 ? _ + 1 : imagesMap.length - 1;
            const targetPostElm = document
              ?.querySelector(`[data-image-index="${next}"]`) as HTMLImageElement;
            targetPostElm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return next;
          });
        }}
      />

      <div
        data-image-index={index}
        style={{
          width: isYoutubeVideo ? 168 * 1.5 : "auto",
          height: isYoutubeVideo ? 94 * 1.5  : "auto",
          cursor: 'pointer'
        }}
        onClick={() => {
          if (props.disableModal !== undefined) {
            return;
          }

          setIndex(imagesMap.findIndex((item) => item[0] === props.mediaItem.urlOrigin));
          setIsOpen(true);
        }}
      >
        <img
          src={props.mediaItem.urlPreview}
          style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
          alt="post media"
        />
      </div>
    </>
  );
}
