import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.RUSHBOT_PASSWORD || 'rush2112';

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('rushbot-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Wrong password, man!' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}
