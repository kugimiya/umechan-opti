import { EpdsPost, EpdsPostMediaType } from "@/types/epds";
import { ImagesMap } from "@/utils/contexts/images_on_page";

export const make_media_map = (posts: EpdsPost[]): ImagesMap => {
  let result: ImagesMap = [];

  posts.forEach((post) => {
    (post.media || []).forEach((item) => {
      result.push([item.media_url, post.id, item.type]);
    });

    if (post.replies) {
      result = [...result, ...make_media_map(post.replies)];
    }
  });

  return result;
}
