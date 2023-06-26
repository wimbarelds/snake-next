export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO: Do shared layout stuff for level editor here, such as titlebar etc
  return (
    <div>
      <div>Titlebar</div>
      <main>{children}</main>
    </div>
  );
}
