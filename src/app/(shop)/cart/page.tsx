import type { Metadata } from 'next';
import CartView from './_components/CartView';

export const metadata: Metadata = { title: '장바구니 | TEAMBUY' };

export default function CartPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between pb-space-lg">
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">장바구니</h1>
                    <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                        <span className="text-on-surface font-bold">01 장바구니</span>
                        <span>&gt;</span>
                        <span>02 주문서 작성</span>
                        <span>&gt;</span>
                        <span>03 결제 완료</span>
                    </div>
                </div>
                <CartView />
            </div>
        </div>
    );
}
