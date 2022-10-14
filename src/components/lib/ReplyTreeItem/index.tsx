import { useState } from 'react';
import { Popover } from 'react-tiny-popover';
import { Box } from 'src/components/common/Box';
import { Text, TextVariant } from 'src/components/common/Text';
import { Post } from 'src/services';
import { theme } from 'src/theme';
import styled from 'styled-components';

import { PostComponent } from '../PostComponent';

const Child = styled(Box)`
  z-index: 12;
  width: auto;
  max-width: 640px;
  box-shadow: 0px 0px 8px 0px rgba(34, 60, 80, 0.2);
`;

export const ReplyTreeItem = ({
  replyPost,
  variant = TextVariant.textButton,
  color = 'colorTextLink',
}: {
  replyPost: Post;
  variant?: TextVariant;
  color?: keyof typeof theme.colors;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <Box
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <Popover
        isOpen={visible}
        padding={2}
        positions={['bottom', 'right']} // preferred positions by priority
        align='start'
        content={<Child>{visible && <PostComponent post={replyPost} />}</Child>}
      >
        <Text variant={variant} color={color}>{`>>${replyPost.id}`}</Text>
      </Popover>
    </Box>
  );
};
