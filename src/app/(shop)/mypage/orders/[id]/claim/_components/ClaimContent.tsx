'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Button, EmptyState } from '@astryxdesign/core';
import { useQueries } from '@tanstack/react-query';
import { useGetMyClaims } from '@/api/generated/claim-controller/claim-controller';
import { getGetDeliveryDetailsQueryOptions, useGetDeliveriesByOrder } from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryDetailResponse } from '@/api/generated/model';
import { useGetDetail } from '@/api/generated/order-controller/order-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { ACTIVE_CLAIM_STATUSES, errorStatus, isRefunded } from '@/app/(shop)/mypage/claims/_lib/claimView';
import ClaimForm from './ClaimForm';

// 404·403은 재시도해도 같으니 바로 안내한다.
const retryUnlessHttp = (count: number, error: unknown) => errorStatus(error) === undefined && count < 2;

// 교환·환불 신청 화면의 데이터 준비. 주문 → 주문별 배송 → 배송 상세(배송 상품 id) → 내 진행 중 클레임 순으로 모은다.
export default function ClaimContent() {
    const params = useParams<{ id: string }>();
    // 주문 상세의 배송별 "교환 · 환불 신청" 링크는 ?delivery=<배송 id>로 들어온다.
    const deliveryParam = Number(useSearchParams().get('delivery')) || null;
    const orderId = Number(params.id);
    const validId = Number.isInteger(orderId) && orderId > 0;

    const orderQuery = useGetDetail(orderId, { query: { enabled: validId, retry: retryUnlessHttp } });
    const order = orderQuery.data?.data;
    // 결제 대기 · 취소가 아니면 배송을 조회한다(알 수 없는 상태가 와도 로딩에 갇히지 않게).
    const paid = !!order && order.status !== 'PAYMENT_PENDING' && order.status !== 'CANCELED';

    // 개인 주문(일반 · 개인물품 공구)의 배송은 구매 유형이 INDIVIDUAL_GROUP이다(BE DeliveryOrderEventListener).
    const deliveriesQuery = useGetDeliveriesByOrder(
        { orderId, purchaseType: 'INDIVIDUAL_GROUP' },
        { query: { enabled: validId && paid, retry: retryUnlessHttp } },
    );
    const deliveries = deliveriesQuery.data?.data ?? [];

    const detailQueries = useQueries({
        queries: deliveries.map((d) => getGetDeliveryDetailsQueryOptions(d.deliveryId ?? 0, { query: { enabled: !!d.deliveryId, retry: retryUnlessHttp } })),
    });

    // 진행 중 클레임에 들어간 배송 상품은 다시 신청할 수 없다. 한 주문의 클레임은 많지 않아 최근 100건으로 충분하다.
    const claimsQuery = useGetMyClaims(
        { page: 0, size: 100 },
        // 폼 초기 선택이 첫 데이터로 정해지므로 캐시된 옛 목록으로 그리지 않게 화면을 떠나면 바로 버린다.
        { query: { enabled: validId && paid, gcTime: 0 } },
    );

    if (!validId) return <Notice icon="search_off" title="주문을 찾을 수 없습니다" message="주소가 올바른지 확인해 주세요." />;
    if (orderQuery.isPending) return <Loading />;
    if (!order) {
        const status = errorStatus(orderQuery.error);
        if (status === 404) return <Notice icon="search_off" title="주문을 찾을 수 없습니다" message="삭제되었거나 존재하지 않는 주문입니다." />;
        if (status === 403) return <Notice icon="lock" title="신청할 수 없는 주문입니다" message="본인이 주문한 내역만 교환 · 환불을 신청할 수 있습니다." />;
        return (
            <Notice icon="error" title="주문 정보를 불러오지 못했습니다" message={errorMessage(orderQuery.error, '잠시 후 다시 시도해 주세요.')}>
                <Button label="다시 시도" variant="secondary" onClick={() => void orderQuery.refetch()} />
            </Notice>
        );
    }

    if (order.status === 'PAYMENT_PENDING') {
        return (
            <Notice icon="hourglass_empty" title="결제 대기 중인 주문입니다" message="결제를 마치고 상품을 받은 뒤 교환 · 환불을 신청할 수 있습니다.">
                <BackToOrder orderId={orderId} />
            </Notice>
        );
    }
    if (order.status === 'CANCELED') {
        return (
            <Notice icon="block" title="취소된 주문입니다" message="취소된 주문은 교환 · 환불을 신청할 수 없습니다.">
                <BackToOrder orderId={orderId} />
            </Notice>
        );
    }

    const detailsPending = detailQueries.some((q) => q.isPending && q.fetchStatus !== 'idle');
    if (deliveriesQuery.isPending || detailsPending || claimsQuery.isPending) return <Loading />;

    const loadError = deliveriesQuery.error ?? detailQueries.find((q) => q.error)?.error ?? claimsQuery.error;
    if (loadError) {
        return (
            <Notice icon="error" title="배송 정보를 불러오지 못했습니다" message={errorMessage(loadError, '잠시 후 다시 시도해 주세요.')}>
                <Button
                    label="다시 시도"
                    variant="secondary"
                    onClick={() => {
                        void deliveriesQuery.refetch();
                        detailQueries.forEach((q) => void q.refetch());
                        void claimsQuery.refetch();
                    }}
                />
            </Notice>
        );
    }

    const details = detailQueries.map((q) => q.data?.data).filter((d): d is DeliveryDetailResponse => !!d);
    if (details.length === 0) {
        return (
            <Notice icon="local_shipping" title="아직 배송 정보가 없습니다" message="판매자가 배송을 접수하면 배송 완료 후 신청할 수 있습니다.">
                <BackToOrder orderId={orderId} />
            </Notice>
        );
    }

    const deliveryIds = new Set(details.map((d) => d.deliveryId));
    const blockedItemIds = new Set<number>();
    const refundedQty = new Map<number, number>();
    for (const claim of claimsQuery.data?.data?.content ?? []) {
        if (!deliveryIds.has(claim.deliveryId)) continue;
        for (const item of claim.items ?? []) {
            if (!item.deliveryItemId) continue;
            if (ACTIVE_CLAIM_STATUSES.includes(claim.status ?? '')) blockedItemIds.add(item.deliveryItemId);
            // 이미 환불된 수량. BE는 완료된 클레임 상품의 재접수를 막지 않지만, 결제 금액을 넘는 환불은 승인 때 실패한다.
            if (isRefunded(claim.claimType, claim.status)) refundedQty.set(item.deliveryItemId, (refundedQty.get(item.deliveryItemId) ?? 0) + (item.quantity ?? 0));
        }
    }

    // 지정한 배송이 이 주문의 배송이면 그 배송만 신청 대상으로 보여 준다. 아니면(잘못된 값) 전체를 보여 준다.
    const target = deliveryParam ? details.find((d) => d.deliveryId === deliveryParam) : undefined;
    return (
        <ClaimForm
            key={target?.deliveryId ?? 'all'}
            order={order}
            orderId={orderId}
            deliveries={target ? [target] : details}
            focused={!!target && details.length > 1}
            blockedItemIds={blockedItemIds}
            refundedQty={refundedQty}
        />
    );
}

function BackToOrder({ orderId }: { orderId: number }) {
    return (
        <Button label="주문 상세로" variant="secondary" href={ROUTES.order(orderId)} as={Link} />
    );
}

function Loading() {
    return (
        <div className="flex flex-col gap-space-xl" aria-busy="true">
            <div className="h-48 bg-surface-container-low border border-outline-variant rounded animate-pulse" />
            <div className="h-72 bg-surface-container-low border border-outline-variant rounded animate-pulse" />
        </div>
    );
}

function Notice({ icon, title, message, children }: { icon: string; title: string; message: string; children?: ReactNode }) {
    return (
        <EmptyState icon={<Icon name={icon} />} title={title} description={message} actions={children ? <div className="flex flex-wrap justify-center gap-space-sm">{children}</div> : undefined} />
    );
}
