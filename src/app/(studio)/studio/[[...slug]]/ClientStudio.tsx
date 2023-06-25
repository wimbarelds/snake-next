import dynamic from 'next/dynamic';

import config from '@/../sanity.config';

const Studio = dynamic(() => import('sanity').then((module) => module.Studio), { ssr: false });

export function ClientStudio() {
  return <Studio config={config} />;
}
