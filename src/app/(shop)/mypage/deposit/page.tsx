import type { Metadata } from 'next';
import MyPageShell from '@/components/layout/MyPageShell';
import DepositBalanceCard from './_components/DepositBalanceCard';
import RecentTransactions from './_components/RecentTransactions';

export const metadata: Metadata = {
    title: '예치금 관리 | TEAMBUY',
};

export default function DepositPage() {
    return (
        <MyPageShell title="예치금 관리" description="예치금 잔액과 최근 거래 내역을 확인합니다. 충전과 출금 신청은 준비 중입니다.">
            <div className="flex w-full flex-col gap-6">
                {/* 잔액: 주소와 무관하게 로그인한 회원의 지갑을 조회한다 */}
                <DepositBalanceCard />

                {/* Recent Transactions: BE 거래 내역(최신순) */}
                <RecentTransactions />
            </div>
        </MyPageShell>
    );
}
