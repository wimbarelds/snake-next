import { Navigation } from '@/components/Navigation/Navigation';
import './globals.css';
import QueryProvider from '@/components/QueryClientProvider/QueryClientProvider';

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navigation />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
