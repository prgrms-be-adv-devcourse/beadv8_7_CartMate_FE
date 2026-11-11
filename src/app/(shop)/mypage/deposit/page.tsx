import type { Metadata } from 'next';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import DepositBalanceCard from './_components/DepositBalanceCard';
import RecentTransactions from './_components/RecentTransactions';

export const metadata: Metadata = {
    title: '예치금 관리 | TEAMBUY',
};

export default function DepositPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-12 gap-gutter items-start">
            <MyPageSidebar />

            <div className="col-span-9 flex flex-col w-full">
                <div className="pb-space-lg mb-space-xl">
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">예치금 관리</h1>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">예치금 잔액과 최근 거래 내역을 확인합니다.</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">충전과 출금 신청은 준비 중입니다.</p>
                </div>

                {/* 잔액: 주소와 무관하게 로그인한 회원의 지갑을 조회한다 */}
                <DepositBalanceCard />

                {/* Recent Transactions: BE 거래 내역(최신순) */}
                <RecentTransactions />
            </div>
        </div>
    );
}
