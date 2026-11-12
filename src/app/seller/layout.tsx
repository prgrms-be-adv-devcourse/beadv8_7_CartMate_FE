import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core';
import SellerSidebar from '@/components/layout/SellerSidebar';

export default function SellerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-surface">
            <SellerSidebar />
            <div className="pl-64">
                <header className="fixed top-0 left-64 right-0 z-40 flex h-16 items-center border-b border-outline-variant/40 bg-surface/90 px-space-xl backdrop-blur-xl">
                    <div>
                        <Text type="supporting" weight="semibold">판매자 워크스페이스</Text>
                        <Text type="supporting" color="secondary">상품 운영부터 배송과 정산까지 한곳에서 관리합니다.</Text>
                    </div>
                </header>
                <main className="relative min-h-[calc(100vh-4rem)] px-space-xl pb-space-xl pt-24">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
                <footer className="border-t border-outline-variant/40 bg-surface py-space-lg">
                    <div className="mx-auto max-w-7xl px-space-xl text-center">
                        <Text type="supporting" color="secondary">TEAMBUY 판매자 센터</Text>
                    </div>
                </footer>
            </div>
        </div>
    );
}
