import { Post } from "src/types/post";
import { Box } from "../Box";

export const PostMedia = ({ post }:{ post: Post }) => {
  if (!Boolean(post.media)) {
    return <></>;
  }

  return (
    <>
      {Boolean(post.media?.images?.length) && (
        <Box gap="16px" flexWrap="wrap">
          {post.media?.images?.map((media) => (
            <Box key={`${media.link}_${post.id}`} style={{ maxWidth: '100%' }}>
              <a href={media.link} target="_blank" rel="noreferrer" style={{ position: 'relative', width: 'auto', maxWidth: '100%', height: '248px' }}>
                <img src={media.preview || ''} alt={media.preview} height="248px" style={{ maxWidth: '100%' }} />
              </a>
            </Box>
          ))}
        </Box>
      )}

      {Boolean(post.media?.youtubes?.length) && (
        <Box gap="16px" flexWrap="wrap">
          {post.media?.youtubes?.map((media) => (
            <Box key={`${media.link}_${post.id}`} style={{ maxWidth: '100%' }}>
              <a href={media.link} target="_blank" rel="noreferrer" style={{ position: 'relative', width: 'auto', maxWidth: '100%', height: '248px' }}>
                <img src={media.preview || ''} alt={media.preview} height="248px" style={{ maxWidth: '100%' }} />
              </a>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};
