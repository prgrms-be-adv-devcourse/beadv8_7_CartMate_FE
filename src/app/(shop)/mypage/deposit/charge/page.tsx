import type { Metadata } from 'next';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import ChargeForm from './_components/ChargeForm';

export const metadata: Metadata = {
    title: '예치금 충전 | TEAMBUY',
};

export default function DepositChargePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-12 gap-gutter">
            <MyPageSidebar />
            <div className="col-span-9 flex flex-col w-full items-center justify-center">
                <ChargeForm />
            </div>
        </div>
    );
}
