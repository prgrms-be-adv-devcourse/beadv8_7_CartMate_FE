import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Card, Heading, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SummaryBar from './_components/SummaryBar';
import TransactionList from './_components/TransactionList';

export const metadata: Metadata = {
    title: '예치금 거래 내역 | TEAMBUY',
};

const GUIDELINES = [
    { term: '충전:', text: '결제창에서 결제하면 충전 금액이 바로 사용 가능 잔액에 반영됩니다.' },
    { term: '결제:', text: '주문과 공동구매 결제 시 예치금에서 차감되며, 판매자 정산 전까지는 동결 금액으로 보관됩니다.' },
    { term: '환불:', text: '결제 취소나 교환·환불이 승인되면 환불 금액이 결제에 쓴 예치금으로 돌아옵니다.' },
    { term: '정산·수수료·출금:', text: '판매 정산금 입금, 수수료, 출금도 거래 내역에 함께 표시됩니다.' },
];

export default function DepositHistoryPage() {
    return (
        <main className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-outline-variant">
                    <nav aria-label="예치금 위치" className="flex flex-wrap items-center gap-space-sm font-caption text-caption text-on-surface-variant">
                        <Link className="hover:text-on-surface" href={ROUTES.myPage}>
                            마이페이지
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <Link className="hover:text-on-surface" href={ROUTES.deposit}>
                            예치금 관리
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <span className="text-on-surface font-semibold">거래 내역</span>
                    </nav>
                </div>

                <header className="mb-space-xl">
                    <Text type="supporting" color="accent">WALLET HISTORY</Text>
                    <Heading level={1} className="mt-1">예치금 거래 내역</Heading>
                    <Text as="p" color="secondary" className="mt-2">전체 거래를 최신순으로 보여 줍니다.</Text>
                </header>

                <Suspense>
                    <SummaryBar />
                </Suspense>

                <Suspense>
                    <TransactionList />
                </Suspense>

                <Card variant="muted" padding={4} className="mt-space-xl">
                    <div className="mb-space-xs flex items-center gap-1">
                        <Icon name="info" className="text-[16px]" />
                        <Heading level={2}>예치금 및 거래 유형 안내</Heading>
                    </div>
                    <ul className="space-y-1 list-disc list-inside">
                        {GUIDELINES.map((item) => (
                            <li key={item.term}>
                                <Text as="span" type="supporting" color="secondary">
                                    <strong>{item.term}</strong> {item.text}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </main>
    );
}
