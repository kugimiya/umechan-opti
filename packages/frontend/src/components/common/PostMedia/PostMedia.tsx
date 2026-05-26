'use client';

import { EpdsPostMedia, EpdsPostMediaType } from "@umechan/shared";
import { useContext, useMemo } from "react";
import { imagesOnPageContext, type ImagesMapItem } from "@/utils/contexts/imagesOnPage";
import { mediaModalHostContext } from "@/utils/contexts/mediaModalHost";

type Props = {
  mediaItem: EpdsPostMedia;
  disableGlobalModal?: boolean;
};

const toModalItem = (mediaItem: EpdsPostMedia): ImagesMapItem => [
  mediaItem.urlOrigin,
  mediaItem.postId,
  mediaItem.mediaType,
];

export const PostMedia = (props: Props) => {
  const isLocalModal = Boolean(props.disableGlobalModal);
  const { imagesMap } = useContext(imagesOnPageContext);
  const { open: openMediaModal } = useContext(mediaModalHostContext);

  const localModalItem = useMemo(() => toModalItem(props.mediaItem), [props.mediaItem]);

  if (!props.mediaItem.urlPreview || !props.mediaItem.urlOrigin) {
    return null;
  }

  const isYoutubeVideo = props.mediaItem.mediaType === EpdsPostMediaType.YOUTUBE;
  const globalIndex = isLocalModal
    ? -1
    : imagesMap.findIndex((item) => item[0] === props.mediaItem.urlOrigin);

  return (
    <div
      {...(!isLocalModal && globalIndex >= 0 ? { "data-image-index": globalIndex } : {})}
      style={{
        width: isYoutubeVideo ? 168 * 1.5 : "auto",
        height: isYoutubeVideo ? 94 * 1.5 : "auto",
        cursor: "pointer",
      }}
      onClick={() => {
        if (isLocalModal) {
          openMediaModal({ items: [localModalItem], index: 0, navigation: false });
          return;
        }

        if (globalIndex < 0) return;

        openMediaModal({ items: imagesMap, index: globalIndex, navigation: true });
      }}
    >
      <img
        src={isYoutubeVideo ? "https://rkn.gov.ru" : props.mediaItem.urlPreview}
        style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
        alt={isYoutubeVideo ? "yt video" : "post media"}
      />
    </div>
  );
};
