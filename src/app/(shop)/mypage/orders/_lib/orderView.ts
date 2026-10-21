import type { OrderSummaryResponse, SharedGroupOrderSummaryResponse } from '@/api/generated/model';
import { ApiError } from '@/api/http';
import { parseKst } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

// 주문 내역 화면이 함께 쓰는 라벨·변환 함수.
// 개인 주문(GET /api/orders/me)과 공동 주문(GET /api/group-orders/shared/me)은 응답 모양이 달라 한 줄 모양(OrderRow)으로 맞춰 합친다.

export type OrderKind = 'PERSONAL' | 'INDIVIDUAL_GROUP' | 'SHARED_GROUP';
export type OrderTab = 'all' | 'personal' | 'group';

export const KIND_LABEL: Record<OrderKind, string> = {
    PERSONAL: '개인구매',
    INDIVIDUAL_GROUP: '개인물품 공구',
    SHARED_GROUP: '공동물품 공구',
};

export const TAB_KINDS: Record<OrderTab, readonly OrderKind[]> = {
    all: ['PERSONAL', 'INDIVIDUAL_GROUP', 'SHARED_GROUP'],
    personal: ['PERSONAL'],
    group: ['INDIVIDUAL_GROUP', 'SHARED_GROUP'],
};

export type StatusTone = 'pending' | 'done' | 'muted';

// 개인 주문 상태 (PAYMENT_PENDING · PAID · CANCELED)
export const ORDER_STATUS: Record<string, { label: string; tone: StatusTone }> = {
    PAYMENT_PENDING: { label: '결제 대기', tone: 'pending' },
    PAID: { label: '결제 완료', tone: 'done' },
    CANCELED: { label: '주문 취소', tone: 'muted' },
};

// 공동 주문 상태 (PAYING · CONFIRMED · CANCELED)
const SHARED_STATUS: Record<string, { label: string; tone: StatusTone }> = {
    PAYING: { label: '결제 진행 중', tone: 'pending' },
    CONFIRMED: { label: '주문 확정', tone: 'done' },
    CANCELED: { label: '주문 취소', tone: 'muted' },
};

export const STATUS_TONE_CLASS: Record<StatusTone, string> = {
    pending: 'bg-primary text-on-primary',
    done: 'border border-primary text-primary bg-surface-container-lowest',
    muted: 'border border-outline-variant text-outline bg-surface',
};

export const CANCEL_REASON_LABEL: Record<string, string> = {
    BUYER_CANCELED: '구매자가 주문을 취소했습니다.',
    PAYMENT_EXPIRED: '결제 기한이 지나 자동으로 취소되었습니다.',
    OUT_OF_STOCK: '재고가 부족해 취소되었습니다.',
};

export type OrderRow = {
    key: string;
    kind: OrderKind;
    createdAt?: string;
    // 검색·표시용 주문 번호. 공동 주문은 번호가 없어 "공동 주문 #id"로 보여 준다.
    orderNumber: string;
    title: string;
    subtitle: string;
    status: { label: string; tone: StatusTone };
    amount: number;
    amountNote?: string;
    href: string;
    // 결제 대기 개인 주문이면 결제 화면 주소
    payHref?: string;
};

export function personalRow(order: OrderSummaryResponse): OrderRow {
    const id = order.id ?? 0;
    const itemCount = order.itemCount ?? 0;
    const pending = order.status === 'PAYMENT_PENDING';
    return {
        key: `order-${id}`,
        kind: order.orderType === 'INDIVIDUAL_GROUP' ? 'INDIVIDUAL_GROUP' : 'PERSONAL',
        createdAt: order.createdAt,
        orderNumber: order.orderNumber ?? String(id),
        title: order.firstProductName ?? '상품 정보 없음',
        subtitle: itemCount > 1 ? `외 ${itemCount - 1}건 · 총 ${itemCount}개 품목` : '1개 품목',
        status: ORDER_STATUS[order.status ?? ''] ?? { label: order.status ?? '-', tone: 'muted' },
        amount: order.totalAmount ?? 0,
        href: ROUTES.order(id),
        payHref: pending ? `${ROUTES.checkout}?order=${id}` : undefined,
    };
}

export function sharedRow(order: SharedGroupOrderSummaryResponse): OrderRow {
    const paid = order.myPaymentStatus === 'PAID';
    const status = SHARED_STATUS[order.status ?? ''] ?? { label: order.status ?? '-', tone: 'muted' as const };
    return {
        key: `shared-${order.id}`,
        kind: 'SHARED_GROUP',
        createdAt: order.createdAt,
        orderNumber: `공동 주문 #${order.id}`,
        // 공동 주문 목록에는 상품명이 없다. 인원·결제 현황으로 요약한다.
        title: `${order.creator ? '내가 만든' : '참여한'} 공동구매 #${order.sharedGroupPurchaseId}`,
        subtitle: `참여 ${order.participantCount ?? 0}명 · 결제 ${order.paidCount ?? 0}/${order.participantCount ?? 0}명 · 내 몫 ${paid ? '결제 완료' : '미결제'}`,
        status,
        amount: order.myShareAmount ?? 0,
        amountNote: `총 ${(order.totalAmount ?? 0).toLocaleString('ko-KR')}원 중 내 몫`,
        // 공동 주문의 상세·결제는 공동구매 결과 화면이 맡는다.
        href: ROUTES.groupPurchaseResult(order.sharedGroupPurchaseId ?? 0),
    };
}

// 최신 주문이 위로 오게 정렬한다. 날짜가 없으면 맨 아래.
export function byNewest(a: OrderRow, b: OrderRow): number {
    return (parseKst(b.createdAt)?.getTime() ?? 0) - (parseKst(a.createdAt)?.getTime() ?? 0);
}

// 날짜만 (2026. 10. 20.)
const DATE_FORMAT = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeZone: 'Asia/Seoul' });
export function formatDate(value: string | undefined): string {
    const date = parseKst(value);
    return date ? DATE_FORMAT.format(date) : '-';
}

export function errorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

// BE resultCode는 "409-ORDER_ALREADY_CANCELED"처럼 상태 코드가 앞에 붙는다.
export function hasCode(error: unknown, code: string): boolean {
    return error instanceof ApiError && (error.resultCode?.endsWith(code) ?? false);
}
