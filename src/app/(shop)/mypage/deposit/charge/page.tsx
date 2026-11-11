import type { Metadata } from 'next';
import Link from 'next/link';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '예치금 충전 | TEAMBUY',
};

export default function DepositChargePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-12 gap-gutter">
            <MyPageSidebar />
            <div className="col-span-9 flex flex-col w-full items-center justify-center">
                <div className="w-full max-w-[600px] rounded-xl border border-outline-variant bg-surface-container-lowest p-space-xl">
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">예치금 충전 준비 중</h1>
                    <p className="mt-space-sm font-body-md text-body-md text-on-surface-variant">
                        현재 이 화면에서는 예치금을 충전할 수 없습니다. 잔액과 거래 내역은 예치금 관리에서 확인할 수 있습니다.
                    </p>
                    <Link className="mt-space-lg inline-block font-label-md text-label-md text-primary underline" href={ROUTES.deposit}>
                        예치금 관리로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
