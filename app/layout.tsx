import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 옷장 | What's in My Closet",
  description: "내 옷장에 있는 옷들을 관리하고 코디를 저장하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
