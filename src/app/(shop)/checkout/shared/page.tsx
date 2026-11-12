import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import SharedOrderPayment from './_components/SharedOrderPayment';

export const metadata: Metadata = { title: '공동구매 분담금 결제 | TEAMBUY' };

export default function SharedCheckoutPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-gutter py-8 sm:py-12">
            <div className="flex flex-col w-full">
                <div className="mb-8 border-b border-outline-variant pb-5">
                    <Text type="supporting" color="accent">SHARED CHECKOUT</Text>
                    <Heading level={1}>공동구매 분담금 결제</Heading>
                </div>
                {/* 주소의 공동 주문(?order=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={<div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />}>
                    <SharedOrderPayment />
                </Suspense>
            </div>
        </div>
    );
}
