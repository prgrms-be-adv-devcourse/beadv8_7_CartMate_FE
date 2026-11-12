'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Heading } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMyClaimsQueryKey, useCreateClaim } from '@/api/generated/claim-controller/claim-controller';
import type { DeliveryClaimCreateRequestReason, DeliveryDetailItemResponse, DeliveryDetailResponse, OrderDetailResponse } from '@/api/generated/model';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { CLAIM_REASON_LABEL, claimErrorMessage, type ClaimType } from '@/app/(shop)/mypage/claims/_lib/claimView';

const DETAIL_MAX = 1000;

const REQUEST_TYPES: { value: ClaimType; title: string; description: string }[] = [
    { value: 'EXCHANGE', title: '상품 교환', description: '다른 사이즈나 색상으로 바꿉니다. 금액 변동은 없습니다.' },
    { value: 'REFUND', title: '반품 (환불)', description: '상품을 반품하고 예치금으로 환불받습니다.' },
];

// 구매자에게 보여 줄 배송 상태. 신청은 DELIVERED에서만 된다(BE DeliveryClaimCreateUseCase).
const DELIVERY_STATUS: Record<string, { label: string; note: string }> = {
    REQUESTED: { label: '배송 요청', note: '판매자가 배송을 준비하기 전입니다. 배송 완료 후 신청할 수 있습니다.' },
    PREPARING: { label: '배송 준비', note: '배송 완료 후 신청할 수 있습니다.' },
    SHIPPING: { label: '배송 중', note: '배송 완료 후 신청할 수 있습니다.' },
    DELIVERED: { label: '배송 완료', note: '' },
    CONFIRMED: { label: '구매 확정', note: '구매 확정된 배송은 교환 · 환불을 신청할 수 없습니다.' },
    CANCELED: { label: '배송 취소', note: '취소된 배송입니다.' },
};

type Props = {
    order: OrderDetailResponse;
    orderId: number;
    deliveries: DeliveryDetailResponse[];
    // 진행 중인 클레임에 이미 들어간 배송 상품 id
    blockedItemIds: Set<number>;
    // 이미 환불된(승인·완료된 환불 클레임) 배송 상품 id → 수량
    refundedQty: Map<number, number>;
    // ?delivery=로 주문의 배송 중 하나만 보여 주는 중인지(다른 배송 보기 링크 표시용)
    focused?: boolean;
};

// 배송이 하나뿐이고 신청할 수 있으면 그 배송의 신청 가능한 상품을 전체 수량으로 미리 골라 둔다.
// 아직 신청할 수 있는 수량 = 받은 수량 - 이미 환불된 수량
function remainingOf(item: DeliveryDetailItemResponse, refundedQty: Map<number, number>): number {
    return Math.max(0, (item.quantity ?? 0) - (refundedQty.get(item.deliveryItemId ?? 0) ?? 0));
}

function initialSelection(
    deliveries: DeliveryDetailResponse[],
    blocked: Set<number>,
    refundedQty: Map<number, number>,
): { deliveryId: number | null; quantities: Record<number, number> } {
    const only = deliveries.length === 1 ? deliveries[0] : undefined;
    if (!only?.deliveryId || only.status !== 'DELIVERED') return { deliveryId: null, quantities: {} };
    const quantities: Record<number, number> = {};
    for (const item of only.items ?? []) {
        const remaining = remainingOf(item, refundedQty);
        if (item.deliveryItemId && !blocked.has(item.deliveryItemId) && remaining > 0) quantities[item.deliveryItemId] = remaining;
    }
    return Object.keys(quantities).length ? { deliveryId: only.deliveryId, quantities } : { deliveryId: null, quantities: {} };
}

