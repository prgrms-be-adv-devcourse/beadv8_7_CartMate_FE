import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DetailSkeleton } from '../../_components/SharedStatusParts';
import SharedCartView from './_components/SharedCartView';

export const metadata: Metadata = {
    title: '공동 장바구니 | TEAMBUY',
};

export default function GroupPurchaseCartPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            {/* 요청마다 달라지는 공동구매 id를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<DetailSkeleton />}>
                <SharedCartView />
            </Suspense>
        </div>
    );
}
