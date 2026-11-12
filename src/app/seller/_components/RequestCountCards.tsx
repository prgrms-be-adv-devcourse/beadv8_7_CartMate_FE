'use client';

import { useGetSellerClaims } from '@/api/generated/claim-controller/claim-controller';
import { useGetSellerDeliveries } from '@/api/generated/delivery-controller/delivery-controller';
import { GetSellerClaimsClaimType, GetSellerClaimsStatusItem, GetSellerDeliveriesStatus } from '@/api/generated/model';
import { Badge, Card, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';

type SummaryCardProps = {
    label: string;
    icon: string;
    value: string;
    unit: string;
    note: string;
    status: string;
};

// 대시보드 요약 카드 한 장. 다른 요약 카드와 같은 모양이다.
function SummaryCard({ label, icon, value, unit, note, status }: SummaryCardProps) {
    return (
        <Card padding={5} className="flex min-h-48 flex-col justify-between">
            <div className="flex items-center justify-between mb-space-md">
                <Text type="supporting" color="secondary" weight="semibold">{label}</Text>
                <Icon name={icon} className="text-on-surface-variant" />
            </div>
            <div className="flex items-baseline gap-space-sm">
                <span className="text-display-xl font-display-xl text-on-surface">{value}</span>
                <Text type="supporting" color="secondary">{unit}</Text>
            </div>
            <div className="mt-space-md flex flex-wrap items-center gap-space-sm border-t border-outline-variant/20 pt-space-md">
                {note ? <Badge label={note} /> : null}
                {status ? <Badge label={status} variant="info" /> : null}
            </div>
        </Card>
    );
}

// 전체 건수만 필요해서 한 건만 요청하고 응답의 totalElements 를 쓴다.
// 불러오는 중이거나 실패하면 "-" 를 보여 준다.
function countText(isSuccess: boolean, total: number | undefined): string {
    return isSuccess && total !== undefined ? String(total) : '-';
}

// "배송 요청 건수": 판매자 배송 목록 중 배송 요청(REQUESTED) 상태의 전체 건수.
// 아래 줄에는 다음 단계의 건수를 보여 준다. 왼쪽은 배송 준비(PREPARING), 오른쪽은 배송 중(SHIPPING) 건수다.
export function DeliveryRequestCard() {
    const requested = useGetSellerDeliveries({ status: GetSellerDeliveriesStatus.REQUESTED, page: 0, size: 1 });
    const preparing = useGetSellerDeliveries({ status: GetSellerDeliveriesStatus.PREPARING, page: 0, size: 1 });
    const shipping = useGetSellerDeliveries({ status: GetSellerDeliveriesStatus.SHIPPING, page: 0, size: 1 });

    const stageText = (label: string, query: typeof preparing): string => (query.isSuccess ? `${label} ${query.data?.data?.totalElements ?? 0}건` : '');

    return (
        <SummaryCard
            label="배송 요청 건수"
            icon="local_shipping"
            value={countText(requested.isSuccess, requested.data?.data?.totalElements)}
            unit="건"
            note={stageText('배송 준비', preparing)}
            status={stageText('배송 중', shipping)}
        />
    );
}

// "교환·환불 대기 건수": 판매자 클레임 목록 중 처리대기(REQUESTED, 수락 전) 상태의 전체 건수. 클레임 관리의 "처리대기" 탭과 같다.
// 아래 줄에는 처리대기 건수를 유형별로 나눠 보여 준다. 왼쪽은 환불(REFUND), 오른쪽은 교환(EXCHANGE) 건수다.
export function ClaimPendingCard() {
    const pending = [GetSellerClaimsStatusItem.REQUESTED];
    const total = useGetSellerClaims({ status: pending, page: 0, size: 1 });
    const refund = useGetSellerClaims({ status: pending, claimType: GetSellerClaimsClaimType.REFUND, page: 0, size: 1 });
    const exchange = useGetSellerClaims({ status: pending, claimType: GetSellerClaimsClaimType.EXCHANGE, page: 0, size: 1 });

    const typeText = (label: string, query: typeof refund): string => (query.isSuccess ? `${label} ${query.data?.data?.totalElements ?? 0}건` : '');

    return (
        <SummaryCard
            label="교환·환불 대기 건수"
            icon="sync_alt"
            value={countText(total.isSuccess, total.data?.data?.totalElements)}
            unit="건"
            note={typeText('환불', refund)}
            status={typeText('교환', exchange)}
        />
    );
}
