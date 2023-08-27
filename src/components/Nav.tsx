import { Card, Space } from 'antd';
import { Board } from '../lib/types';
import Link from 'next/link';

type Props = {
  boards: Board[];
};

export const Nav = ({ boards }: Props) => {
  return (
    <Space style={{ display: 'flex', columnGap: '24px' }}>
      <Link href='/'>/</Link>

      {boards.map((board) => (
        <Link key={board.tag} href={`/${board.tag}`}>
          /{board.tag}
        </Link>
      ))}
    </Space>
  );
};
