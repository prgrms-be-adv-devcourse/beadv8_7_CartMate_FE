'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

type CartItem = {
    id: string;
    vendorId: string;
    code: string;
    category: string;
    name: string;
    option: string;
    note: string;
    price: number;
    quantity: number;
    discontinued?: boolean;
};

type Vendor = {
    id: string;
    name: string;
    freeShipping: string;
    shippingFee: number;
};

const VENDORS: Vendor[] = [
    { id: 'A', name: '매치코어 스포츠', freeShipping: '무료배송 조건: 70,000원 이상', shippingFee: 3000 },
    { id: 'B', name: '스타디움 기어', freeShipping: '무료배송 조건: 100,000원 이상', shippingFee: 3000 },
];

const INITIAL_ITEMS: CartItem[] = [
    {
        id: 'item-1',
        vendorId: 'A',
        code: 'MATCH-1',
        category: '팀 매치웨어 카테고리',
        name: '정품 매치웨어 팀 저지',
        option: '선택 옵션: 어웨이(화이트/골드) / L(100) / 등번호 10번 [마킹 포함]',
        note: '단가: 33,000원 / 개별 포장 발송',
        price: 33000,
        quantity: 1,
    },
    {
        id: 'item-2',
        vendorId: 'A',
        code: 'MATCH-PRO',
        category: '풋살/축구 소모품',
        name: '엘리트 풋살 삭스',
        option: '선택 옵션: 블랙 / Free',
        note: '단가: 7,000원 (2켤레 묶음 수량 적용)',
        price: 7000,
        quantity: 2,
    },
    {
        id: 'item-3',
        vendorId: 'B',
        code: 'ST-BALL',
        category: '공인구/경기 장비',
        name: '매치 데이 매치볼 5호구',
        option: '선택 옵션: 화이트/블루',
        note: '단가: 45,000원 / 대한축구협회 인증 규격',
        price: 45000,
        quantity: 1,
    },
    {
        id: 'item-4',
        vendorId: 'B',
        code: 'ST-GRIP',
        category: '',
        name: '논슬립 인솔',
        option: '선택 옵션: L',
        note: '해당 규격의 재고 소진 및 공급처 라인업 변경으로 단종 처리되었습니다.',
        price: 12000,
        quantity: 1,
        discontinued: true,
    },
];

const won = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const GRAY_BUTTON = 'h-9 px-space-md bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors';

