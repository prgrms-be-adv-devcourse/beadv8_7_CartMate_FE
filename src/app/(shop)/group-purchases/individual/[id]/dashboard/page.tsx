import type { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardView, { DashboardBackLink, DashboardSkeleton } from '../../_components/DashboardView';
import { PageHeader } from '../../_components/parts';

export const metadata: Metadata = { title: '개인물품 공동구매 주문 현황 | TEAMBUY' };

export default function IndividualGroupPurchaseDashboardPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <PageHeader title="주문 현황판">
                {/* 관리 화면 주소에 공동구매 id 가 들어가 링크도 클라이언트에서 그린다 */}
                <Suspense>
                    <DashboardBackLink />
                </Suspense>
            </PageHeader>
            {/* 요청마다 달라지는 공동구매 id 를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardView />
            </Suspense>
        </div>
    );
}
