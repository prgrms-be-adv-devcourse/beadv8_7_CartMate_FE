'use client';

import { useGetMyWallet, useGetMyWalletTransactionSummary } from '@/api/generated/wallet-controller/wallet-controller';

const BOX_BORDER = 'border-b md:border-b-0 md:border-r border-outline-variant pb-space-sm md:pb-0';

function won(value: number | undefined, sign: '+' | '-' | ''): string {
    if (value === undefined) return '-';
    return `${value === 0 ? '' : sign}${value.toLocaleString('ko-KR')}원`;
}

// 거래 내역 요약. 충전·결제 합계는 전체 기간 기준이고(BE 에 기간 조건이 없다), 동결 금액은 지갑 조회 값이다.
export default function SummaryBar() {
    const summary = useGetMyWalletTransactionSummary();
    const wallet = useGetMyWallet();
    const totalCharged = summary.data?.data?.totalCharged;
    const totalPaid = summary.data?.data?.totalPaid;
    const held = wallet.data?.data?.heldBalance;

    return (
        <div className="bg-surface-container border border-outline-variant p-space-md mb-space-lg grid grid-cols-12 gap-space-md items-center">
            <div className={`col-span-12 md:col-span-4 flex items-center justify-between px-space-md ${BOX_BORDER}`}>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                    <span className="w-2 h-2 inline-block bg-primary" />총 충전
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{won(totalCharged, '+')}</span>
            </div>
            <div className={`col-span-12 md:col-span-4 flex items-center justify-between px-space-md ${BOX_BORDER}`}>
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                    <span className="w-2 h-2 inline-block bg-outline" />총 결제 (환불 차감)
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{won(totalPaid, '-')}</span>
            </div>
            <div className="col-span-12 md:col-span-4 flex items-center justify-between px-space-md">
                <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                        <span className="w-2 h-2 inline-block border border-primary" />동결 중 (정산 전 보관액)
                    </span>
                    <span className="font-caption text-caption text-outline">판매자 정산 대기</span>
                </div>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{won(held, '')}</span>
            </div>
        </div>
    );
}
