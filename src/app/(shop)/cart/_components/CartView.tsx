'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import {
    clear,
    getGetCartQueryKey,
    removeItem,
    useChangeQuantity,
    useGetCart,
} from '@/api/generated/cart-controller/cart-controller';
import type { CartItemResponse } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';

const MAX_QUANTITY = 999;

type CartItem = CartItemResponse & { cartItemId: number };

// 행 금액. BE가 준 항목 합계가 있으면 그것을, 없으면 단가 × 수량을 쓴다. (행과 요약이 같은 기준을 쓰도록 한 곳에 둔다)
function lineTotal(item: CartItemResponse): number {
    return item.totalPrice ?? (item.price ?? 0) * (item.quantity ?? 0);
}

// 여러 항목을 삭제한다. BE에 일괄 삭제가 없어 항목별로 보내고, 모두 끝난 뒤 실패 건수를 알려 준다.
// 이미 지워진 항목(404)은 목적을 이룬 것이므로 실패로 세지 않는다.
async function removeAll(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => removeItem(id)));
    const failed = results.filter((r) => r.status === 'rejected' && !(r.reason instanceof ApiError && r.reason.status === 404));
    if (failed.length > 0) throw new Error(`${failed.length}건을 삭제하지 못했습니다.`);
}

// 개인 장바구니. 목록·수량·삭제·비우기를 BE와 연결하고, 고른 항목으로 주문서(/checkout?items=)로 넘어간다.
// BE 응답에 판매자·배송비가 없어 와이어프레임의 판매자별 묶음·배송비 계산은 빼고 상품 금액만 합산한다.
export default function CartView() {
    const queryClient = useQueryClient();
    const cart = useGetCart();
    const items = (cart.data?.data?.items ?? []).filter((item): item is CartItem => typeof item.cartItemId === 'number');

    // 체크 해제한 항목만 기억한다. 새로 담긴 항목은 기본으로 선택된다.
    const [unchecked, setUnchecked] = useState<Set<number>>(new Set());

    // 조작 결과 메시지는 마지막 조작 하나만 보여 준다. 새 조작을 시작하면 지운다.
    const [actionError, setActionError] = useState<string | null>(null);
    const handlers = {
        onMutate: () => setActionError(null),
        onError: (error: unknown) => setActionError(errorMessage(error, error instanceof Error ? error.message : '장바구니를 변경하지 못했습니다.')),
        onSettled: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    };
    const changeQuantity = useChangeQuantity({ mutation: handlers });
    const removeItems = useMutation({ mutationFn: removeAll, ...handlers });
    const clearCart = useMutation({ mutationFn: () => clear(), ...handlers });

    const busy = changeQuantity.isPending || removeItems.isPending || clearCart.isPending;

    const purchasable = items.filter((item) => item.purchasable !== false);
    const unavailable = items.filter((item) => item.purchasable === false);
    const selectedItems = purchasable.filter((item) => !unchecked.has(item.cartItemId));
    const allSelected = purchasable.length > 0 && selectedItems.length === purchasable.length;
    const itemsTotal = selectedItems.reduce((sum, item) => sum + lineTotal(item), 0);
    const totalQuantity = selectedItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

    const toggleItem = (id: number) => {
        setUnchecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = (checked: boolean) => {
        setUnchecked(checked ? new Set() : new Set(purchasable.map((item) => item.cartItemId)));
    };

    const handleClear = () => {
        if (window.confirm('장바구니를 모두 비울까요?')) clearCart.mutate();
    };

    if (cart.isPending) {
        return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    }
    // 목록을 한 번도 받지 못했을 때만 전체 에러 화면. 이미 목록이 있으면 갱신 실패는 위쪽 안내로만 알린다.
    if (cart.isError && !cart.data) {
        return (
            <Card variant="muted" role="alert">
                <EmptyState
                    title={errorMessage(cart.error, '장바구니를 불러오지 못했습니다.')}
                    description="잠시 후 다시 시도해 주세요."
                    actions={<Button label="다시 시도" variant="secondary" onClick={() => cart.refetch()} />}
                />
            </Card>
        );
    }
    if (items.length === 0) {
        return (
            <EmptyState
                title="장바구니가 비어 있습니다."
                description="함께 구매할 상품을 찾아 장바구니에 담아 보세요."
                icon={<Icon name="shopping_bag" className="text-[40px]" />}
                actions={<Button label="상품 보러 가기" href={ROUTES.search} as={Link} variant="primary" />}
            />
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-gutter items-start">
            <div className="flex-1 w-full flex flex-col gap-space-lg">
                <Card padding={3} className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-space-sm cursor-pointer select-none">
                        <input
                            checked={allSelected}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="w-4 h-4 accent-primary rounded-none cursor-pointer"
                            type="checkbox"
                            disabled={purchasable.length === 0}
                        />
                        <Text weight="semibold">
                            전체 선택 ({selectedItems.length}/{purchasable.length}건)
                        </Text>
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            label="선택 삭제"
                            size="sm"
                            variant="secondary"
                            isDisabled={busy || selectedItems.length === 0}
                            onClick={() => removeItems.mutate(selectedItems.map((item) => item.cartItemId))}
                        />
                        <Button
                            label="구매 불가 일괄 삭제"
                            size="sm"
                            variant="secondary"
                            isDisabled={busy || unavailable.length === 0}
                            onClick={() => removeItems.mutate(unavailable.map((item) => item.cartItemId))}
                        />
                        <Button label="전체 비우기" size="sm" variant="ghost" isDisabled={busy} onClick={handleClear} />
                    </div>
                </Card>
                {(actionError || cart.isError) && (
                    <Text as="p" className="px-4 text-error" role="alert">
                        {actionError ?? '장바구니를 새로 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'}
                    </Text>
                )}

                <Card padding={0}>
                    <section className="flex flex-col divide-y divide-outline-variant">
                        {items.map((item) => (
                            <CartRow
                                key={item.cartItemId}
                                item={item}
                                checked={!unchecked.has(item.cartItemId)}
                                disabled={busy}
                                onToggle={() => toggleItem(item.cartItemId)}
                                onRemove={() => removeItems.mutate([item.cartItemId])}
                                onQuantity={(quantity) => changeQuantity.mutate({ cartItemId: item.cartItemId, data: { quantity } })}
                            />
                        ))}
                    </section>
                </Card>
            </div>

            <aside className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-36 flex flex-col gap-space-md">
                <Card className="flex flex-col">
                    <Heading level={2}>결제 금액 요약</Heading>
                    <div className="py-space-md flex flex-col gap-space-sm">
                        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                            <span>선택 상품 금액</span>
                            <span className="font-label-md text-label-md text-on-surface">{formatPrice(itemsTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between font-caption text-caption text-outline -mt-1 pl-space-xs">
                            <span>└ 선택된 상품</span>
                            <span>
                                {selectedItems.length}종 / {totalQuantity}개
                            </span>
                        </div>
                        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant pt-space-xs">
                            <span>배송비</span>
                            <span className="font-label-sm text-label-sm text-outline">주문서에서 확인</span>
                        </div>
                    </div>
                    <div className="h-[1px] w-full bg-surface-container my-space-sm" />
                    <div className="pt-space-sm pb-space-lg flex items-baseline justify-between">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">상품 합계</span>
                        <span className="font-display-xl text-display-xl font-bold text-primary tracking-tight">{formatPrice(itemsTotal)}</span>
                    </div>
                    {selectedItems.length > 0 && !busy ? (
                        <Button
                            label={`주문하기 (${selectedItems.length}건)`}
                            className="w-full"
                            href={`${ROUTES.checkout}?items=${selectedItems.map((item) => item.cartItemId).join(',')}`}
                            as={Link}
                            variant="primary"
                            size="lg"
                            endContent={<Icon name="arrow_forward" className="text-[18px]" />}
                        />
                    ) : (
                        <Button
                            label={`주문하기 (${selectedItems.length}건)`}
                            className="w-full"
                            variant="primary"
                            size="lg"
                            isDisabled
                            endContent={<Icon name="arrow_forward" className="text-[18px]" />}
                        />
                    )}
                </Card>
                <Card variant="muted" padding={3} className="flex items-start gap-2">
                    <Icon name="info" className="text-outline text-[20px] flex-shrink-0 mt-0.5" />
                    <Text as="p" type="supporting" color="secondary">공동구매 상품은 팀 전용 공유 장바구니에서 별도 관리됩니다.</Text>
                </Card>
            </aside>
        </div>
    );
}

type RowProps = {
    item: CartItem;
    checked: boolean;
    disabled: boolean;
    onToggle: () => void;
    onRemove: () => void;
    onQuantity: (quantity: number) => void;
};

function CartRow({ item, checked, disabled, onToggle, onRemove, onQuantity }: RowProps) {
    const quantity = item.quantity ?? 1;
    const canBuy = item.purchasable !== false;
    const name = item.productName ?? '상품';

    return (
        <article className={`p-space-lg flex flex-col md:flex-row gap-space-md items-start justify-between ${canBuy ? '' : 'opacity-60'}`}>
            <div className="flex items-start gap-space-md w-full md:w-auto flex-1">
                <input
                    checked={canBuy && checked}
                    onChange={onToggle}
                    className="w-4 h-4 accent-primary mt-1 cursor-pointer disabled:cursor-not-allowed"
                    type="checkbox"
                    disabled={!canBuy}
                    aria-label={`${name} 선택`}
                />
                {/* 이미지 주소가 바뀌면(예: Mock → 실제 이미지) 실패 상태를 새로 시작한다 */}
                <ProductThumb key={item.imageUrl} src={item.imageUrl} alt={name} />
                <div className="flex flex-col flex-1 min-w-0">
                    {!canBuy && (
                        <Badge label="현재 구매할 수 없는 상품입니다" variant="neutral" className="self-start mb-1" />
                    )}
                    <Heading level={3} color={canBuy ? 'primary' : 'secondary'} hasStrikethrough={!canBuy} maxLines={1}>{item.productName}</Heading>
                    {item.optionName && <Text display="block" type="supporting" color="secondary" className="mt-1">옵션: {item.optionName}</Text>}
                    {item.price !== undefined && <Text display="block" type="supporting" color="secondary" className="mt-0.5">단가: {formatPrice(item.price)}</Text>}
                </div>
            </div>
            <div className="flex md:flex-col items-end justify-between w-full md:w-auto md:min-w-[140px] pt-space-sm md:pt-0 gap-space-sm">
                <button
                    aria-label={`${name} 삭제`}
                    className="text-outline hover:text-on-surface p-1 self-end disabled:opacity-40"
                    type="button"
                    disabled={disabled}
                    onClick={onRemove}
                >
                    <Icon name="close" className="text-[18px]" />
                </button>
                <div className="flex items-center bg-surface-container">
                    <button
                        className="w-7 h-7 flex items-center justify-center font-label-md text-on-surface hover:bg-surface-container-highest disabled:opacity-40"
                        type="button"
                        aria-label={`${name} 수량 줄이기`}
                        disabled={disabled || !canBuy || quantity <= 1}
                        onClick={() => onQuantity(quantity - 1)}
                    >
                        -
                    </button>
                    <output className="w-8 h-7 flex items-center justify-center font-label-sm text-label-sm text-on-surface" aria-live="polite">
                        <span className="sr-only">{name} 수량 </span>
                        {quantity}
                    </output>
                    <button
                        className="w-7 h-7 flex items-center justify-center font-label-md text-on-surface hover:bg-surface-container-highest disabled:opacity-40"
                        type="button"
                        aria-label={`${name} 수량 늘리기`}
                        disabled={disabled || !canBuy || quantity >= MAX_QUANTITY}
                        onClick={() => onQuantity(quantity + 1)}
                    >
                        +
                    </button>
                </div>
                <div className={`font-headline-sm text-headline-sm font-bold ${canBuy ? 'text-on-surface' : 'text-outline line-through'}`}>
                    {formatPrice(lineTotal(item))}
                </div>
            </div>
        </article>
    );
}

// BE가 준 이미지 주소가 열리지 않으면(현재 Mock 주소) 자리 표시 아이콘으로 바꾼다.
function ProductThumb({ src, alt }: { src?: string; alt: string }) {
    const [failed, setFailed] = useState(false);
    return (
        <div className="w-20 h-20 bg-surface-container flex-shrink-0 relative flex items-center justify-center overflow-hidden">
            {src && !failed ? (
                <Image src={src} alt={alt} fill unoptimized className="object-cover" onError={() => setFailed(true)} />
            ) : (
                <Icon name="image" className="text-outline text-[24px]" />
            )}
        </div>
    );
}
