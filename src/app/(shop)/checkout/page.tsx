import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import CheckoutForm from './_components/CheckoutForm';
import CheckoutSteps, { StepList } from './_components/CheckoutSteps';

export const metadata: Metadata = { title: '주문서 | TEAMBUY' };

export default function CheckoutPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-gutter py-8 sm:py-12">
            <div className="flex flex-col w-full">
                <div className="mb-8 flex flex-col gap-3 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Text type="supporting" color="accent">CHECKOUT</Text>
                        <Heading level={1}>주문서</Heading>
                    </div>
                    <Suspense fallback={<StepList current={1} />}>
                        <CheckoutSteps />
                    </Suspense>
                </div>
                {/* 주문할 장바구니 항목(?items=)·접수된 주문(?order=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense>
                    <CheckoutForm />
                </Suspense>
            </div>
        </div>
    );
}
