import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ES添削AI — 企業風土に合わせた5パターン自動添削",
  description: "学生のエントリーシートを企業風土に合わせて5パターンでAI添削するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
