'use server';

import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export function getGithubLogin() {
  const githubCookie = cookies().get('JWT_GITHUB')?.value;
  if (!githubCookie) return null;

  return verify(githubCookie, process.env.JWT_SECRET ?? '');
}
