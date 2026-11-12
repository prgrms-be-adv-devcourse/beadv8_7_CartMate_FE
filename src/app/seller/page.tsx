import type { Metadata } from 'next';
import { Button, Card, Heading, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import PendingSettlementCard from './_components/PendingSettlementCard';
import { ClaimPendingCard, DeliveryRequestCard } from './_components/RequestCountCards';

export const metadata: Metadata = { title: '판매자 대시보드 | TEAMBUY' };

export default function SellerDashboardPage() {
    return (
        <div className="flex w-full flex-col gap-space-xl">
            <div className="flex flex-wrap items-end justify-between gap-space-md">
                <div>
                    <Text type="supporting" color="accent">SELLER OVERVIEW</Text>
                    <Heading level={1} className="mt-1">대시보드</Heading>
                    <Text color="secondary" className="mt-space-xs">처리가 필요한 배송, 클레임과 다음 정산을 확인하세요.</Text>
                </div>
                <div className="flex flex-wrap gap-space-sm">
                    <Button label="배송 관리" href={ROUTES.sellerShipping} variant="secondary" icon={<Icon name="local_shipping" />} />
                    <Button label="판매글 등록" href={ROUTES.sellerProductNew} variant="primary" icon={<Icon name="add" />} />
                </div>
            </div>
            <div className="grid gap-space-lg lg:grid-cols-3">
                {/* 배송 요청 건수와 교환·환불 대기 건수는 BE 의 목록 조회 건수, 정산 예정 금액과 정산 예정일은 정산 정보를 조회한다 */}
                <DeliveryRequestCard />
                <ClaimPendingCard />
                <PendingSettlementCard />
            </div>
            <Card padding={5} variant="muted">
                <div className="flex flex-wrap items-center justify-between gap-space-lg">
                    <div>
                        <Heading level={2}>운영 바로가기</Heading>
                        <Text color="secondary" className="mt-space-xs">목록에서 최신 상태를 조회하고 필요한 작업을 이어갈 수 있습니다.</Text>
                    </div>
                    <div className="flex flex-wrap gap-space-sm">
                        <Button label="교환·환불 관리" href={ROUTES.sellerClaims} variant="ghost" />
                        <Button label="정산 내역" href={ROUTES.sellerSettlements} variant="ghost" />
                        <Button label="공지사항" href={ROUTES.notices} variant="ghost" />
                    </div>
                </div>
            </Card>
        </div>
    );
}
