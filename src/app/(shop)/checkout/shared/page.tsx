import type { Metadata } from 'next';
import { Suspense } from 'react';
import SharedOrderPayment from './_components/SharedOrderPayment';

export const metadata: Metadata = { title: '공동구매 분담금 결제 | TEAMBUY' };

export default function SharedCheckoutPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between pb-space-lg mb-space-xl border-b border-outline-variant">
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공동구매 분담금 결제</h1>
                </div>
                {/* 주소의 공동 주문(?order=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={<div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />}>
                    <SharedOrderPayment />
                </Suspense>
            </div>
        </div>
    );
}