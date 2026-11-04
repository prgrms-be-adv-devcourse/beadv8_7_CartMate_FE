import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import DeliveryDetailView, { DeliveryDetailSkeleton } from './_components/DeliveryDetailView';

export const metadata: Metadata = {
    title: '배송 상세 | TEAMBUY',
};

export default function DeliveryDetailPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl w-full">
            <nav className="flex items-center gap-2 text-secondary font-body-sm text-body-sm mb-space-md">
                <Link className="hover:text-primary" href={ROUTES.myPage}>
                    마이페이지
                </Link>
                <Icon name="chevron_right" className="text-[14px] text-outline" />
                <Link className="hover:text-primary" href={ROUTES.deliveries}>
                    배송 조회
                </Link>
                <Icon name="chevron_right" className="text-[14px] text-outline" />
                <span className="text-on-surface">배송 상세</span>
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <div className="lg:col-span-3">
                    <MyPageSidebar />
                </div>
                <div className="lg:col-span-9">
                    {/* 요청마다 달라지는 배송 id를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense fallback={<DeliveryDetailSkeleton />}>
                        <DeliveryDetailView />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
