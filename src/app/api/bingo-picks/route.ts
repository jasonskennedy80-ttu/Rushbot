import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

export interface BingoPick {
  songs: string[];
  firstSong: string | null;
  lastSong: string | null;
  updatedAt: string;
}

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('rushbot-auth');
  if (!auth || !auth.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: 'bingo-picks/' });
    const allPicks: Record<string, BingoPick> = {};

    await Promise.all(
      blobs.map(async (blob) => {
        const name = blob.pathname.replace('bingo-picks/', '').replace('.json', '');
        const res = await fetch(blob.url);
        if (res.ok) {
          allPicks[name] = await res.json();
        }
      })
    );

    return NextResponse.json(allPicks);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  const auth = req.cookies.get('rushbot-auth');
  if (!auth || !auth.value) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { user, picks } = await req.json();
    if (!user || typeof user !== 'string' || !picks) {
      return NextResponse.json({ error: 'Missing user or picks' }, { status: 400 });
    }

    if (!Array.isArray(picks.songs) || picks.songs.length > 20) {
      return NextResponse.json({ error: 'Must have up to 20 songs' }, { status: 400 });
    }

    const data: BingoPick = {
      songs: picks.songs,
      firstSong: picks.firstSong || null,
      lastSong: picks.lastSong || null,
      updatedAt: new Date().toISOString(),
    };

    const name = user.toLowerCase().trim();
    await put(`bingo-picks/${name}.json`, JSON.stringify(data), {
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
