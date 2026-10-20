import type { Metadata } from 'next';
import { Suspense } from 'react';
import InviteView, { InviteSkeleton } from '../../_components/InviteView';
import { PageHeader } from '../../_components/parts';

export const metadata: Metadata = { title: '공동구매 참여 | TEAMBUY' };

export default function IndividualGroupPurchaseInvitePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <PageHeader title="공동구매 참여" />
            {/* 요청마다 달라지는 초대 코드를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<InviteSkeleton />}>
                <InviteView />
            </Suspense>
        </div>
    );
}
