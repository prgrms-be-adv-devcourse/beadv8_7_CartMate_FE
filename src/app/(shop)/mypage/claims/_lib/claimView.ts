import type { OrderDetailItemResponse } from '@/api/generated/model';
import { ApiError } from '@/api/http';

// 교환·환불(클레임) 화면이 함께 쓰는 라벨·계산 함수. 구매자 신청 화면과 내 클레임 목록이 같이 쓴다.

export type ClaimType = 'EXCHANGE' | 'REFUND';
export type ClaimStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export const CLAIM_TYPE_LABEL: Record<string, string> = {
    EXCHANGE: '교환',
    REFUND: '반품 (환불)',
};

export const CLAIM_REASON_LABEL: Record<string, string> = {
    SIZE_MISMATCH: '사이즈 불일치 (작거나 큼)',
    SIMPLE_CHANGE: '단순 변심 (디자인, 색상 불만족)',
    PRODUCT_DEFECT: '상품 불량 및 파손',
    WRONG_DELIVERY: '오배송 및 누락',
    OTHER: '기타 사유',
};

// 구매자 쪽 상태 표시. BE는 판매자 승인과 같은 트랜잭션에서 환불하므로 환불 클레임은 승인되면 이미 환불된 상태다.
export const CLAIM_STATUS: Record<string, { label: string; className: string }> = {
    REQUESTED: { label: '접수됨 · 판매자 확인 중', className: 'bg-primary text-on-primary' },
    APPROVED: { label: '승인됨 · 처리 중', className: 'border border-primary text-primary bg-surface-container-lowest' },
    COMPLETED: { label: '처리 완료', className: 'bg-surface-container-high text-on-surface' },
    REJECTED: { label: '거절됨', className: 'border border-outline-variant text-outline bg-surface' },
};

// 진행 중(재접수 불가) 상태. BE DeliveryClaimCreateUseCase.ACTIVE_STATUSES와 같다.
export const ACTIVE_CLAIM_STATUSES: readonly string[] = ['REQUESTED', 'APPROVED'];

// 환불 클레임이 돈까지 돌려준 상태인지. 승인 시점에 환불되므로 APPROVED·COMPLETED.
export function isRefunded(claimType: string | undefined, status: string | undefined): boolean {
    return claimType === 'REFUND' && (status === 'APPROVED' || status === 'COMPLETED');
}

// 주문 상품 단가로 환불 금액을 계산한다. BE도 배송 상품 단가 × 요청 수량 합계로 환불한다(DeliveryClaimApproveUseCase).
// 클레임 응답에 금액이 없어 주문 상세의 단가를 orderItemId로 찾아 쓴다.
export function refundAmountOf(
    items: { orderItemId?: number; quantity?: number }[] | undefined,
    orderItems: OrderDetailItemResponse[] | undefined,
): number | null {
    if (!items || !orderItems) return null;
    const priceById = new Map(orderItems.map((item) => [item.itemId, item.unitPrice ?? 0]));
    let sum = 0;
    for (const item of items) {
        const price = priceById.get(item.orderItemId);
        if (price === undefined) return null;
        sum += price * (item.quantity ?? 0);
    }
    return sum;
}

export function errorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

// BE resultCode는 "409-DELIVERY_CLAIM_ALREADY_EXISTS"처럼 상태 코드가 앞에 붙는다.
export function hasCode(error: unknown, code: string): boolean {
    return error instanceof ApiError && (error.resultCode?.endsWith(code) ?? false);
}

// 클레임 신청 실패 안내. BE 메시지가 있어도 상황별로 다음 행동을 알려 준다.
export function claimErrorMessage(error: unknown): string {
    if (hasCode(error, 'DELIVERY_CLAIM_ALREADY_EXISTS')) return '이미 처리 중인 교환·환불 요청에 포함된 상품이 있습니다. 내 교환·환불 내역을 확인해 주세요.';
    if (hasCode(error, 'DELIVERY_INVALID_STATUS')) return '배송 완료된 상품만 신청할 수 있습니다. 이미 구매 확정되었거나 아직 배송 중인지 확인해 주세요.';
    if (hasCode(error, 'DELIVERY_CLAIM_QUANTITY_EXCEEDED')) return '신청 수량이 배송 수량보다 많습니다.';
    if (hasCode(error, 'DELIVERY_CLAIM_DETAIL_TOO_LONG')) return '상세 사유는 1000자 이내로 입력해 주세요.';
    const status = errorStatus(error);
    if (status === 403) return '본인이 받은 배송만 신청할 수 있습니다.';
    if (status === 404) return '배송 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요.';
    if (status === 0) return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    return error instanceof ApiError ? error.message : '신청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
