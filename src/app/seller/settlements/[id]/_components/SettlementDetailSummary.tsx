'use client';

import { useParams } from 'next/navigation';
import { Card, Heading } from '@astryxdesign/core';
import { useGetMySettlementDetail, useGetMySettlementInfo } from '@/api/generated/payout-controller/payout-controller';
import Icon from '@/components/ui/Icon';
import { dotDate, won } from '../../_components/settlementFormat';

// 정산 상세 요약 카드. 정산 ID(지급일-상태)는 주소의 [id] 에서 읽는다.
export default function SettlementDetailSummary() {
    const { id } = useParams<{ id: string }>();
    const detail = useGetMySettlementDetail(id);
    const info = useGetMySettlementInfo();

    const data = detail.data?.data;
    const feeRate = info.data?.data?.feeRatePercent;
    const ready = detail.isSuccess && data !== undefined;
    const completed = data?.status === 'COMPLETED';

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-xl">
            <Card className="flex flex-col justify-between" padding={6}>
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm text-on-surface-variant">총 판매 금액</span>
                    <Icon name="payments" className="text-on-surface-variant" />
                </div>
                <div>
                    <Heading level={3}>{ready ? won(data.salesAmount) : '-'}</Heading>
                    <div className="text-caption text-on-surface-variant mt-space-xs">구매 확정 기준</div>
                </div>
            </Card>
            <Card className="flex flex-col justify-between" padding={6}>
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm text-on-surface-variant">플랫폼 수수료{feeRate === undefined ? '' : ` (${feeRate}%)`}</span>
                    <Icon name="receipt_long" className="text-on-surface-variant" />
                </div>
                <div>
                    <Heading level={3}>{ready ? won(data.feeAmount) : '-'}</Heading>
                    <div className="text-caption text-on-surface-variant mt-space-xs">부가세 포함</div>
                </div>
            </Card>
            {/* Final Payout Amount */}
            <Card className="flex flex-col justify-between" padding={6} variant="muted">
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm font-label-md text-primary">최종 지급액</span>
                    <Icon name="account_balance_wallet" className="text-on-surface" />
                </div>
                <div>
                    <Heading level={3}>{ready ? won(data.payoutAmount) : '-'}</Heading>
                    <div className="text-caption text-on-surface mt-space-xs font-label-sm">{ready ? `${completed ? '지급일' : '지급 예정일'}: ${dotDate(data.settlementDate)}` : ''}</div>
                </div>
            </Card>
        </div>
    );
}
