import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insight Report AI",
  description:
    "CSVをアップロードするだけで、AIによる分析・可視化・レポート生成を行うWebアプリ",
  openGraph: {
    title: "Insight Report AI",
    description:
      "CSVをアップロードするだけで、AIによる分析・可視化・レポート生成を行うWebアプリ",
    images: ["/ogp.png"],
  },
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
