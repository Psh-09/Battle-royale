import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChangelogPanel from "@/components/ChangelogPanel/index";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: '⚔️ Battle Royale Simulator',
  description: '캐릭터 배틀로얄 시뮬레이터 — 능력 자동 배분, 사진 업로드 지원',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ChangelogPanel />
      </body>
    </html>
  );
}
