import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import HistoryFilter from './_components/HistoryFilter';
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
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* Screen Navigation Breadcrumb & Wireframe Metadata Header */}
                <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-outline-variant">
                    <div className="flex items-center gap-space-sm font-caption text-caption text-on-surface-variant">
                        <Link className="hover:text-on-surface" href={ROUTES.myPage}>
                            마이페이지
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <Link className="hover:text-on-surface" href={ROUTES.deposit}>
                            예치금 관리
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <span className="text-on-surface font-semibold">거래 내역</span>
                    </div>
                    <div className="font-caption text-caption px-space-xs py-0.5 bg-surface-container border border-outline-variant text-on-surface-variant">
                        VIEWPORT: DESKTOP · REF: WF-TRX-004
                    </div>
                </div>

                {/* Primary Header & Section Indicator */}
                <div className="flex items-end justify-between mb-space-xl">
                    <div>
                        <div className="font-caption text-caption uppercase tracking-wider text-outline mb-space-xs">[ESCROW LEDGER ARCHIVE]</div>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">예치금 거래 내역</h1>
                    </div>
                    <div className="flex items-center gap-space-sm font-caption text-caption text-on-surface-variant bg-surface-container px-space-md py-space-xs border border-outline-variant">
                        <Icon name="sync" className="text-[16px]" />
                        <span>실시간 정산 기준 (최근 갱신: 2024-11-25 18:00)</span>
                    </div>
                </div>

                {/* 1. Transaction Type Filter & Date Range Filter Section */}
                <HistoryFilter />

                {/* 2. Transaction Summary Metric Bar */}
                <Suspense>
                    <SummaryBar />
                </Suspense>

                <Suspense>
                    <TransactionList />
                </Suspense>

                {/* Escrow Term & System Guidelines */}
                <div className="mt-space-xl p-space-md bg-surface-container border border-outline-variant">
                    <div className="font-label-sm text-label-sm text-on-surface font-bold mb-space-xs flex items-center gap-1">
                        <Icon name="info" className="text-[16px]" />
                        [시스템 안내] 예치금 및 거래 유형 규정
                    </div>
                    <ul className="font-caption text-caption text-on-surface-variant space-y-1 list-disc list-inside">
                        {GUIDELINES.map((item) => (
                            <li key={item.term}>
                                <strong>{item.term}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
