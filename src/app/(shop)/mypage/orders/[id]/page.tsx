import type { Metadata } from 'next';
import { Suspense } from 'react';
import MyPageShell from '@/components/layout/MyPageShell';
import OrderDetailView, { OrderDetailSkeleton } from './_components/OrderDetailView';

export const metadata: Metadata = {
    title: '주문 상세 | TEAMBUY',
};

export default function OrderDetailPage() {
    return (
        <MyPageShell eyebrow="MY PAGE / ORDERS" title="주문 상세" description="주문 상품과 결제·배송 상태를 확인합니다.">
            {/* 요청마다 달라지는 주문 id를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<OrderDetailSkeleton />}>
                <OrderDetailView />
            </Suspense>
        </MyPageShell>
    );
}
