/**
 * BlockyKids - Root Layout
 */

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'BlockyKids - Belajar Coding Menyenangkan',
  description: 'Platform pembelajaran coding untuk siswa Sekolah Dasar dengan block programming dan game interaktif',
  keywords: ['coding', 'pembelajaran', 'anak-anak', 'blockly', 'programming', 'game'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script src="https://unpkg.com/blockly/blockly.min.js" defer />
      </head>
      <body className={outfit.variable}>
        {children}

        {/* Toast Container */}
        <div id="toast-container" className="toast-container" />
      </body>
    </html>
  );
}
