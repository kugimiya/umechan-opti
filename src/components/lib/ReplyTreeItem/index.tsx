import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';
import styled from 'styled-components';

import { PostComponent } from '../PostComponent';

const ReplyContainer = styled(Box)`
  .child {
    display: none;
    visibility: hidden;

    position: absolute;
    top: 10px;
    left: 0;

    z-index: 1;
    width: 640px;
    max-width: 640px;
    box-shadow: 0px 0px 8px 0px rgba(34, 60, 80, 0.2);
  }

  .child .post {
    width: 100%;
  }

  &:hover > .child {
    display: flex;
    visibility: visible;
  }
`;

export const ReplyTreeItem = ({ replyPost }: { replyPost: Post }) => {
  return (
    <ReplyContainer style={{ cursor: 'pointer', position: 'relative' }}>
      <Text variant={TextVariant.textButton} color='colorTextLink'>{`>>${replyPost.id}`}</Text>

      <Box className='child'>
        <PostComponent post={replyPost} />
      </Box>
    </ReplyContainer>
  );
};
