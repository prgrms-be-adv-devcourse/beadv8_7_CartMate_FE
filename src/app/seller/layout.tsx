import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core';
import SellerSidebar from '@/components/layout/SellerSidebar';

export default function SellerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-surface">
            <SellerSidebar />
            <div className="md:pl-64">
                <header className="sticky top-0 z-40 flex h-16 items-center border-b border-outline-variant/40 bg-surface/90 px-space-md backdrop-blur-xl md:fixed md:left-64 md:right-0 md:px-space-xl">
                    <div>
                        <Text type="supporting" weight="semibold">판매자 워크스페이스</Text>
                        <Text type="supporting" color="secondary">상품 운영부터 배송과 정산까지 한곳에서 관리합니다.</Text>
                    </div>
                </header>
                <main className="relative min-h-[calc(100vh-4rem)] px-space-md pb-space-xl pt-space-xl md:px-space-xl md:pt-24">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
                <footer className="border-t border-outline-variant/40 bg-surface py-space-lg">
                    <div className="mx-auto max-w-7xl px-space-md text-center md:px-space-xl">
                        <Text type="supporting" color="secondary">TEAMBUY 판매자 센터</Text>
                    </div>
                </footer>
            </div>
        </div>
    );
}
