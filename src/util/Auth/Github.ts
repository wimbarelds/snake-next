import { createUrl } from '../url';

export async function getGithubAccessToken(code: string): Promise<string | null> {
  return fetch(
    createUrl('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID ?? '',
      client_secret: process.env.GITHUB_CLIENT_SECRET ?? '',
      code,
    }),
    {
      method: 'POST',
    },
  )
    .then((res) => res.text())
    .then((query) => new URLSearchParams(query).get('access_token'));
}

export async function getGithubUser(accessToken: string) {
  return fetch(`https://api.github.com/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then((res) => res.json());
}
