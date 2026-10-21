'use client';

import { useParams } from 'next/navigation';
import { useGetMySettlementDetail, useGetMySettlementInfo } from '@/api/generated/payout-controller/payout-controller';
import Icon from '@/components/ui/Icon';
import { dotDate, won } from '../../_components/settlementFormat';

// 정산 상세 요약 카드. 정산 ID(지급일-상태)는 주소의 [id] 에서 읽는다.
// BE 에 없는 값(전월 대비 증감, 지급 계좌 정보)은 원본 그대로 둔다.
export default function SettlementDetailSummary() {
    const { id } = useParams<{ id: string }>();
    const detail = useGetMySettlementDetail(id);
    const info = useGetMySettlementInfo();

    const data = detail.data?.data;
    const feeRate = info.data?.data?.feeRatePercent;
    const ready = detail.isSuccess && data !== undefined;
    const completed = data?.status === 'COMPLETED';

    return (
        <div className="grid grid-cols-4 gap-gutter mb-space-xl">
            <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-outline-variant flex flex-col justify-between">
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm text-on-surface-variant">총 판매 금액</span>
                    <Icon name="payments" className="text-on-surface-variant" />
                </div>
                <div>
                    <div className="text-headline-lg font-headline-lg text-primary tracking-tight">{ready ? won(data.salesAmount) : '-'}</div>
                    <div className="text-caption text-on-surface-variant mt-space-xs">전월 대비 +12.4%</div>
                </div>
            </div>
            <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-outline-variant flex flex-col justify-between">
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm text-on-surface-variant">플랫폼 수수료{feeRate === undefined ? '' : ` (${feeRate}%)`}</span>
                    <Icon name="receipt_long" className="text-on-surface-variant" />
                </div>
                <div>
                    <div className="text-headline-lg font-headline-lg text-primary tracking-tight">{ready ? won(data.feeAmount) : '-'}</div>
                    <div className="text-caption text-on-surface-variant mt-space-xs">부가세 포함</div>
                </div>
            </div>
            {/* Final Payout Amount */}
            <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-outline-variant flex flex-col justify-between bg-surface-container-low">
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm font-label-md text-primary">최종 지급액</span>
                    <Icon name="account_balance_wallet" className="text-on-surface" />
                </div>
                <div>
                    <div className="text-headline-lg font-headline-lg text-primary tracking-tight">{ready ? won(data.payoutAmount) : '-'}</div>
                    <div className="text-caption text-on-surface mt-space-xs font-label-sm">{ready ? `${completed ? '지급일' : '지급 예정일'}: ${dotDate(data.settlementDate)}` : ''}</div>
                </div>
            </div>
            {/* Payout Account Info */}
            <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-outline-variant flex flex-col justify-between">
                <div className="flex items-center justify-between mb-space-md">
                    <span className="text-body-sm text-on-surface-variant">지급 계좌 정보</span>
                    <Icon name="credit_card" className="text-on-surface-variant" />
                </div>
                <div>
                    <div className="text-headline-sm font-headline-sm text-primary">국민은행</div>
                    <div className="text-body-sm text-on-surface-variant mt-space-xs font-mono">123-456-78-901234</div>
                    <div className="text-caption text-on-surface-variant mt-0.5">예금주: (주)스포츠컴퍼니</div>
                </div>
            </div>
        </div>
    );
}
