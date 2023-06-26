import type { NextResponse } from 'next/server';

export function createUrl(base: string, params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams}`;
}

type ResponseCookie = Exclude<ReturnType<NextResponse['cookies']['get']>, undefined>;
type CookieOpts = Partial<Omit<ResponseCookie, 'name' | 'value'>>;

export function addCookies(cookies: Record<string, string>, opts?: CookieOpts) {
  return {
    to: <T extends NextResponse>(response: T): T => {
      for (const [name, value] of Object.entries(cookies)) {
        response.cookies.set(name, value, opts);
      }
      return response;
    },
  };
}
