import { KeyboardEvent, KeyboardEventHandler, useEffect, useMemo, useState } from 'react';
// @ts-ignore потому что нет тайпингов
import ModalImage from 'react-modal-image';
import { Box } from 'src/components/common/Box';
import { usePostsContext } from 'src/hooks/usePostsContext';
import { Image, Post } from 'src/services';
import { isServer } from 'src/utils/isServer';

export function PostMedia({ post }: { post: Post }) {
  const [visible, setVisible] = useState(false);
  const { posts } = usePostsContext();
  const [index, setIndex] = useState(-1);
  const allImages = useMemo(
    () =>
      !post.media
        ? []
        : posts
            .map((p) => p?.media?.images as Image[])
            .filter((p) => p !== undefined)
            .flatMap((i) => i),
    [posts, post.media],
  );

  useEffect(() => {
    if (visible && allImages.length && !isServer()) {
      const handler: KeyboardEventHandler = (ev) => {
        if (ev.key === 'ArrowRight') {
          setIndex((prev) => prev + 1);
        }

        if (ev.key === 'ArrowLeft') {
          setIndex((prev) => prev - 1);
        }

        return undefined;
      };

      // @ts-ignore потому что лень пока ебаться с тайпингами
      document.addEventListener('keydown', handler);
      // @ts-ignore потому что лень пока ебаться с тайпингами
      return () => document.removeEventListener('keydown', handler);
    }
  }, [visible, allImages]);

  if (!post.media) {
    return <></>;
  }

  return (
    <>
      {Boolean(post.media.images?.length) && (
        <Box flexWrap='wrap' gap='10px'>
          {post.media.images?.map((media) => (
            <Box
              key={`${media.link}_${post.id}`}
              style={{ maxWidth: '100%' }}
              onClick={() => {
                setVisible(true);
                setIndex(allImages.findIndex((_) => _.link === media.link));
              }}
            >
              <ModalImage
                onClose={() => setVisible(false)}
                small={media.preview}
                large={index !== -1 ? allImages[index]?.link || media.link : media.link}
              />
            </Box>
          ))}
        </Box>
      )}

      {Boolean(post.media.youtubes?.length) && (
        <Box flexWrap='wrap' gap='10px'>
          {post.media.youtubes?.map((media) => (
            <Box key={`${media.link}_${post.id}`} style={{ maxWidth: '100%' }}>
              <a
                href={media.link}
                rel='noreferrer'
                style={{
                  position: 'relative',
                  width: 'auto',
                  maxWidth: '100%',
                  height: '248px',
                }}
                target='_blank'
              >
                <img
                  alt={media.preview}
                  height='248px'
                  src={media.preview || ''}
                  style={{ maxWidth: '100%' }}
                />
              </a>
            </Box>
          ))}
        </Box>
      )}
    </>
  );
}
