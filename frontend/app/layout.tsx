import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insight Report AI",
  description: "CSVから分析レポートを自動生成するWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
