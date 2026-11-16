import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "KOR｜ふたりの旅のしおり",
  description:
    "行きたいスポットを地図に集めて、入場料・ホテル・持ち物まで。ふたりの海外旅行を一緒に計画するアプリ。",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KOR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16213a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
