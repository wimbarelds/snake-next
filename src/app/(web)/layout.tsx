import './globals.css';

import localFont from 'next/font/local';

import { AlertOutlet, AlertProvider } from '@/components/AlertProvider/AlertProvider';
import { Navigation } from '@/components/Navigation/Navigation';
import QueryProvider from '@/components/QueryClientProvider/QueryClientProvider';

const arcadeFont = localFont({ src: './ARCADE_N.woff', variable: '--font-arcade' });

export const metadata = {
  title: 'Snake++',
  description: 'A little bit of retro with 2 table spoons of overengineering',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={arcadeFont.className}>
        <QueryProvider>
          <AlertProvider>
            <Navigation />
            {children}
            <AlertOutlet />
          </AlertProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
