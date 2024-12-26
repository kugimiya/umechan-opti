import { EpdsPost, EpdsPostMediaType } from "@/types/epds";
import { ImagesMap } from "@/utils/contexts/images_on_page";

export const make_images_map = (posts: EpdsPost[]): ImagesMap => {
  let result: ImagesMap = [];

  posts.forEach((post) => {
    (post.media || []).forEach((item) => {
      if (item.type === EpdsPostMediaType.PISSYKAKA_IMAGE) {
        result.push([item.media_url, post.id]);
      }
    });

    if (post.replies) {
      result = [...result, ...make_images_map(post.replies)];
    }
  });

  return result;
}
