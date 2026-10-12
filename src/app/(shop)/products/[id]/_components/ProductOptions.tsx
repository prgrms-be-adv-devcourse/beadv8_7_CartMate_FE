'use client';

import { useState } from 'react';

const UNIT_PRICE = 45000;

const COLORS = [
    { value: '블랙/화이트', label: '블랙/화이트 (기본)' },
    { value: '네이비/골드', label: '네이비/골드' },
    { value: '레드/블랙', label: '레드/블랙' },
];

const SIZES = [
    { value: 'S (90)' },
    { value: 'M (95)' },
    { value: 'L (100)', soldOut: true },
    { value: 'XL (105)' },
    { value: '2XL (110)' },
];

export default function ProductOptions() {
    const [color, setColor] = useState(COLORS[0].value);
    const [size, setSize] = useState('M (95)');
    const [quantity, setQuantity] = useState(1);

    return (
        <>
            {/* 옵션 선택 1: 색상 선택 */}
            <div className="flex flex-col gap-1.5 pt-space-xs">
                <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">1) 컬러 선택</span>
                    <span className="font-caption text-caption text-secondary">선택: {color}</span>
                </div>
                <div className="grid grid-cols-3 gap-space-sm">
                    {COLORS.map((item) => (
                        <button
                            key={item.value}
                            className={
                                item.value === color
                                    ? 'border-2 border-primary bg-primary text-on-primary py-space-xs px-space-sm text-center font-label-sm text-label-sm'
                                    : 'border border-outline-variant bg-surface-container-lowest text-on-surface py-space-xs px-space-sm text-center font-label-sm text-label-sm hover:border-outline'
                            }
                            type="button"
                            onClick={() => setColor(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* 옵션 선택 2: 사이즈 선택 (L 품절 처리) */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-bold">2) 사이즈 선택</span>
                    <a className="font-caption text-caption text-secondary hover:text-primary underline" href="#sizeGuideSection">
                        실측 사이즈표 확인
                    </a>
                </div>
                <div className="grid grid-cols-5 gap-space-xs">
                    {SIZES.map((item) =>
                        item.soldOut ? (
                            <button
                                key={item.value}
                                className="border border-outline-variant bg-surface-container-highest text-outline line-through py-2 font-label-sm text-label-sm cursor-not-allowed relative group"
                                disabled
                                title="현재 품절된 사이즈입니다."
                                type="button"
                            >
                                <span>{item.value}</span>
                                <span className="block text-[10px] no-underline font-bold text-error">품절</span>
                            </button>
                        ) : (
                            <button
                                key={item.value}
                                className={
                                    item.value === size
                                        ? 'border-2 border-primary bg-surface-container-high text-primary font-bold py-2 font-label-sm text-label-sm'
                                        : 'border border-outline-variant bg-surface-container-lowest text-on-surface py-2 font-label-sm text-label-sm hover:border-outline'
                                }
                                type="button"
                                onClick={() => setSize(item.value)}
                            >
                                {item.value}
                            </button>
                        ),
                    )}
                </div>
            </div>
            {/* 옵션 선택 3: 수량 선택 및 예상 금액 */}
            <div className="flex items-center justify-between border-t border-b border-surface-container-highest py-space-sm my-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface font-bold">3) 수량 선택</span>
                <div className="flex items-center gap-space-md">
                    <div className="flex items-center border border-outline bg-surface-container-lowest">
                        <button
                            className="w-8 h-8 flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-low"
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        >
                            -
                        </button>
                        <input
                            className="w-10 h-8 text-center font-label-md text-label-md bg-transparent border-x border-outline focus:outline-none"
                            readOnly
                            type="text"
                            value={quantity}
                        />
                        <button
                            className="w-8 h-8 flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-low"
                            type="button"
                            onClick={() => setQuantity((q) => q + 1)}
                        >
                            +
                        </button>
                    </div>
                    <div className="text-right min-w-[120px]">
                        <span className="font-caption text-caption text-secondary block">단품 기준 합계</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{(quantity * UNIT_PRICE).toLocaleString('ko-KR')}원</span>
                    </div>
                </div>
            </div>
        </>
    );
}
