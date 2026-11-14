'use client';

import { useGetMySettlementInfo } from '@/api/generated/payout-controller/payout-controller';
import { Badge, Card, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';

// "2026-11-15" 를 "11월 15일" 로 바꾼다.
function monthDay(date: string | undefined): string {
    if (!date) return '-';
    const [, month, day] = date.split('-');
    return `${Number(month)}월 ${Number(day)}일`;
}

// 대시보드의 "이번 정산 예정 금액" 카드. 지급 예정 금액과 다음 지급일을 정산 정보 API 에서 가져온다.
// 다른 요약 카드와 같은 모양이고, BE 에 없는 상태 문구("확정 완료")는 보여 주지 않는다.
export default function PendingSettlementCard() {
    const info = useGetMySettlementInfo();
    const data = info.data?.data;
    const ready = info.isSuccess && data !== undefined;

    return (
        <Card padding={5} className="flex min-h-48 flex-col justify-between">
            <div className="flex items-center justify-between mb-space-md">
                <Text type="supporting" color="secondary" weight="semibold">이번 정산 예정 금액</Text>
                <Icon name="payments" className="text-on-surface-variant" />
            </div>
            <div className="flex items-baseline gap-space-sm">
                <span className="text-display-xl font-display-xl text-on-surface">{ready ? (data.pendingPayoutAmount ?? 0).toLocaleString('ko-KR') : '-'}</span>
                <Text type="supporting" color="secondary">원</Text>
            </div>
            <div className="mt-space-md flex items-center border-t border-outline-variant/20 pt-space-md">
                {ready ? <Badge label={`정산 예정일 ${monthDay(data.nextPayoutDate)}`} variant="info" /> : null}
            </div>
        </Card>
    );
}
