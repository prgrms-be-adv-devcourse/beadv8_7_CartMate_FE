import type { DeliveryClaimResponse } from '@/api/generated/model';
import { ApiError } from '@/api/http';

// 교환·환불(클레임) 화면이 함께 쓰는 라벨·계산 함수. 구매자 신청 화면과 내 클레임 목록이 같이 쓴다.

export type ClaimType = 'EXCHANGE' | 'REFUND';
export type ClaimStatus = 'VERIFYING' | 'NOT_ACCEPTED' | 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

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

// 구매자 쪽 상태 표시. 상품마다 승인 · 거절되므로 결과는 상품별로도 보여 준다(BE ADR 0012).
export const CLAIM_STATUS: Record<string, { label: string; className: string }> = {
    VERIFYING: { label: '접수 확인 중', className: 'bg-primary text-on-primary' },
    NOT_ACCEPTED: { label: '접수 불가', className: 'border border-outline-variant text-outline bg-surface' },
    REQUESTED: { label: '접수됨 · 판매자 확인 중', className: 'bg-primary text-on-primary' },
    APPROVED: { label: '승인됨 · 처리 중', className: 'border border-primary text-primary bg-surface-container-lowest' },
    COMPLETED: { label: '처리 완료', className: 'bg-surface-container-high text-on-surface' },
    REJECTED: { label: '거절됨', className: 'border border-outline-variant text-outline bg-surface' },
};

// 진행 중 상태. 이 클레임에 든 상품은 결과와 상관없이 새로 접수할 수 없다(BE ClaimStatus.inProgress).
export const ACTIVE_CLAIM_STATUSES: readonly string[] = ['VERIFYING', 'REQUESTED', 'APPROVED'];

// 판매자 탓 사유. 반품 환불의 쿠폰 할인 계산 방식이 달라진다(BE ClaimReason.sellerFault).
export const SELLER_FAULT_REASONS: readonly string[] = ['PRODUCT_DEFECT', 'WRONG_DELIVERY'];

// 이미 반품된 배송 상품. 승인 · 처리 완료된 반품 클레임에서 승인된 상품은 반품도 교환도 다시 접수할 수 없다.
export function returnedItemIdsOf(claims: DeliveryClaimResponse[] | undefined): Set<number> {
    const ids = new Set<number>();
    for (const claim of claims ?? []) {
        if (claim.claimType !== 'REFUND' || (claim.status !== 'APPROVED' && claim.status !== 'COMPLETED')) continue;
        for (const item of claim.items ?? []) if (item.result === 'APPROVED' && item.deliveryItemId) ids.add(item.deliveryItemId);
    }
    return ids;
}

// 반품 환불 진행 상태(승인 뒤 비동기). 금액은 주문 서버가 쿠폰 할인을 반영해 정한다.
export const REFUND_STATUS_LABEL: Record<string, string> = {
    PENDING: '예치금 환불 진행 중',
    COMPLETED: '예치금 환불 완료',
    FAILED: '환불에 실패했습니다. 고객센터에서 확인 중입니다.',
};

// 접수 검사(구매자 사정 반품)에서 받지 않은 이유.
export function notAcceptedMessage(code: string | undefined): string {
    if (code?.endsWith('ORDER_RETURN_COUPON_MINIMUM')) return '이 상품만 반품하면 쿠폰 최소 금액을 채우지 못해 접수할 수 없습니다. 다른 상품과 함께 신청해 주세요.';
    return '접수 확인 결과 이 요청을 받을 수 없습니다. 고객센터에 문의해 주세요.';
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
    if (hasCode(error, 'DELIVERY_CLAIM_ITEM_ALREADY_RETURNED')) return '이미 반품된 상품은 다시 신청할 수 없습니다.';
    if (hasCode(error, 'LOCK_ACQUISITION_FAILED')) return '같은 주문의 다른 신청을 처리하고 있습니다. 잠시 후 다시 시도해 주세요.';
    if (hasCode(error, 'DELIVERY_CLAIM_DETAIL_TOO_LONG')) return '상세 사유는 1000자 이내로 입력해 주세요.';
    const status = errorStatus(error);
    if (status === 403) return '본인이 받은 배송만 신청할 수 있습니다.';
    if (status === 404) return '배송 정보를 찾을 수 없습니다. 새로고침 후 다시 시도해 주세요.';
    if (status === 0) return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
    return error instanceof ApiError ? error.message : '신청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
