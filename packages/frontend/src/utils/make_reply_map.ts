import { EpdsPost } from "@/types/epds";
import { ReplyMap } from "./contexts/thread_reply_map";

export const make_reply_map = (op_post: EpdsPost): ReplyMap => {
  const map: ReplyMap = {};
  const posts = [op_post, ...op_post.replies || []];

  posts.forEach((post) => {
    const post_msg_lines = post.post_message.split('\n');
    const pointers = post_msg_lines.filter((line) => line.startsWith('>>'));
    const replies_ids = pointers
      .map((pointer) => Number(pointer.replace('>>', '')))
      .filter((id) => Number.isSafeInteger(id));

    replies_ids.forEach((id) => {
      if (map[id]) {
        map[id].push(post.id);
      } else {
        map[id] = [post.id];
      }
    });
  });

  return map;
}
