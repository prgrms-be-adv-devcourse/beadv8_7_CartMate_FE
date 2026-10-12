'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const UNIT_PRICE = 33000;

const COLOR_OPTIONS = ['홈 (네이비/화이트)', '어웨이 (화이트/골드)', 'GK (형광그린)'];

const SIZE_OPTIONS = [
    { label: 'S', value: 'S (90)', soldOut: false },
    { label: 'M', value: 'M (95)', soldOut: false },
    { label: 'L', value: 'L (100)', soldOut: false },
    { label: 'XL', value: 'XL (105)', soldOut: false },
    { label: '2XL', value: '2XL (110)', soldOut: true },
];

const CHIP_CLASS =
    'h-[44px] border border-outline-variant rounded flex items-center justify-center font-label-sm text-label-sm bg-surface-container-lowest text-on-surface hover:bg-surface-container-low peer-checked:bg-primary peer-checked:text-on-primary peer-checked:border-primary transition-colors';

// 팀원 개인 옵션(이름/색상/사이즈/등번호/수량) 입력 폼 + 실시간 요약
export default function MemberOptionForm() {
    const router = useRouter();
    const [name, setName] = useState('홍길동');
    const [color, setColor] = useState('어웨이 (화이트/골드)');
    const [size, setSize] = useState('L (100)');
    const [uniformNumber, setUniformNumber] = useState('10');
    const [qty, setQty] = useState(1);

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('[입력 필요] 참여자 이름을 입력해주세요.');
            return;
        }
        alert(
            `[공유 장바구니 등록 완료]\n참여자: ${name.trim()}\n선택 옵션: ${color} / ${size}\n수량: ${qty}벌\n총 결제 예정: ${(UNIT_PRICE * qty).toLocaleString()}원\n\n공유 장바구니로 이동합니다.`,
        );
        router.push(ROUTES.groupPurchaseCart());
    };

    return (
        <form className="flex flex-col gap-space-lg" onSubmit={(e) => e.preventDefault()}>
            {/* 1. Participant Identity Verification */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="member-name">
                    참여자 이름 (실명) <span className="text-error">*</span>
                </label>
                <div className="relative flex items-center">
                    <input
                        className="w-full h-[42px] border border-outline-variant bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface rounded focus:outline-none focus:border-primary"
                        id="member-name"
                        name="memberName"
                        placeholder="[ 실명 입력 ]"
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <span className="absolute right-3 font-caption text-caption text-outline bg-surface-container-low px-1.5 py-0.5 rounded">본인 확인됨</span>
                </div>
                <p className="font-caption text-caption text-secondary">총무 및 팀 리더가 공유 장바구니에서 옵션 주인을 식별하는 데 사용됩니다.</p>
            </div>

            {/* 2. Color Selection (Radio Chips) */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                        색상 선택 <span className="text-error">*</span>
                    </span>
                    <span className="font-caption text-caption text-secondary">
                        선택: <span className="font-semibold text-primary">{color}</span>
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((option) => (
                        <label key={option} className="cursor-pointer">
                            <input
                                checked={color === option}
                                className="peer sr-only"
                                name="colorOption"
                                type="radio"
                                value={option}
                                onChange={() => setColor(option)}
                            />
                            <div className={`${CHIP_CLASS} px-2 text-center`}>{option}</div>
                        </label>
                    ))}
                </div>
            </div>

            {/* 3. Size Selection */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                        사이즈 선택 <span className="text-error">*</span>
                    </span>
                    <span className="font-caption text-caption text-secondary">
                        선택: <span className="font-semibold text-primary">{size}</span>
                    </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {SIZE_OPTIONS.map((option) =>
                        option.soldOut ? (
                            <label key={option.value} className="cursor-not-allowed" title="현재 재고 부족으로 선택 불가">
                                <input className="sr-only" disabled name="sizeOption" type="radio" value={option.value} />
                                <div className="h-[44px] border border-outline-variant rounded flex flex-col items-center justify-center bg-surface-container-low text-outline opacity-60">
                                    <span className="font-label-sm text-label-sm line-through">{option.label}</span>
                                    <span className="font-caption text-[10px] leading-none">[품절]</span>
                                </div>
                            </label>
                        ) : (
                            <label key={option.value} className="cursor-pointer">
                                <input
                                    checked={size === option.value}
                                    className="peer sr-only"
                                    name="sizeOption"
                                    type="radio"
                                    value={option.value}
                                    onChange={() => setSize(option.value)}
                                />
                                <div className={CHIP_CLASS}>{option.label}</div>
                            </label>
                        ),
                    )}
                </div>
            </div>

            {/* 4. Uniform Number */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="font-body-sm text-body-sm font-semibold text-on-surface" htmlFor="member-uniform-number">
                        등번호 (배번) 입력 <span className="text-error">*</span>
                    </label>
                    <span className="font-caption text-caption text-secondary">0 ~ 99 숫자 입력</span>
                </div>
                <div className="relative flex items-center">
                    <input
                        className="w-full h-[42px] border border-outline-variant bg-surface-container-lowest px-3 font-body-md text-body-md text-on-surface rounded focus:outline-none focus:border-primary"
                        id="member-uniform-number"
                        max={99}
                        min={0}
                        name="uniformNumber"
                        placeholder="예: 10"
                        required
                        type="number"
                        value={uniformNumber}
                        onChange={(e) => setUniformNumber(e.target.value)}
                    />
                    <span className="absolute right-3 font-caption text-caption text-secondary">번</span>
                </div>
                <p className="font-caption text-caption text-secondary">유니폼 후면 마킹 및 팀 로스터/공유 장바구니에 표기될 번호입니다.</p>
            </div>

            {/* 5. Quantity Counter */}
            <div className="flex items-center justify-between border-t border-surface-variant pt-space-md">
                <div className="flex flex-col">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">수량</span>
                    <span className="font-caption text-caption text-secondary">개인 기본 할당: 1벌</span>
                </div>
                <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest">
                    <button
                        className="w-10 h-10 flex items-center justify-center border-r border-outline-variant text-primary hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={qty === 1}
                        type="button"
                        onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    >
                        <Icon name="remove" className="text-[18px]" />
                    </button>
                    <div className="w-12 text-center font-label-md text-label-md font-bold text-primary">{qty}</div>
                    <button
                        className="w-10 h-10 flex items-center justify-center border-l border-outline-variant text-primary hover:bg-surface-container-low"
                        type="button"
                        onClick={() => setQty((prev) => prev + 1)}
                    >
                        <Icon name="add" className="text-[18px]" />
                    </button>
                </div>
            </div>

            {/* 6. Real-Time Calculation & Summary Card */}
            <div className="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col gap-space-sm">
                <div className="font-label-sm text-label-sm text-secondary uppercase border-b border-outline-variant/60 pb-1">[ 선택 내역 요약 ]</div>
                <div className="flex flex-col gap-1 font-body-sm text-body-sm">
                    <div className="flex justify-between">
                        <span className="text-secondary">선택 옵션:</span>
                        <span className="font-medium text-primary">
                            {color} / {size} / 등번호 {uniformNumber}번
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-secondary">수량:</span>
                        <span className="font-medium text-primary">{qty} 벌</span>
                    </div>
                </div>
                <div className="border-t border-outline-variant pt-2 flex items-baseline justify-between mt-1">
                    <span className="font-label-md text-label-md text-primary font-bold">내 결제 예정 금액</span>
                    <div className="text-right">
                        <span className="font-headline-md text-headline-md font-bold text-primary">{(UNIT_PRICE * qty).toLocaleString()}</span>
                        <span className="font-body-md text-body-md text-primary">원</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                <Link
                    className="w-full sm:w-1/3 h-[44px] border border-outline-variant bg-surface-container-lowest text-primary rounded flex items-center justify-center font-label-md text-label-md hover:bg-surface-container-low transition-colors text-center"
                    href={ROUTES.groupPurchaseInvite()}
                >
                    취소하고 돌아가기
                </Link>
                <button
                    className="w-full sm:w-2/3 h-[44px] bg-primary text-on-primary border border-primary rounded flex items-center justify-center font-label-md text-label-md hover:bg-surface-container-highest hover:text-primary transition-colors"
                    type="button"
                    onClick={handleSubmit}
                >
                    공유 장바구니에 담기 (선택 완료)
                </button>
            </div>
        </form>
    );
}
