'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { SharedGroupOrderDetailResponse } from '@/api/generated/model';
import { getGetBySharedGroupOrderQueryKey, usePaySharedGroupOrder } from '@/api/generated/payment-controller/payment-controller';
import {
    getGetDetail3QueryKey,
    getGetMyList3QueryKey,
    useGetDetail3,
    useGetMyList3,
} from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import { getGetMyWalletQueryKey, getGetMyWalletTransactionsQueryKey } from '@/api/generated/wallet-controller/wallet-controller';
import { parseKst } from '@/lib/format';

type Order = SharedGroupOrderDetailResponse;
type OrderStatus = NonNullable<Order['status']>;

// 다른 참여자의 결제로 결제 현황·확정 여부가 바뀌므로 화면을 보는 동안 주기적으로 다시 받는다.
const REFRESH_MS = 15_000;

// 공동 주문은 공동구매 id가 아니라 주문 id로 조회한다. 경로에는 공동구매 id만 있으므로
// 내 공동 주문 목록(GET /api/group-orders/shared/me)에서 공동구매 id로 주문 id를 찾은 뒤 상세를 받는다.
// 마감하면 BE가 같은 요청 안에서 주문을 만들므로 마감 직후에도 목록에 있다.
export function useSharedOrderOfPurchase(purchaseId: number, enabled: boolean) {
    const list = useGetMyList3({ query: { enabled, staleTime: 0 } });
    const summary = list.data?.data?.find((order) => order.sharedGroupPurchaseId === purchaseId);
    const orderId = summary?.id;
    const detail = useGetDetail3(orderId ?? 0, { query: { enabled: enabled && orderId !== undefined, refetchInterval: REFRESH_MS, staleTime: 0 } });
    return { list, summary, orderId, detail };
}

// 분담금 결제. 만든 사람은 팀 배송지를 함께 보내야 한다(BE가 그 결제에서만 배송지를 받음).
// 성공하면 주문(결제 현황·확정)·예치금을 다시 받고, 실패해도 주문을 다시 받아 기한 만료·이미 결제 같은 변화를 반영한다.
export function useSharedOrderPay(orderId: number) {
    const queryClient = useQueryClient();
    const refreshOrder = () => {
        void queryClient.invalidateQueries({ queryKey: getGetDetail3QueryKey(orderId) });
        void queryClient.invalidateQueries({ queryKey: getGetMyList3QueryKey() });
    };
    return usePaySharedGroupOrder({
        mutation: {
            onSuccess: () => {
                refreshOrder();
                for (const queryKey of [getGetMyWalletQueryKey(), getGetMyWalletTransactionsQueryKey(), getGetBySharedGroupOrderQueryKey(orderId)]) {
                    void queryClient.invalidateQueries({ queryKey });
                }
            },
            onError: () => {
                refreshOrder();
                void queryClient.invalidateQueries({ queryKey: getGetMyWalletQueryKey() });
            },
        },
    });
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    PAYING: '결제 진행 중',
    CONFIRMED: '주문 확정',
    CANCELED: '주문 취소',
};

export const CANCEL_REASON_LABEL: Record<NonNullable<Order['cancelReason']>, string> = {
    DEADLINE_EXPIRED: '결제 기한 안에 모든 참여자가 결제하지 않아 자동으로 취소되었습니다.',
    OUT_OF_STOCK: '재고가 부족해 취소되었습니다.',
    CREATOR_CANCELED: '만든 사람이 공동 주문을 취소했습니다.',
};

const BADGE_BASE = 'inline-flex items-center px-2 py-0.5 rounded font-caption text-caption font-bold';

export function orderBadgeClass(status: Order['status']): string {
    if (status === 'PAYING') return `${BADGE_BASE} bg-primary text-on-primary`;
    if (status === 'CONFIRMED') return `${BADGE_BASE} bg-primary-container text-on-primary-container`;
    return `${BADGE_BASE} border border-outline-variant bg-surface-container text-on-surface-variant`;
}

// 결제 기한까지 남은 시간(ms). 브라우저 시계가 틀려도 맞도록 응답을 받은 순간의 서버 시각 차이로 보정한다.
export function paymentRemainingMs(order: Order, receivedAt: number, now: number): number | null {
    const deadline = parseKst(order.paymentDeadlineAt)?.getTime();
    if (deadline === undefined) return null;
    const serverTime = parseKst(order.serverTime)?.getTime();
    const offset = serverTime === undefined ? 0 : serverTime - receivedAt;
    return deadline - offset - now;
}

// BE는 결제 기한(paymentDeadlineAt)까지 결제를 받는다(그 뒤 10분 유예 후 스케줄러가 취소).
export function canPayNow(order: Order, remainingMs: number | null): boolean {
    return order.status === 'PAYING' && order.myPaymentStatus === 'UNPAID' && (remainingMs === null || remainingMs > 0);
}
