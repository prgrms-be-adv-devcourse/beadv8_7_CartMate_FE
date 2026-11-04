import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';
import DepositBalanceCard from './_components/DepositBalanceCard';
import RecentTransactions from './_components/RecentTransactions';

export const metadata: Metadata = {
    title: '예치금 관리 | TEAMBUY',
};

// 예치금 안내. BE 의 예치금(지갑) 동작을 기준으로 한다.
const POLICIES = [
    {
        title: '01. 내 예치금 지갑',
        description: '회원마다 예치금 지갑이 하나씩 있습니다. 충전한 예치금으로 개인 주문과 공동구매 결제를 별도 결제수단 없이 바로 할 수 있습니다.',
    },
    {
        title: '02. 충전',
        description: '결제창에서 결제하면 충전 금액이 바로 사용 가능 잔액에 반영됩니다. 충전 내역은 거래 내역에서 확인할 수 있습니다.',
    },
    {
        title: '03. 환불',
        description: '결제를 취소하거나 교환·환불이 승인되면 환불 금액이 결제에 쓴 예치금으로 돌아옵니다.',
    },
];

export default function DepositPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-12 gap-gutter items-start">
            <MyPageSidebar />

            <div className="col-span-9 flex flex-col w-full">
                {/* Top Meta / Section Overline */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg mb-space-xl">
                    <div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-secondary uppercase tracking-widest mb-1">
                            <span>ACCOUNT &amp; WALLET</span>
                            <span>/</span>
                            <span>SYS.DEP-0924</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">예치금 관리</h1>
                        <p className="font-body-sm text-body-sm text-secondary mt-1">예치금 잔액과 최근 거래 내역을 확인합니다.</p>
                    </div>
                    {/* Action Button Group */}
                    <div className="flex items-center gap-space-sm self-start md:self-auto">
                        {/* 출금 API 는 아직 연결하지 않았다. */}
                        <button
                            className="h-11 px-space-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md rounded shadow-sm flex items-center gap-space-xs transition-colors"
                            type="button"
                        >
                            <Icon name="currency_exchange" className="text-[18px]" />
                            <span>예치금 출금 신청</span>
                        </button>
                        <Link
                            className="h-11 px-space-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded shadow-md flex items-center gap-space-xs transition-colors"
                            href={ROUTES.depositCharge}
                        >
                            <Icon name="add_circle" className="text-[18px]" />
                            <span>+ 예치금 충전</span>
                        </Link>
                    </div>
                </div>

                {/* 잔액: 주소와 무관하게 로그인한 회원의 지갑을 조회한다 */}
                <DepositBalanceCard />

                {/* Deposit Policy Strip */}
                <div className="bg-surface-container-low p-space-lg rounded mb-space-xl">
                    <div className="flex items-center gap-space-sm mb-space-md">
                        <Icon name="verified_user" className="text-[18px] text-primary" />
                        <h2 className="font-label-md text-label-md text-primary uppercase tracking-wide">예치금 이용 안내</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg font-body-sm text-body-sm text-secondary">
                        {POLICIES.map((policy) => (
                            <div key={policy.title} className="bg-surface-container-lowest p-space-md rounded">
                                <div className="font-label-sm text-label-sm text-on-surface font-bold mb-1">{policy.title}</div>
                                <p className="leading-relaxed">{policy.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions: BE 거래 내역(최신순) */}
                <RecentTransactions />
            </div>
        </div>
    );
}
