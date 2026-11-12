'use client';

import { Badge, Card, Heading, Text } from '@astryxdesign/core';
import { useGetMyWallet, useGetMyWalletTransactionSummary } from '@/api/generated/wallet-controller/wallet-controller';

const BOX_BORDER = 'border-b md:border-b-0 md:border-r border-outline-variant pb-space-md md:pb-0';

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
        <Card className="mb-space-lg">
            <div className="mb-space-md flex flex-wrap items-center justify-between gap-space-sm">
                <Heading level={2}>전체 기간 요약</Heading>
                <Badge label="전체 기간" variant="neutral" />
            </div>
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3">
                <div className={`flex items-center justify-between gap-space-md md:px-space-md ${BOX_BORDER}`}>
                    <Text as="span" color="secondary" className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 inline-block bg-primary" />총 충전
                    </Text>
                    <Text as="span" type="large" weight="bold" color="accent" hasTabularNumbers>{won(totalCharged, '+')}</Text>
                </div>
                <div className={`flex items-center justify-between gap-space-md md:px-space-md ${BOX_BORDER}`}>
                    <Text as="span" color="secondary" className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 inline-block bg-outline" />총 결제 (환불 차감)
                    </Text>
                    <Text as="span" type="large" weight="bold" hasTabularNumbers>{won(totalPaid, '-')}</Text>
                </div>
                <div className="flex items-center justify-between gap-space-md md:px-space-md">
                    <div className="flex flex-col">
                        <Text as="span" color="secondary" className="flex items-center gap-space-xs">
                            <span className="w-2 h-2 inline-block border border-primary" />동결 중 (정산 전 보관액)
                        </Text>
                        <Text as="span" type="supporting" color="secondary">판매자 정산 대기</Text>
                    </div>
                    <Text as="span" type="large" weight="bold" color="accent" hasTabularNumbers>{won(held, '')}</Text>
                </div>
            </div>
        </Card>
    );
}
