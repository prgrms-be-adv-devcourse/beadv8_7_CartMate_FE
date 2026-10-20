'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import ItemThumb from '../../../_components/ItemThumb';
import Notice from '../../../_components/Notice';
import SharedDetailGate, { type SharedDetailContext } from '../../../_components/SharedDetailGate';
import { DetailSkeleton } from '../../../_components/SharedStatusParts';
import { itemPermissions, MAX_QUANTITY, remainingText } from '../../../_lib/sharedGroupPurchase';
import { useSharedItemMutations } from '../../../_lib/useSharedItemMutations';
import SalesProductPicker, { type PickedProduct } from './SalesProductPicker';

// 범위는 BE SharedGroupPurchaseItemAddRequest 검증(1~999)과 맞춘다.
const quantitySchema = z.object({
    quantity: z
        .number({ error: '수량을 입력해주세요.' })
        .int('정수로 입력해주세요.')
        .min(1, '1개 이상 담아주세요.')
        .max(MAX_QUANTITY, `${MAX_QUANTITY}개 이하로 담아주세요.`),
});

type QuantityValues = z.infer<typeof quantitySchema>;

// 판매 상품을 골라 공동 장바구니에 담는다. 이미 담긴 상품을 다시 담으면 BE가 수량을 더한다.
export default function AddItemView() {
    return <SharedDetailGate skeleton={<DetailSkeleton />}>{(ctx) => <AddItemContent {...ctx} />}</SharedDetailGate>;
}

