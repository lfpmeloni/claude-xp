import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'claude-xp',
  description: 'Claude Code experiments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
