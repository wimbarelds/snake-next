import { SignJWT } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';

import { getGithubAccessToken, getGithubUser } from '@/util/Auth/Github';
import { addCookies } from '@/util/url';

async function handler(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') ?? '';
  const accessToken = await getGithubAccessToken(code);
  if (!accessToken) {
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
  const user = await getGithubUser(accessToken);
  if (!user) {
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60; // one hour
  const jwt = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET ?? ''));

  return addCookies({ JWT_GITHUB: jwt }, { httpOnly: true }).to(
    // TODO: Figure out redirect back to source
    NextResponse.redirect(new URL('/test', request.url)),
  );
}

export { handler as GET };
