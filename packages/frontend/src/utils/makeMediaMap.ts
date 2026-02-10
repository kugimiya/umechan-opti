import { EpdsPost } from "@umechan/shared";
import { ImagesMap } from "@/utils/contexts/imagesOnPage";

export const makeMediaMap = (posts: EpdsPost[]): ImagesMap => {
  let result: ImagesMap = [];

  posts.forEach((post) => {
    (post.media || []).forEach((item) => {
      result.push([item.urlOrigin, post.id, item.mediaType]);
    });

    if (post.replies) {
      result = [...result, ...makeMediaMap(post.replies)];
    }
  });

  return result;
}
