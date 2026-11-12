import type { Metadata } from 'next';
import { Suspense } from 'react';
import MyPageShell from '@/components/layout/MyPageShell';
import DeliveryDetailView, { DeliveryDetailSkeleton } from './_components/DeliveryDetailView';

export const metadata: Metadata = {
    title: '배송 상세 | TEAMBUY',
};

export default function DeliveryDetailPage() {
    return (
        <MyPageShell eyebrow="MY PAGE / DELIVERIES" title="배송 상세" description="배송 단계와 구매 확정 가능 여부를 확인합니다.">
            {/* 요청마다 달라지는 배송 id를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<DeliveryDetailSkeleton />}>
                <DeliveryDetailView />
            </Suspense>
        </MyPageShell>
    );
}