function AddItemContent({ id, purchase, remainingMs, deadlinePassed }: SharedDetailContext) {
    const { canAdd } = itemPermissions(purchase, deadlinePassed);
    const items = purchase.items ?? [];
    const inCartIds = new Set(items.map((item) => item.inventoryId).filter((v): v is number => v !== undefined));
    const [picked, setPicked] = useState<PickedProduct | null>(null);
    const [added, setAdded] = useState<string | null>(null);
    const { add } = useSharedItemMutations(id);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<QuantityValues>({ resolver: zodResolver(quantitySchema), defaultValues: { quantity: 1 } });

    if (!canAdd) {
        return <Notice message="수정이 마감되어 더 이상 상품을 담을 수 없습니다." href={ROUTES.groupPurchase(id)} linkLabel="공동구매 현황으로" />;
    }

    const onSelect = (product: PickedProduct) => {
        setPicked(product);
        setAdded(null);
        add.reset();
        reset({ quantity: 1 });
    };

    const onSubmit = ({ quantity }: QuantityValues) => {
        if (!picked || add.isPending) return;
        add.mutate(
            { id, data: { inventoryId: picked.inventoryId, quantity } },
            {
                onSuccess: () => {
                    setAdded(`'${picked.name}' ${quantity}개를 담았습니다.`);
                    setPicked(null);
                },
            },
        );
    };

    const existing = picked ? items.find((item) => item.inventoryId === picked.inventoryId) : undefined;

    return (
        <div className="flex flex-col gap-space-lg">
            <section className="flex flex-col gap-space-sm">
                <nav className="flex flex-wrap items-center gap-2 text-secondary font-body-sm text-body-sm">
                    <Link className="hover:text-primary" href={ROUTES.groupPurchases}>
                        내 공동구매
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] text-outline" />
                    <Link className="text-primary font-medium break-all" href={ROUTES.groupPurchase(id)}>
                        {purchase.title}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] text-outline" />
                    <span className="text-primary font-semibold">상품 담기</span>
                </nav>
                <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-wrap items-center justify-between gap-space-md">
                    <div className="flex flex-wrap items-center gap-2 text-secondary font-body-sm text-body-sm">
                        <span>
                            참여 인원: <strong className="text-primary">{purchase.participantCount ?? 0}명</strong> / 최대 {purchase.maxParticipants ?? '-'}명
                        </span>
                        <span className="text-outline">/</span>
                        <span>
                            담긴 상품: <strong className="text-primary">{items.length}종</strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-space-sm bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant">
                        <Icon name="schedule" className="text-[18px] text-primary" />
                        <span className="font-body-sm text-body-sm text-on-surface">
                            수정 마감: <strong className="font-semibold text-primary">{remainingMs === null ? '-' : remainingText(remainingMs)}</strong>
                        </span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-12 gap-gutter items-start">
                <section className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-headline-md text-headline-md text-primary">상품 고르기</h1>
                        <p className="font-body-sm text-body-sm text-secondary">판매 중인 상품을 골라 공동 장바구니에 담습니다. 담은 상품은 모든 참여자가 함께 봅니다.</p>
                    </div>
                    <SalesProductPicker selectedId={picked?.inventoryId ?? null} inCartIds={inCartIds} onSelect={onSelect} />
                </section>

                <section className="col-span-12 lg:col-span-5 lg:sticky lg:top-32 flex flex-col gap-space-md">
                    <form
                        className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <h2 className="font-headline-sm text-headline-sm text-primary">담을 상품</h2>
                        {picked ? (
                            <>
                                <div className="flex items-start gap-space-md">
                                    <ItemThumb src={picked.imageUrl} className="w-20 h-20" />
                                    <div className="min-w-0">
                                        <span className="font-caption text-caption text-secondary block truncate">{picked.postTitle}</span>
                                        <h3 className="font-label-md text-label-md text-primary font-bold">{picked.name}</h3>
                                        <span className="font-body-sm text-body-sm text-on-surface">{picked.price === null ? '가격 문의' : formatPrice(picked.price)}</span>
                                    </div>
                                </div>
                                <label className="flex flex-col gap-1">
                                    <span className="font-label-sm text-label-sm text-on-surface">옵션</span>
                                    {/* BE 상품은 아직 옵션이 없어 상품 하나가 곧 구매 단위다 */}
                                    <select
                                        className="h-11 px-space-md border border-outline-variant bg-surface-container-low font-body-md text-body-md text-on-surface-variant rounded"
                                        disabled
                                    >
                                        <option>기본 (옵션 선택 준비 중)</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-1">
                                    <span className="font-label-sm text-label-sm text-on-surface">수량</span>
                                    <input
                                        className="h-11 px-space-md border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface rounded focus:border-primary outline-none"
                                        type="number"
                                        inputMode="numeric"
                                        min={1}
                                        max={MAX_QUANTITY}
                                        aria-invalid={errors.quantity ? true : undefined}
                                        {...register('quantity', { valueAsNumber: true })}
                                    />
                                    {errors.quantity && <span className="font-caption text-caption text-error">{errors.quantity.message}</span>}
                                </label>
                                {existing && (
                                    <p className="font-caption text-caption text-secondary">
                                        이미 {existing.quantity ?? 0}개 담겨 있습니다. 담으면 수량이 더해집니다.
                                    </p>
                                )}
                                {add.isError && (
                                    <p className="font-caption text-caption text-error" role="alert">
                                        {errorMessage(add.error, '상품을 담지 못했습니다.')}
                                    </p>
                                )}
                                <button
                                    className="h-12 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                                    type="submit"
                                    disabled={add.isPending}
                                >
                                    <Icon name="add_shopping_cart" className="text-[20px]" />
                                    {add.isPending ? '담는 중...' : '공동 장바구니에 담기'}
                                </button>
                            </>
                        ) : (
                            <p className="p-space-lg bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant rounded">
                                왼쪽 목록에서 담을 상품을 골라주세요.
                            </p>
                        )}
                        {added && (
                            <div className="p-space-sm rounded bg-surface-container-high flex items-center gap-space-xs" role="status">
                                <Icon name="check_circle" className="text-primary text-[18px]" />
                                <span className="font-body-sm text-body-sm text-on-surface">{added}</span>
                            </div>
                        )}
                    </form>
                    <Link
                        className="h-11 rounded bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-variant"
                        href={ROUTES.groupPurchaseCart(id)}
                    >
                        <Icon name="shopping_cart" className="text-[18px]" />
                        공동 장바구니 보기 ({items.length}종)
                    </Link>
                </section>
            </div>
        </div>
    );
}
