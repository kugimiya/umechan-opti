import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'experimental-edge',
};

export default function OG(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hasTitle = searchParams.has('title');
  const title = hasTitle ? searchParams.get('title')?.slice(0, 100) : '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#555' }}>Юмечан</span>

        <span style={{ fontWeight: 'lighter', fontSize: 98 }}>{title}</span>
      </div>
    ),
  );
}
