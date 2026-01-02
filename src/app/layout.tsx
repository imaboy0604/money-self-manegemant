import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "借入金管理アプリ",
  description: "個人の借入金を管理し、完済を目指すためのWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

