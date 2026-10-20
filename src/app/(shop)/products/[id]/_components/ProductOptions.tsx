'use client';

import { formatPrice, type ProductOption } from '@/lib/salesPost';

const MAX_QUANTITY = 999;

type Props = {
    products: ProductOption[];
    selectedId: number | null;
    quantity: number;
    disabled: boolean;
    onSelect: (productId: number) => void;
    onQuantityChange: (quantity: number) => void;
};

// 판매글 안의 상품 중 하나를 고르고 수량을 정한다.
// 색상·사이즈 같은 세부 옵션(재고 단위)은 BE에 조회 API가 없어 아직 고를 수 없다. (로드맵 SHOP-3)
export default function ProductOptions({ products, selectedId, quantity, disabled, onSelect, onQuantityChange }: Props) {
    const selected = products.find((p) => p.id === selectedId) ?? null;

    return (
        <>
            <div className="flex flex-col gap-1.5 pt-space-xs">
                <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">1) 상품 선택</span>
                    {selected && <span className="font-caption text-caption text-secondary">선택: {selected.name}</span>}
                </div>
                <div className="flex flex-col gap-space-xs" role="radiogroup" aria-label="상품 선택">
                    {products.map((product) => {
                        const active = product.id === selectedId;
                        const unavailable = disabled || !product.onSale;
                        return (
                            <button
                                key={product.id}
                                className={`flex items-center justify-between px-space-sm py-space-xs text-left font-label-sm text-label-sm transition-colors ${
                                    active
                                        ? 'border-2 border-primary bg-surface-container-high text-primary font-bold'
                                        : 'border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-outline'
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                disabled={unavailable}
                                onClick={() => onSelect(product.id)}
                            >
                                <span>
                                    {product.name}
                                    {!product.onSale && <span className="ml-space-xs font-caption text-caption text-error">판매 중지</span>}
                                </span>
                                <span>{product.price === null ? '가격 문의' : formatPrice(product.price)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center justify-between border-t border-b border-surface-container-highest py-space-sm my-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface font-bold">2) 수량 선택</span>
                <div className="flex items-center gap-space-md">
                    <div className="flex items-center border border-outline bg-surface-container-lowest">
                        <button
                            className="w-8 h-8 flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-40"
                            type="button"
                            aria-label="수량 줄이기"
                            disabled={disabled || quantity <= 1}
                            onClick={() => onQuantityChange(quantity - 1)}
                        >
                            -
                        </button>
                        <input
                            className="w-10 h-8 text-center font-label-md text-label-md bg-transparent border-x border-outline focus:outline-none"
                            readOnly
                            type="text"
                            aria-label="수량"
                            value={quantity}
                        />
                        <button
                            className="w-8 h-8 flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-low disabled:opacity-40"
                            type="button"
                            aria-label="수량 늘리기"
                            disabled={disabled || quantity >= MAX_QUANTITY}
                            onClick={() => onQuantityChange(quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                    <div className="text-right min-w-[120px]">
                        <span className="font-caption text-caption text-secondary block">합계</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {selected?.price == null ? '-' : formatPrice(selected.price * quantity)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
