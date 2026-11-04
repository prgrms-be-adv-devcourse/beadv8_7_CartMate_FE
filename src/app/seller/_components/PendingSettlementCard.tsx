'use client';

import { useGetMySettlementInfo } from '@/api/generated/payout-controller/payout-controller';
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
        <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between relative overflow-hidden group hover:border-outline transition-all">
            <div className="flex items-center justify-between mb-space-md">
                <span className="text-label-md text-on-surface-variant">이번 정산 예정 금액</span>
                <Icon name="payments" className="text-on-surface-variant" />
            </div>
            <div className="flex items-baseline gap-space-sm">
                <span className="text-display-xl font-display-xl text-on-surface">{ready ? (data.pendingPayoutAmount ?? 0).toLocaleString('ko-KR') : '-'}</span>
                <span className="text-body-sm text-on-surface-variant">원</span>
            </div>
            <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-caption text-on-surface-variant">
                <span>{ready ? `정산 예정일: ${monthDay(data.nextPayoutDate)}` : ''}</span>
            </div>
        </div>
    );
}
