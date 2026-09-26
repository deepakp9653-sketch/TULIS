import './globals.css';
import type { Metadata } from 'next';
import { GoogleAuthProvider } from '@/components/GoogleAuthProvider';

export const metadata: Metadata = {
  title: 'Tulis — One Trip. One Ledger. Zero Confusion.',
  description: 'FinTech Precision × Group Fairness. Dynamic Split Engine & Zero-Sum Settlement Platform.',
  icons: {
    icon: '/tulis-logo.png.jpeg',
    shortcut: '/tulis-logo.png.jpeg',
    apple: '/tulis-logo.png.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-base text-ink-primary min-h-screen antialiased">
        <GoogleAuthProvider>
          {children}
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
