import { Card, Space } from 'antd';
import { boardApi } from '../lib/api';

export default async function Home() {
  const { posts } = (await boardApi.latestPosts()).payload;

  return (
    <Space direction='vertical'>
      {posts.map((post) => (
        <Card key={post.id}>{post.truncated_message}</Card>
      ))}
    </Space>
  );
}
