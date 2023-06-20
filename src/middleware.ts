import { getDefaultLevelName } from "@/actions/actions";
import { NextRequest, NextResponse } from "next/server";

const defaultLevel = getDefaultLevelName();
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/' || path === '/play' || path === '/play/') {
    return NextResponse.rewrite(`${request.nextUrl.protocol}//${request.nextUrl.host}/play/${await defaultLevel}`);
  }
}