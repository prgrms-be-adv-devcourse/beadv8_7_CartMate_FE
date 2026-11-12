import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card, EmptyState } from '@astryxdesign/core';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '예치금 충전 | TEAMBUY',
};

export default function DepositChargePage() {
    return (
        <main className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <MyPageSidebar />
            <section className="flex min-w-0 w-full items-center justify-center lg:col-span-9">
                <Card padding={5} className="w-full max-w-[640px]">
                    <div className="mb-space-md flex justify-center">
                        <Badge label="충전 기능 비공개" variant="neutral" />
                    </div>
                    <EmptyState
                        title="예치금 충전 준비 중"
                        description="현재 이 화면에서는 예치금을 충전할 수 없습니다. 잔액과 거래 내역은 예치금 관리에서 확인할 수 있습니다."
                        icon={<Icon name="account_balance_wallet" />}
                        actions={<Button label="예치금 관리로 돌아가기" href={ROUTES.deposit} as={Link} variant="primary" />}
                    />
                </Card>
            </section>
        </main>
    );
}
