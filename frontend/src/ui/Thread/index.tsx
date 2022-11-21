import React, { FC, memo } from 'react';

import { ApiComponentThreadState } from '../../service/base.api';
import { Box } from '../Box';
import { PostContainer } from '../PostContainer';

interface ThreadProps {
  data: ApiComponentThreadState;
}

const Thread: FC<ThreadProps> = ({ data }) => {
  return (
    <>
      {data.posts?.map((post) => (
        <Box
          key={post.id}
          flexDirection='column'
          gap={8}
          justifyContent='flex-start'
          alignItems='flex-start'
          maxWidth='100%'
          style={{ marginBottom: '20px' }}
        >
          <PostContainer post={post} opPost />
        </Box>
      ))}
    </>
  );
};

export default memo(Thread);