// 교환·환불 신청 폼. 클레임은 배송 단위라, 한 번에 한 배송의 상품만 고를 수 있다.
export default function ClaimForm({ order, orderId, deliveries, blockedItemIds, refundedQty, focused }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [initial] = useState(() => initialSelection(deliveries, blockedItemIds, refundedQty));
    const [deliveryId, setDeliveryId] = useState<number | null>(initial.deliveryId);
    // 선택한 배송 상품 id → 신청 수량
    const [quantities, setQuantities] = useState<Record<number, number>>(initial.quantities);
    const [claimType, setClaimType] = useState<ClaimType | null>(null);
    const [reason, setReason] = useState('');
    const [detail, setDetail] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const priceByOrderItemId = new Map((order.items ?? []).map((item) => [item.itemId, item.unitPrice ?? 0]));
    const optionByOrderItemId = new Map((order.items ?? []).map((item) => [item.itemId, item.optionName]));

    const create = useCreateClaim({
        mutation: {
            onSuccess: (res) => {
                void queryClient.invalidateQueries({ queryKey: getGetMyClaimsQueryKey() });
                const claimId = res.data?.claimId;
                router.push(claimId ? `${ROUTES.myClaims}?created=${claimId}` : ROUTES.myClaims);
            },
            onError: (error) => setFormError(claimErrorMessage(error)),
        },
    });

    const selectedEntries = Object.entries(quantities).map(([id, qty]) => ({ deliveryItemId: Number(id), quantity: qty }));
    const selectedDelivery = deliveries.find((d) => d.deliveryId === deliveryId);
    const expectedRefund = selectedEntries.reduce((sum, entry) => {
        const item = selectedDelivery?.items?.find((i) => i.deliveryItemId === entry.deliveryItemId);
        return sum + (priceByOrderItemId.get(item?.orderItemId) ?? 0) * entry.quantity;
    }, 0);
    const anyClaimable = deliveries.some((d) => d.status === 'DELIVERED' && (d.items ?? []).some((i) => i.deliveryItemId && !blockedItemIds.has(i.deliveryItemId) && remainingOf(i, refundedQty) > 0));

    function toggleItem(delivery: DeliveryDetailResponse, item: DeliveryDetailItemResponse, checked: boolean) {
        const itemId = item.deliveryItemId;
        if (!itemId || !delivery.deliveryId) return;
        setFormError(null);
        if (!checked) {
            const next = { ...quantities };
            delete next[itemId];
            setQuantities(next);
            if (Object.keys(next).length === 0) setDeliveryId(null);
            return;
        }
        // 다른 배송의 상품을 고르면 앞서 고른 배송의 선택은 풀린다.
        if (deliveryId !== delivery.deliveryId) {
            setDeliveryId(delivery.deliveryId);
            setQuantities({ [itemId]: remainingOf(item, refundedQty) });
            return;
        }
        setQuantities((prev) => ({ ...prev, [itemId]: remainingOf(item, refundedQty) }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (create.isPending) return;
        if (!deliveryId || selectedEntries.length === 0) return setFormError('교환 · 환불할 상품을 선택해 주세요.');
        if (!claimType) return setFormError('신청 구분(교환 / 반품)을 선택해 주세요.');
        if (!reason) return setFormError('사유를 선택해 주세요.');
        if (detail.trim().length > DETAIL_MAX) return setFormError(`상세 사유는 ${DETAIL_MAX}자 이내로 입력해 주세요.`);
        setFormError(null);
        create.mutate({
            data: {
                deliveryId,
                claimType,
                reason: reason as DeliveryClaimCreateRequestReason,
                detail: detail.trim() || undefined,
                items: selectedEntries,
            },
        });
    }

    return (
        <form className="flex flex-col gap-space-xl" onSubmit={handleSubmit} noValidate>
            {/* 1. 대상 상품 */}
            <Card padding={4} aria-labelledby="claim-items-title">
                <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md pb-space-sm border-b border-surface-container">
                    <Heading id="claim-items-title" level={2}>
                        1. 교환 / 환불 대상 상품 선택
                    </Heading>
                    <Link href={ROUTES.order(orderId)} className="font-caption text-caption text-outline hover:text-primary">
                        주문번호 {order.orderNumber}
                    </Link>
                </div>

                {focused && (
                    <p className="mb-space-md font-caption text-caption text-outline">
                        선택한 배송만 보여 드립니다.{' '}
                        <Link href={ROUTES.orderClaim(orderId)} className="text-primary hover:underline">
                            이 주문의 모든 배송 보기
                        </Link>
                    </p>
                )}

                {!anyClaimable && (
                    <p className="mb-space-md p-space-md bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant flex items-start gap-space-xs">
                        <Icon name="info" className="text-[18px] text-outline" />
                        지금 신청할 수 있는 상품이 없습니다. 배송 완료 후, 구매 확정 전까지 신청할 수 있습니다.
                    </p>
                )}

                <div className="flex flex-col gap-space-lg">
                    {deliveries.map((delivery) => {
                        const status = DELIVERY_STATUS[delivery.status ?? ''] ?? { label: delivery.status ?? '-', note: '' };
                        const open = delivery.status === 'DELIVERED';
                        return (
                            <div key={delivery.deliveryId} data-delivery-id={delivery.deliveryId} className="flex flex-col gap-space-sm">
                                <div className="flex flex-wrap items-center gap-space-sm font-body-sm text-body-sm">
                                    <span className="font-label-md text-label-md text-on-surface">배송 #{delivery.deliveryId}</span>
                                    <Badge label={status.label} variant={open ? 'success' : 'neutral'} />
                                    {delivery.carrier && (
                                        <span className="text-outline">
                                            {delivery.carrier} {delivery.trackingNumber}
                                        </span>
                                    )}
                                </div>
                                {status.note && <p className="font-caption text-caption text-outline">{status.note}</p>}
                                <ul className="flex flex-col gap-space-sm">
                                    {(delivery.items ?? []).map((item) => {
                                        const itemId = item.deliveryItemId ?? 0;
                                        const blocked = blockedItemIds.has(itemId);
                                        const remaining = remainingOf(item, refundedQty);
                                        const refundedAll = remaining === 0 && (refundedQty.get(itemId) ?? 0) > 0;
                                        const disabled = !open || blocked || remaining === 0 || create.isPending;
                                        const checked = deliveryId === delivery.deliveryId && quantities[itemId] !== undefined;
                                        const max = Math.max(1, remaining);
                                        const unitPrice = priceByOrderItemId.get(item.orderItemId);
                                        const optionText =
                                            (item.options ?? []).map((o) => `${o.optionName}: ${o.optionValue}`).join(' / ') || optionByOrderItemId.get(item.orderItemId);
                                        return (
                                            <li
                                                key={itemId}
                                                className={`border p-space-md rounded flex flex-col sm:flex-row sm:items-center gap-space-md transition-colors ${checked ? 'border-primary bg-surface-container-low' : 'border-outline-variant bg-surface-container-lowest'} ${disabled && !checked ? 'opacity-60' : ''}`}
                                            >
                                                <label className={`flex items-center gap-space-md flex-1 min-w-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 accent-primary shrink-0"
                                                        name="claim-item"
                                                        value={itemId}
                                                        checked={checked}
                                                        disabled={disabled}
                                                        onChange={(e) => toggleItem(delivery, item, e.target.checked)}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="font-body-md text-body-md text-on-surface font-bold truncate">{item.productName ?? `상품 #${item.orderItemId}`}</div>
                                                        <div className="font-caption text-caption text-on-surface-variant mt-0.5">
                                                            {optionText && `${optionText} · `}
                                                            {unitPrice !== undefined && `${formatPrice(unitPrice)} × `}
                                                            {item.quantity ?? 0}개 받음
                                                        </div>
                                                        {blocked && <div className="font-caption text-caption text-primary font-bold mt-0.5">처리 중인 교환 · 환불 요청이 있습니다</div>}
                                                        {!blocked && refundedAll && <div className="font-caption text-caption text-outline font-bold mt-0.5">환불 완료된 상품입니다</div>}
                                                        {!blocked && !refundedAll && remaining < (item.quantity ?? 0) && (
                                                            <div className="font-caption text-caption text-outline mt-0.5">{(item.quantity ?? 0) - remaining}개 환불 완료 · {remaining}개 신청 가능</div>
                                                        )}
                                                    </div>
                                                </label>
                                                {checked && (
                                                    <div className="flex items-center gap-space-xs shrink-0">
                                                        <label htmlFor={`qty-${itemId}`} className="font-caption text-caption text-outline">
                                                            신청 수량
                                                        </label>
                                                        <select
                                                            id={`qty-${itemId}`}
                                                            value={quantities[itemId]}
                                                            disabled={create.isPending}
                                                            onChange={(e) => setQuantities((prev) => ({ ...prev, [itemId]: Number(e.target.value) }))}
                                                            className="h-9 border border-outline-variant bg-surface-container-lowest px-space-sm rounded font-body-sm text-body-sm text-on-surface"
                                                        >
                                                            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                                                                <option key={n} value={n}>
                                                                    {n}개
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* 2. 유형 · 사유 */}
            <Card padding={4} aria-labelledby="claim-form-title">
                <Heading id="claim-form-title" level={2} className="mb-space-md pb-space-sm border-b border-surface-container">
                    2. 접수 유형 및 사유 선택
                </Heading>
                <div className="flex flex-col gap-space-lg">
                    <fieldset>
                        <legend className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">신청 구분</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                            {REQUEST_TYPES.map((type) => (
                                <label
                                    key={type.value}
                                    className="border border-outline-variant p-space-md rounded flex items-center gap-space-sm cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low transition-colors"
                                >
                                    <input
                                        className="w-4 h-4 accent-primary"
                                        name="claimType"
                                        type="radio"
                                        value={type.value}
                                        checked={claimType === type.value}
                                        disabled={create.isPending}
                                        onChange={() => {
                                            setClaimType(type.value);
                                            setFormError(null);
                                        }}
                                    />
                                    <div>
                                        <div className="font-label-md text-label-md text-on-surface">{type.title}</div>
                                        <div className="font-caption text-caption text-outline">{type.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor="claim-reason" className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">
                            사유 선택
                        </label>
                        <div className="relative">
                            <select
                                id="claim-reason"
                                name="reason"
                                value={reason}
                                disabled={create.isPending}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setFormError(null);
                                }}
                                className="w-full h-[42px] border border-outline-variant bg-surface-container-lowest px-space-md rounded font-body-sm text-body-sm text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option disabled value="">
                                    사유를 선택해 주세요
                                </option>
                                {Object.entries(CLAIM_REASON_LABEL).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            <Icon name="expand_more" className="absolute right-3 top-2.5 text-outline pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="claim-detail" className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">
                            상세 사유 입력 (선택)
                        </label>
                        <textarea
                            id="claim-detail"
                            name="detail"
                            value={detail}
                            maxLength={DETAIL_MAX}
                            disabled={create.isPending}
                            onChange={(e) => setDetail(e.target.value)}
                            className="w-full border border-outline-variant bg-surface-container-lowest p-space-md rounded font-body-sm text-body-sm text-on-surface outline-none focus:border-primary resize-none placeholder:text-outline"
                            placeholder="교환 · 환불 사유와 교환을 원하시는 옵션(사이즈 등)을 적어 주세요."
                            rows={4}
                        />
                        <div className="font-caption text-caption text-outline text-right mt-1">
                            {detail.length} / {DETAIL_MAX}
                        </div>
                    </div>

                    {/* BE에 첨부 API가 없어 비활성으로 둔다. */}
                    <div aria-disabled="true" title="준비 중인 기능입니다">
                        <div className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">상품 사진 첨부 (준비 중)</div>
                        <div className="border border-dashed border-outline-variant p-space-lg rounded text-center bg-surface-container-low opacity-60 cursor-not-allowed">
                            <Icon name="add_a_photo" className="text-outline text-[32px] mb-space-xs" />
                            <div className="font-label-sm text-label-sm text-on-surface">사진 첨부는 준비 중입니다</div>
                        </div>
                    </div>

                    {/* 신청 요약 */}
                    <div className="p-space-md bg-surface-container-low border border-outline-variant rounded flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm" aria-live="polite">
                        <div className="font-body-sm text-body-sm text-on-surface-variant">
                            {selectedEntries.length === 0
                                ? '선택한 상품이 없습니다.'
                                : `배송 #${deliveryId} · ${selectedEntries.length}개 상품 · 총 ${selectedEntries.reduce((s, e) => s + e.quantity, 0)}개`}
                        </div>
                        {claimType === 'REFUND' && selectedEntries.length > 0 && (
                            <div className="text-right">
                                <div className="font-caption text-caption text-outline">환불 예정 금액 (판매자 승인 시 예치금으로 환불)</div>
                                <div data-testid="expected-refund" className="font-headline-sm text-headline-sm text-primary font-bold">
                                    {formatPrice(expectedRefund)}
                                </div>
                            </div>
                        )}
                    </div>

                    {formError && (
                        <p role="alert" className="p-space-md rounded bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-space-xs">
                            <Icon name="error" className="text-[18px]" />
                            {formError}
                        </p>
                    )}

                    <div className="pt-space-md border-t border-surface-container flex items-center justify-end gap-space-md">
                        <Button label="취소" variant="secondary" href={ROUTES.order(orderId)} />
                        <Button
                            label="요청하기"
                            variant="primary"
                            type="submit"
                            icon={<Icon name="check" className="text-[18px]" />}
                            isLoading={create.isPending}
                            isDisabled={create.isPending || !anyClaimable}
                        />
                    </div>
                </div>
            </Card>
        </form>
    );
}
