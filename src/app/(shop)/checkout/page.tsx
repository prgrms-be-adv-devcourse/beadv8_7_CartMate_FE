import type { Metadata } from 'next';
import { Suspense } from 'react';
import CheckoutForm from './_components/CheckoutForm';

export const metadata: Metadata = { title: '주문서 | TEAMBUY' };

export default function CheckoutPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between pb-space-lg mb-space-xl border-b border-outline-variant">
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">주문서</h1>
                    <div className="flex items-center gap-space-sm font-caption text-caption text-secondary">
                        <span className="text-outline">01 장바구니</span>
                        <span>&gt;</span>
                        <span className="text-primary font-bold">02 주문/결제</span>
                        <span>&gt;</span>
                        <span className="text-outline">03 주문완료</span>
                    </div>
                </div>
                {/* 주문할 장바구니 항목(?items=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense>
                    <CheckoutForm />
                </Suspense>
            </div>
        </div>
    );
}
