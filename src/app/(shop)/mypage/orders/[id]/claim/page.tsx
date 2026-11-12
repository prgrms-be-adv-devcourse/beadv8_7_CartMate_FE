import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button, Card, Heading, Text } from '@astryxdesign/core';
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
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                <div className="mb-space-xl">
                    <nav className="flex items-center gap-2 text-secondary font-body-sm text-body-sm mb-space-xs">
                        <Link className="hover:text-primary" href={ROUTES.myPage}>
                            마이페이지
                        </Link>
                        <Icon name="chevron_right" className="text-[14px] text-outline" />
                        <Link className="hover:text-primary" href={ROUTES.orders}>
                            주문 내역
                        </Link>
                        <Icon name="chevron_right" className="text-[14px] text-outline" />
                        <span className="text-on-surface">교환 · 환불 신청</span>
                    </nav>
                    <Heading level={1}>교환 및 환불 요청</Heading>
                    <Text color="secondary">배송 완료된 상품의 교환 또는 반품(환불)을 접수합니다.</Text>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    <aside className="lg:col-span-3 flex flex-col gap-space-lg lg:sticky lg:top-36">
                        <Card padding={3}>
                            <div className="font-label-md text-label-md text-on-surface mb-space-md pb-space-xs border-b border-surface-container">신청 안내</div>
                            <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                                {NOTICES.map((notice) => (
                                    <li key={notice} className="flex items-start gap-space-xs">
                                        <Icon name="info" className="text-[16px] text-outline mt-0.5" />
                                        <span>{notice}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Button label="내 교환 · 환불 내역" variant="secondary" href={ROUTES.myClaims} as={Link} endContent={<Icon name="chevron_right" className="text-outline" />} />
                    </aside>

                    {/* 주문 id(동적 경로)를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <div className="lg:col-span-9">
                        <Suspense fallback={<ClaimSkeleton />}>
                            <ClaimContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
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
