import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.cookies.get('rushbot-auth');
  if (!auth || auth.value === '' || auth.value === 'authenticated') {
    return NextResponse.json({ authenticated: !!auth, user: null });
  }
  return NextResponse.json({ authenticated: true, user: auth.value });
}

export async function POST(req: NextRequest) {
  try {
    const { password, name } = await req.json();
    const correctPassword = process.env.RUSHBOT_PASSWORD || 'rush2112';

    if (password === correctPassword) {
      const userName = (name || '').trim();
      if (!userName) {
        return NextResponse.json({ success: false, error: 'Pick your name!' }, { status: 400 });
      }
      const response = NextResponse.json({ success: true, user: userName });
      response.cookies.set('rushbot-auth', userName, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Wrong password, man!' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
