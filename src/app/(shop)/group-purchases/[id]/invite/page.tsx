import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DetailSkeleton } from '../../_components/SharedStatusParts';
import InviteJoinView from './_components/InviteJoinView';

export const metadata: Metadata = {
    title: '공동구매 초대 | TEAMBUY',
};

export default function GroupPurchaseInvitePage() {
    return (
        <div className="max-w-[880px] mx-auto px-gutter py-space-xl">
            {/* 요청마다 달라지는 공동구매 id·초대 코드를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<DetailSkeleton />}>
                <InviteJoinView />
            </Suspense>
        </div>
    );
}
