import type { DeliveryClaimResponse, DeliveryDetailResponse } from '@/api/generated/model';
import type { StatusTone } from '../../orders/_lib/orderView';

// 구매자 배송 조회 화면(주문 상세 · 배송 목록 · 배송 상세)이 함께 쓰는 라벨과 계산.
// 상태 값과 전이는 BE Delivery 기준: REQUESTED → PREPARING(송장 등록) → SHIPPING → DELIVERED → CONFIRMED, 또는 CANCELED.

export type DeliveryStatus = 'REQUESTED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CONFIRMED' | 'CANCELED';

export const DELIVERY_STATUS: Record<DeliveryStatus, { label: string; tone: StatusTone; message: string }> = {
    REQUESTED: { label: '배송 요청', tone: 'pending', message: '판매자가 주문을 확인하고 있습니다.' },
    PREPARING: { label: '배송 준비', tone: 'pending', message: '송장이 등록되었습니다. 곧 상품이 발송됩니다.' },
    SHIPPING: { label: '배송 중', tone: 'pending', message: '상품이 발송되어 배송 중입니다.' },
    DELIVERED: { label: '배송 완료', tone: 'done', message: '상품을 받으셨다면 구매를 확정해 주세요.' },
    CONFIRMED: { label: '구매 확정', tone: 'done', message: '구매가 확정되었습니다. 이용해 주셔서 감사합니다.' },
    CANCELED: { label: '배송 취소', tone: 'muted', message: '배송이 취소되었습니다.' },
};

export function deliveryStatus(status: string | undefined) {
    return DELIVERY_STATUS[(status ?? '') as DeliveryStatus] ?? { label: status ?? '-', tone: 'muted' as const, message: '' };
}

// 트래커 단계. 시각은 BE 상세 응답에 있는 것만 보여 준다(배송 준비 시각은 BE가 따로 저장하지 않음).
export const TRACK_STEPS: { status: DeliveryStatus; label: string; icon: string; at?: keyof DeliveryDetailResponse }[] = [
    { status: 'REQUESTED', label: '배송 요청', icon: 'receipt_long', at: 'createdAt' },
    { status: 'PREPARING', label: '배송 준비', icon: 'inventory_2' },
    { status: 'SHIPPING', label: '배송 중', icon: 'local_shipping', at: 'shippedAt' },
    { status: 'DELIVERED', label: '배송 완료', icon: 'home', at: 'deliveredAt' },
    { status: 'CONFIRMED', label: '구매 확정', icon: 'verified', at: 'confirmedAt' },
];

// 지금 상태가 트래커에서 몇 번째 단계인지. 취소 · 알 수 없는 값은 -1.
export function trackIndex(status: string | undefined): number {
    return TRACK_STEPS.findIndex((step) => step.status === status);
}

// BE 자동 처리 기준(DeliveryScheduler): 배송 완료 후 7일이 지나면 자동 구매 확정.
export const AUTO_CONFIRM_DAYS = 7;

// 교환 · 환불이 판매자 처리 중(접수 · 승인)인 클레임. 이 동안 BE는 구매 확정을 막는다(409 DELIVERY_CLAIM_IN_PROGRESS).
export function activeClaimOf(claims: DeliveryClaimResponse[] | undefined, deliveryId: number): DeliveryClaimResponse | undefined {
    return claims?.find((claim) => claim.deliveryId === deliveryId && (claim.status === 'REQUESTED' || claim.status === 'APPROVED'));
}

export const CLAIM_TYPE_LABEL: Record<string, string> = {
    EXCHANGE: '교환',
    REFUND: '환불',
};

// 내 교환 · 환불 목록은 한 번에 넉넉히 받아 배송별로 찾는다(BE에 배송별 클레임 조회가 없음).
export const MY_CLAIMS_PARAMS = { size: 100 } as const;
