import { ImageResponse } from 'next/og';


export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 256,
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        L
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
