import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import CartView from './_components/CartView';
import CartMatchBanner from './_components/CartMatchBanner';

export const metadata: Metadata = { title: '장바구니 | TEAMBUY' };

export default function CartPage() {
    return (
        <div className="mx-auto max-w-[1200px] px-gutter py-8 sm:py-12">
            <div className="flex flex-col w-full">
                <div className="mb-6 flex flex-col gap-3 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Text type="supporting" color="accent">ORDER</Text>
                        <Heading level={1}>장바구니</Heading>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Text type="supporting" weight="semibold">01 장바구니</Text>
                        <span>&gt;</span>
                        <Text type="supporting" color="secondary">02 주문서 작성</Text>
                        <span>&gt;</span>
                        <Text type="supporting" color="secondary">03 결제 완료</Text>
                    </div>
                </div>
                <CartMatchBanner />
                <CartView />
            </div>
        </div>
    );
}
