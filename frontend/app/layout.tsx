import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://insight-report-ai-kensuke.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Insight Report AI",
  description:
    "CSVをアップロードするだけで、AIによる分析・可視化・レポート生成を行うWebアプリ",
  openGraph: {
    title: "Insight Report AI",
    description:
      "CSVをアップロードするだけで、AIによる分析・可視化・レポート生成を行うWebアプリ",
    url: siteUrl,

    siteName: "Insight Report AI",

    images: [
      {
        url: `${siteUrl}/ogp.png`,
        width: 1200,
        height: 630,
        alt: "Insight Report AI",
      },
    ],

    locale: "ja_JP",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Insight Report AI",
    description:
      "CSVをアップロードするだけで、AIによる分析・可視化・レポート生成を行うWebアプリ",

    images: [`${siteUrl}/ogp.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}a</body>
    </html>
  );
}
