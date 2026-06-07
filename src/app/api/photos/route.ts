import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('rushbot-auth');
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const show = req.nextUrl.searchParams.get('show');
    const prefix = show && show !== 'all' ? `photos/${show}/` : 'photos/';
    const result = await list({ prefix });

    const photos = result.blobs.map((blob) => {
      // pathname format: photos/{show}/{timestamp}-{filename}
      const parts = blob.pathname.split('/');
      const showTag = parts[1] || 'general';
      return {
        url: blob.url,
        show: showTag,
        uploadedAt: blob.uploadedAt.toISOString(),
        filename: parts.slice(2).join('/'),
        size: blob.size,
      };
    });

    // Sort newest first
    photos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Photos list error:', error);
    return NextResponse.json({ error: 'Failed to list photos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCookie = req.cookies.get('rushbot-auth');
  if (!authCookie || !authCookie.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const show = (formData.get('show') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `photos/${show}/${timestamp}-${safeName}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      show,
      uploadedAt: new Date().toISOString(),
      filename: `${timestamp}-${safeName}`,
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
