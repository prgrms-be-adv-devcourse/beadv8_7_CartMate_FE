import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Button, Card } from '@astryxdesign/core';
import MyPageShell from '@/components/layout/MyPageShell';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ClaimContent from './_components/ClaimContent';

export const metadata: Metadata = {
    title: '교환 및 환불 요청 | TEAMBUY',
};

// BE 규칙(DeliveryClaimCreateUseCase · DeliveryClaimApproveUseCase)을 그대로 안내한다.
const NOTICES = [
    '배송 완료된 상품만 신청할 수 있으며, 구매 확정 후에는 신청할 수 없습니다.',
    '판매자별로 배송이 나뉜 주문은 배송 단위로 한 번씩 신청합니다.',
    '반품(환불)은 판매자가 승인하는 즉시 결제한 예치금으로 돌려드립니다.',
    '처리 중인 요청에 포함된 상품은 다시 신청할 수 없습니다.',
];

export default function OrderClaimPage() {
    return (
        <MyPageShell title="교환 및 환불 요청" description="배송 완료된 상품의 교환 또는 반품(환불)을 접수합니다.">
            <div className="flex flex-col gap-space-lg">
                {/* 주문 id(동적 경로)를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={<ClaimSkeleton />}>
                    <ClaimContent />
                </Suspense>
                <Card>
                    <div className="font-label-md text-label-md text-on-surface mb-space-md">신청 안내</div>
                    <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                        {NOTICES.map((notice) => (
                            <li key={notice} className="flex items-start gap-space-xs">
                                <Icon name="info" className="text-[16px] text-outline mt-0.5" />
                                <span>{notice}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <div>
                    <Button label="내 교환 · 환불 내역" variant="secondary" href={ROUTES.myClaims} endContent={<Icon name="chevron_right" className="text-outline" />} />
                </div>
            </div>
        </MyPageShell>
    );
}

function ClaimSkeleton() {
    return (
        <div className="flex flex-col gap-space-xl" aria-busy="true">
            <div className="h-48 bg-surface-container-low border border-outline-variant rounded animate-pulse" />
            <div className="h-72 bg-surface-container-low border border-outline-variant rounded animate-pulse" />
        </div>
    );
}
