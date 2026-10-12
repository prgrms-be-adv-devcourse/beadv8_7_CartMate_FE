import type { Metadata } from 'next';
import CartView from './_components/CartView';

export const metadata: Metadata = { title: '장바구니 | TEAMBUY' };

export default function CartPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* Page Header Breadcrumb & Context */}
                <div className="flex items-center justify-between pb-space-lg">
                    <div className="flex items-center gap-space-sm">
                        <span className="font-caption text-caption px-space-xs py-0.5 bg-surface-container-highest text-on-surface-variant uppercase tracking-wider">CART_STATE_01</span>
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">장바구니 (와이어프레임)</h1>
                        <span className="font-label-sm text-label-sm text-outline">[총 4개 상품 등록됨]</span>
                    </div>
                    <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                        <span>01 장바구니</span>
                        <span>&gt;</span>
                        <span>02 주문서 작성</span>
                        <span>&gt;</span>
                        <span>03 결제 완료</span>
                    </div>
                </div>
                {/* Main Grid: Cart Items vs Summary Box (Right 360px) */}
                <CartView />
            </div>
        </div>
    );
}
