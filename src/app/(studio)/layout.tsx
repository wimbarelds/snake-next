import './studio-base.css';

export const metadata = {
  title: 'Snake++',
  description: 'A little bit of retro with 2 table spoons of overengineering',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
