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

  return NextResponse.next();
}
