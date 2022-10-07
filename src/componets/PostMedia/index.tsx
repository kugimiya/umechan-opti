import type { Post } from "src/types/post";

import { Box } from "../Box";

export function PostMedia({ post }: { post: Post }) {
  if (!post.media) {
    return <></>;
  }

  return (
    <>
      {Boolean(post.media.images?.length) && (
        <Box flexWrap="wrap" gap="16px">
          {post.media.images?.map((media) => (
            <Box key={`${media.link}_${post.id}`} style={{ maxWidth: "100%" }}>
              <a
                href={media.link}
                rel="noreferrer"
                style={{
                  position: "relative",
                  width: "auto",
                  maxWidth: "100%",
                  height: "248px",
                }}
                target="_blank"
              >
                <img
                  alt={media.preview}
                  height="248px"
                  src={media.preview || ""}
                  style={{ maxWidth: "100%" }}
                />
              </a>
            </Box>
          ))}
        </Box>
      )}

      {Boolean(post.media.youtubes?.length) && (
        <Box flexWrap="wrap" gap="16px">
          {post.media.youtubes?.map((media) => (
            <Box key={`${media.link}_${post.id}`} style={{ maxWidth: "100%" }}>
              <a
                href={media.link}
                rel="noreferrer"
                style={{
                  position: "relative",
                  width: "auto",
                  maxWidth: "100%",
                  height: "248px",
                }}
                target="_blank"
              >
                <img
                  alt={media.preview}
                  height="248px"
                  src={media.preview || ""}
                  style={{ maxWidth: "100%" }}
                />
              </a>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
