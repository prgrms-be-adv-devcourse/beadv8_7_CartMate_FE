import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import QueryProvider from './query-provider';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'TEAMBUY - 팀 스포츠 공동구매 플랫폼',
    description: '스포츠 단체복 · 장비 커스텀 공동구매 플랫폼',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: ReactNode;
}) {
    return (
        <html lang="ko" className={inter.variable}>
        <head>
            {/* App Router 루트 레이아웃이라 모든 페이지에 적용됨 (pages/_document 전용 규칙) */}
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            />
        </head>
        {/* 브라우저 확장(ColorZilla 등)이 body 에 속성을 주입해 생기는 hydration 경고 방지 */}
        <body className="font-body-md text-body-md text-on-surface antialiased" suppressHydrationWarning>
            <QueryProvider>{children}</QueryProvider>
        </body>
        </html>
    );
}
