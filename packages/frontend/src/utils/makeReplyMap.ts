import { EpdsPost } from "@umechan/shared";
import { ReplyMap } from "./contexts/threadReplyMap";

export const makeReplyMap = (opPost: EpdsPost): ReplyMap => {
  const map: ReplyMap = {};
  const posts = [opPost, ...opPost.replies || []];

  posts.forEach((post) => {
    const postMsgLines = post.message.split('\n');
    const pointers = postMsgLines.filter((line) => line.startsWith('>>'));
    const repliesIds = pointers
      .map((pointer) => Number(pointer.replace('>>', '')))
      .filter((id) => Number.isSafeInteger(id));

    repliesIds.forEach((id) => {
      if (map[id]) {
        map[id].push(post.id);
      } else {
        map[id] = [post.id];
      }
    });
  });

  return map;
}
