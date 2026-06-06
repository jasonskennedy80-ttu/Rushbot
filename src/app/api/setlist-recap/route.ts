import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('rushbot-auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await list({ prefix: 'setlist-recap/' });
    const recaps: Record<string, string[]> = {};

    for (const blob of result.blobs) {
      // pathname format: setlist-recap/show-1.json
      const match = blob.pathname.match(/setlist-recap\/(show-\d+)\.json/);
      if (match) {
        const res = await fetch(blob.url);
        if (res.ok) {
          recaps[match[1]] = await res.json();
        }
      }
    }

    return NextResponse.json(recaps);
  } catch (error) {
    console.error('Setlist recap fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch setlist recaps' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCookie = req.cookies.get('rushbot-auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { show, songs } = await req.json();

    if (!show || !Array.isArray(songs)) {
      return NextResponse.json({ error: 'Invalid data: need show and songs array' }, { status: 400 });
    }

    if (!/^show-[1-3]$/.test(show)) {
      return NextResponse.json({ error: 'Invalid show identifier' }, { status: 400 });
    }

    await put(`setlist-recap/${show}.json`, JSON.stringify(songs), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ success: true, show, songs });
  } catch (error) {
    console.error('Setlist recap save error:', error);
    return NextResponse.json({ error: 'Failed to save setlist recap' }, { status: 500 });
  }
}