export default function CartView() {
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [selected, setSelected] = useState<string[]>(INITIAL_ITEMS.filter((item) => !item.discontinued).map((item) => item.id));

    const selectable = items.filter((item) => !item.discontinued);
    const selectedItems = selectable.filter((item) => selected.includes(item.id));
    const allSelected = selectable.length > 0 && selectedItems.length === selectable.length;

    const itemsTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const selectedVendorIds = new Set(selectedItems.map((item) => item.vendorId));
    const shippingTotal = VENDORS.filter((vendor) => selectedVendorIds.has(vendor.id)).reduce((sum, vendor) => sum + vendor.shippingFee, 0);
    const grandTotal = itemsTotal + shippingTotal;

    const toggleItem = (id: string) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
    };

    const toggleAll = (checked: boolean) => {
        setSelected(checked ? selectable.map((item) => item.id) : []);
    };

    const toggleVendor = (vendorId: string, checked: boolean) => {
        const ids = selectable.filter((item) => item.vendorId === vendorId).map((item) => item.id);
        setSelected((prev) => (checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))));
    };

    const changeQuantity = (id: string, delta: number) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)));
    };

    const removeItems = (ids: string[]) => {
        setItems((prev) => prev.filter((item) => !ids.includes(item.id)));
        setSelected((prev) => prev.filter((id) => !ids.includes(id)));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-gutter items-start">
            {/* LEFT COLUMN: Cart List Groups */}
            <div className="flex-1 w-full flex flex-col gap-space-lg">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between p-space-md bg-surface-container-lowest">
                    <label className="flex items-center gap-space-sm cursor-pointer select-none">
                        <input
                            checked={allSelected}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                            type="checkbox"
                        />
                        <span className="font-label-md text-label-md text-on-surface">
                            전체 선택 ({selectedItems.length}/{selectable.length}건)
                        </span>
                    </label>
                    <div className="flex items-center gap-space-sm">
                        <button className={GRAY_BUTTON} type="button" onClick={() => removeItems(selected)}>
                            선택 삭제
                        </button>
                        <button
                            className={GRAY_BUTTON}
                            type="button"
                            onClick={() => removeItems(items.filter((item) => item.discontinued).map((item) => item.id))}
                        >
                            품절/중지 일괄 삭제
                        </button>
                    </div>
                </div>

                {VENDORS.map((vendor) => {
                    const vendorItems = items.filter((item) => item.vendorId === vendor.id);
                    if (vendorItems.length === 0) return null;
                    const vendorAvailable = vendorItems.filter((item) => !item.discontinued);
                    const vendorDiscontinued = vendorItems.length - vendorAvailable.length;
                    const vendorChecked = vendorAvailable.length > 0 && vendorAvailable.every((item) => selected.includes(item.id));
                    const vendorItemsTotal = vendorAvailable.reduce((sum, item) => sum + item.price * item.quantity, 0);

                    return (
                        <section key={vendor.id} className="flex flex-col bg-surface-container-lowest">
                            {/* Seller Header */}
                            <div className="flex items-center justify-between p-space-md bg-surface-container-low">
                                <div className="flex items-center gap-space-sm">
                                    <input
                                        checked={vendorChecked}
                                        onChange={(e) => toggleVendor(vendor.id, e.target.checked)}
                                        className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                                        type="checkbox"
                                    />
                                    <span className="font-label-md text-label-md text-on-surface font-bold">판매자: [{vendor.name}]</span>
                                    <span className="font-caption text-caption px-1.5 py-0.5 bg-surface-container text-outline">{vendor.freeShipping}</span>
                                </div>
                                <span className="font-caption text-caption text-on-surface-variant">기본 배송비: {won(vendor.shippingFee)}</span>
                            </div>
                            {/* Item List */}
                            <div className="flex flex-col">
                                {vendorItems.map((item, index) => (
                                    <div key={item.id}>
                                        {index > 0 && <div className="h-[1px] w-full bg-surface-container" />}
                                        {item.discontinued ? (
                                            <article className="p-space-lg flex flex-col md:flex-row gap-space-md items-start justify-between bg-surface-container-lowest opacity-60">
                                                <div className="flex items-start gap-space-md w-full md:w-auto flex-1">
                                                    <input
                                                        className="w-4 h-4 rounded-none cursor-not-allowed bg-surface-container-highest text-outline mt-1"
                                                        disabled
                                                        type="checkbox"
                                                    />
                                                    <div className="w-20 h-20 bg-surface-container flex-shrink-0 relative flex items-center justify-center">
                                                        <span className="font-caption text-caption text-outline relative z-10 text-[9px]">80x80</span>
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <div className="flex items-center gap-space-xs mb-1">
                                                            <span className="font-caption text-caption px-1 bg-surface-container text-outline line-through">{item.code}</span>
                                                            <span className="font-caption text-caption px-2 py-0.5 bg-inverse-surface text-inverse-on-surface font-bold">
                                                                [현재 판매가 중단된 상품입니다. (구매 불가)]
                                                            </span>
                                                        </div>
                                                        <h2 className="font-headline-sm text-headline-sm text-outline line-through truncate">{item.name}</h2>
                                                        <div className="font-body-sm text-body-sm text-outline line-through mt-1">{item.option}</div>
                                                        <div className="font-caption text-caption text-outline mt-0.5">{item.note}</div>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col items-end justify-between w-full md:w-auto md:min-w-[140px] pt-space-sm md:pt-0 gap-space-sm">
                                                    <button
                                                        aria-label="상품 삭제"
                                                        className="text-on-surface hover:bg-surface-container p-1 self-end cursor-pointer"
                                                        type="button"
                                                        onClick={() => removeItems([item.id])}
                                                    >
                                                        <Icon name="close" className="text-[18px]" />
                                                    </button>
                                                    <div className="flex items-center bg-surface-container cursor-not-allowed opacity-50">
                                                        <span className="w-7 h-7 flex items-center justify-center font-label-md text-outline">-</span>
                                                        <span className="w-8 h-7 flex items-center justify-center font-label-sm text-label-sm text-outline">{item.quantity}</span>
                                                        <span className="w-7 h-7 flex items-center justify-center font-label-md text-outline">+</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-headline-sm text-headline-sm font-bold text-outline line-through">{won(item.price * item.quantity)}</div>
                                                    </div>
                                                </div>
                                            </article>
                                        ) : (
                                            <article className="p-space-lg flex flex-col md:flex-row gap-space-md items-start justify-between bg-surface-container-lowest">
                                                <div className="flex items-start gap-space-md w-full md:w-auto flex-1">
                                                    <input
                                                        checked={selected.includes(item.id)}
                                                        onChange={() => toggleItem(item.id)}
                                                        className="w-4 h-4 accent-primary mt-1 cursor-pointer"
                                                        type="checkbox"
                                                    />
                                                    <div className="w-20 h-20 bg-surface-container flex-shrink-0 relative flex items-center justify-center">
                                                        <span className="font-caption text-caption text-outline relative z-10 text-[9px]">80x80</span>
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <div className="flex items-center gap-space-xs mb-1">
                                                            <span className="font-caption text-caption px-1 bg-surface-container text-on-surface-variant">{item.code}</span>
                                                            <span className="font-caption text-caption text-outline">{item.category}</span>
                                                        </div>
                                                        <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{item.name}</h2>
                                                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">{item.option}</div>
                                                        <div className="font-caption text-caption text-outline mt-0.5">{item.note}</div>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col items-end justify-between w-full md:w-auto md:min-w-[140px] pt-space-sm md:pt-0 gap-space-sm">
                                                    <button
                                                        aria-label="상품 삭제"
                                                        className="text-outline hover:text-on-surface p-1 self-end"
                                                        type="button"
                                                        onClick={() => removeItems([item.id])}
                                                    >
                                                        <Icon name="close" className="text-[18px]" />
                                                    </button>
                                                    <div className="flex items-center bg-surface-container">
                                                        <button
                                                            className="w-7 h-7 flex items-center justify-center font-label-md text-on-surface hover:bg-surface-container-highest"
                                                            type="button"
                                                            onClick={() => changeQuantity(item.id, -1)}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            className="w-8 h-7 text-center bg-transparent font-label-sm text-label-sm text-on-surface"
                                                            readOnly
                                                            type="text"
                                                            value={item.quantity}
                                                        />
                                                        <button
                                                            className="w-7 h-7 flex items-center justify-center font-label-md text-on-surface hover:bg-surface-container-highest"
                                                            type="button"
                                                            onClick={() => changeQuantity(item.id, 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{won(item.price * item.quantity)}</div>
                                                    </div>
                                                </div>
                                            </article>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Vendor Subtotal */}
                            <div className="p-space-md bg-surface-container-low flex flex-wrap items-center justify-between text-on-surface">
                                <div className="flex items-center gap-space-sm font-body-sm text-body-sm">
                                    <span className="font-bold">[{vendor.name}] 묶음 소계:</span>
                                    <span className="text-on-surface-variant">
                                        {vendorDiscontinued > 0
                                            ? `구매 가능 ${vendorAvailable.length}건 (중단 ${vendorDiscontinued}건 제외)`
                                            : `상품 ${vendorAvailable.length}건`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-space-sm font-label-md text-label-md">
                                    <span>상품 {won(vendorItemsTotal)}</span>
                                    <span className="text-outline">+</span>
                                    <span>배송비 {won(vendor.shippingFee)}</span>
                                    <span className="text-outline">=</span>
                                    <span className="font-headline-sm text-headline-sm font-bold text-primary">{won(vendorItemsTotal + vendor.shippingFee)}</span>
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* Bottom Wireframe Notice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md p-space-lg bg-surface-container-low text-on-surface-variant">
                    <div>
                        <div className="font-label-sm text-label-sm font-bold text-on-surface mb-1">[장바구니 보관 주기]</div>
                        <p className="font-body-sm text-body-sm">
                            장바구니에 담긴 일반 상품은 최대 30일간 보관되며, 가격 변동 및 재고 부족 시 주문 단계에서 상태가 갱신될 수 있습니다.
                        </p>
                    </div>
                    <div>
                        <div className="font-label-sm text-label-sm font-bold text-on-surface mb-1">[배송비 부과 정책]</div>
                        <p className="font-body-sm text-body-sm">
                            판매자(공급처)별 출고지가 상이하므로 업체별 배송비가 개별 합산 산정됩니다. 동일 판매자 상품 묶음 주문 시 배송비가 절감됩니다.
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Sticky Payment Summary Sidebar (360px) */}
            <aside className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-36 flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest p-space-lg flex flex-col">
                    <div className="pb-space-md bg-surface-container-lowest flex items-center justify-between">
                        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">결제 금액 요약</h2>
                        <span className="font-caption text-caption px-1.5 py-0.5 bg-surface-container text-on-surface-variant">B2B/B2C</span>
                    </div>
                    <div className="py-space-md flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                            <span>선택 상품 금액</span>
                            <span className="font-label-md text-label-md text-on-surface">{won(itemsTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between font-caption text-caption text-outline -mt-1 pl-space-xs">
                            <span>└ 선택된 유효 상품</span>
                            <span>
                                {selectedItems.length}종 / {totalQuantity}개
                            </span>
                        </div>
                        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant pt-space-xs">
                            <span>배송비</span>
                            <span className="font-label-md text-label-md text-on-surface">{won(shippingTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between font-caption text-caption text-outline -mt-1 pl-space-xs">
                            <span>└ 출고처별 기본 부과</span>
                            <span>판매자 2곳 (각 3,000원)</span>
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-surface-container my-space-sm" />
                    <div className="pt-space-sm pb-space-lg flex flex-col gap-1">
                        <div className="flex items-baseline justify-between">
                            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">최종 결제 예정 금액</span>
                            <span className="font-display-xl text-display-xl font-bold text-primary tracking-tight">{won(grandTotal)}</span>
                        </div>
                        <div className="text-right font-caption text-caption text-outline">* 부가세(VAT) 포함 및 세금계산서 발행 가능</div>
                    </div>
                    <Link
                        className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs hover:bg-inverse-surface transition-colors"
                        href={ROUTES.checkout}
                    >
                        <span>주문하기 ({selectedItems.length}건)</span>
                        <Icon name="arrow_forward" className="text-[18px]" />
                    </Link>
                    <div className="mt-space-sm flex items-center justify-between gap-space-sm">
                        <button className="flex-1 h-9 bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors" type="button">
                            견적서 다운로드 (PDF)
                        </button>
                        <button className="flex-1 h-9 bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors" type="button">
                            주문 내역 공유
                        </button>
                    </div>
                </div>
                {/* Mandatory Policy Callout Box */}
                <div className="bg-surface-container p-space-md flex items-start gap-space-sm">
                    <Icon name="info" className="text-outline text-[20px] flex-shrink-0 mt-0.5" />
                    <div className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-on-surface">공동구매 상품은 팀 전용 공유 장바구니에서 별도 관리됩니다.</span>
                        <div className="mt-1 font-caption text-caption text-outline">
                            현재 장바구니는 개인 및 관리자 단독 주문 전용 탭입니다. 로스터 일괄 인쇄 및 팀 MOQ 달성 현황은 상단 [공동구매] 탭을 확인하세요.
                        </div>
                    </div>
                </div>
                {/* Quick Safety Guideline */}
                <div className="p-space-md bg-surface-container-lowest text-outline font-caption text-caption flex flex-col gap-1">
                    <div>· 주문 접수 후 제작 커스텀 유니폼은 변경 및 취소가 제한됩니다.</div>
                    <div>· 단체 계좌 예치금 사용은 결제 화면에서 선택 가능합니다.</div>
                </div>
            </aside>
        </div>
    );
}
