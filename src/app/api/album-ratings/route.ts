import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('rushbot-auth');
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { blobs } = await list({ prefix: 'album-ratings/' });
    const allRatings: Record<string, Record<string, number>> = {};

    await Promise.all(
      blobs.map(async (blob) => {
        const name = blob.pathname.replace('album-ratings/', '').replace('.json', '');
        const res = await fetch(blob.url);
        if (res.ok) {
          allRatings[name] = await res.json();
        }
      })
    );

    return NextResponse.json(allRatings);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  const auth = req.cookies.get('rushbot-auth');
  if (!auth) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { user, ratings } = await req.json();
    if (!user || typeof user !== 'string' || !ratings) {
      return NextResponse.json({ error: 'Missing user or ratings' }, { status: 400 });
    }

    const name = user.toLowerCase().trim();
    await put(`album-ratings/${name}.json`, JSON.stringify(ratings), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
