import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDefaultLevelName } from '@/actions/actions';

const defaultLevel = getDefaultLevelName();
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/' || path === '/play' || path === '/play/') {
    return NextResponse.rewrite(
      `${request.nextUrl.protocol}//${request.nextUrl.host}/play/${await defaultLevel}`,
    );
  }

  if (path.startsWith('/test')) {
    const githubCookie = request.cookies.get('JWT_GITHUB')?.value;
    if (githubCookie) {
      const { payload } = await jwtVerify(
        githubCookie,
        new TextEncoder().encode(process.env.JWT_SECRET ?? ''),
      );
      console.log(payload);
    } else {
      console.log({ githubCookie });
    }
  }

  return NextResponse.next();
}
