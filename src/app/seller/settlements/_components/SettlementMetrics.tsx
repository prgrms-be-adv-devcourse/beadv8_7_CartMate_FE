'use client';

import { useGetMySettlementInfo, useGetMySettlements } from '@/api/generated/payout-controller/payout-controller';
import Icon from '@/components/ui/Icon';
import { won } from './settlementFormat';

// 정산 요약 카드. 합계는 정산 내역 목록에서, 수수료율은 정산 정보에서 가져온다.
// BE 에 없는 값("+12.4%" 증감)은 원본 그대로 둔다.
export default function SettlementMetrics() {
    const list = useGetMySettlements();
    const info = useGetMySettlementInfo();

    const rows = list.data?.data ?? [];
    const ready = list.isSuccess;
    const sales = rows.reduce((sum, row) => sum + (row.salesAmount ?? 0), 0);
    const fee = rows.reduce((sum, row) => sum + (row.feeAmount ?? 0), 0);
    const pending = rows.filter((row) => row.status === 'PENDING');
    const pendingAmount = pending.reduce((sum, row) => sum + (row.payoutAmount ?? 0), 0);
    const feeRate = info.data?.data?.feeRatePercent;
    // 정산 완료 비율은 표의 정산 줄 수 기준이다. (완료된 줄 / 전체 줄) 정산이 없으면 계산하지 않는다.
    const completedCount = rows.filter((row) => row.status === 'COMPLETED').length;
    const completedRatio = ready && rows.length > 0 ? `${Math.round((completedCount / rows.length) * 1000) / 10}%` : '-';

    const metrics = [
        { label: '총 판매 금액 (기간 내)', value: ready ? won(sales) : '-', note: '+12.4%' },
        { label: '총 플랫폼 수수료', value: ready ? won(fee) : '-', note: feeRate === undefined ? '' : `${feeRate}% 고정` },
        { label: '총 지급 예정액', value: ready ? won(pendingAmount) : '-', note: ready ? `정산 대기 ${pending.length}건` : '' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
            {metrics.map((metric) => (
                <div key={metric.label} className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col justify-between">
                    <span className="text-caption text-on-surface-variant uppercase tracking-wider">{metric.label}</span>
                    <div className="mt-space-md flex items-baseline justify-between">
                        <span className="text-headline-md font-mono text-on-surface">{metric.value}</span>
                        <span className="text-caption text-on-surface-variant">{metric.note}</span>
                    </div>
                </div>
            ))}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col justify-between">
                <span className="text-caption text-on-surface-variant uppercase tracking-wider">정산 완료 비율</span>
                <div className="mt-space-md flex items-baseline justify-between">
                    <span className="text-headline-md font-mono text-on-surface">{completedRatio}</span>
                    <Icon name="verified" className="text-on-surface text-[18px]" />
                </div>
            </div>
        </div>
    );
}
