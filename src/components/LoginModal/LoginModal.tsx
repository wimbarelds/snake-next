import { createUrl } from '@/util/url';

export default function LoginModal() {
  const githubUrl = createUrl('https://github.com/login/oauth/authorize', {
    client_id: process.env.GITHUB_CLIENT_ID ?? '',
    scope: 'user:email',
  });

  return (
    <section
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2>Login</h2>
      <a href={githubUrl}>Login with Github</a>
    </section>
  );
}
