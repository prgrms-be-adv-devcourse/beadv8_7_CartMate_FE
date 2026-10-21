import type { GetSellerClaimsClaimType, GetSellerClaimsStatusItem } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';

// 판매자 교환·환불 관리 화면의 탭·라벨·오류 문구.

export type ClaimTab = 'pending' | 'completed' | 'rejected' | 'all';

// 처리 대기 탭은 승인 전(REQUESTED)과 승인 후 완료 전(APPROVED)을 함께 보여 준다(BE ClaimController 주석과 같은 기준).
export const CLAIM_TABS: { tab: ClaimTab; label: string; status?: GetSellerClaimsStatusItem[] }[] = [
    { tab: 'pending', label: '처리 대기', status: ['REQUESTED', 'APPROVED'] },
    { tab: 'completed', label: '처리 완료', status: ['COMPLETED'] },
    { tab: 'rejected', label: '거절', status: ['REJECTED'] },
    { tab: 'all', label: '전체' },
];

export function isClaimTab(value: string | null): value is ClaimTab {
    return CLAIM_TABS.some((t) => t.tab === value);
}

export function isClaimType(value: string | null): value is GetSellerClaimsClaimType {
    return value === 'EXCHANGE' || value === 'REFUND';
}

export const TYPE_LABEL: Record<string, string> = { EXCHANGE: '교환', REFUND: '환불' };

export const REASON_LABEL: Record<string, string> = {
    SIZE_MISMATCH: '사이즈 불일치',
    SIMPLE_CHANGE: '단순 변심',
    PRODUCT_DEFECT: '상품 불량 · 파손',
    WRONG_DELIVERY: '오배송 · 누락',
    OTHER: '기타',
};

export const STATUS_LABEL: Record<string, string> = {
    REQUESTED: '승인 대기',
    APPROVED: '승인됨 · 완료 대기',
    COMPLETED: '처리 완료',
    REJECTED: '거절',
};

export const STATUS_BADGE: Record<string, string> = {
    REQUESTED: 'bg-primary-fixed text-on-primary-fixed',
    APPROVED: 'bg-secondary-container text-on-secondary-container',
    COMPLETED: 'bg-surface-container-high text-on-surface-variant',
    REJECTED: 'bg-surface border border-outline-variant text-outline',
};

export type ActionResult = { ok: boolean; message: string; stale?: boolean };

function hasCode(error: unknown, code: string): boolean {
    return error instanceof ApiError && (error.resultCode?.endsWith(code) ?? false);
}

// 승인 · 완료 실패 안내. stale이면 다른 곳에서 먼저 바뀐 것이라 목록을 다시 받는다.
export function claimActionError(error: unknown): { message: string; stale?: boolean } {
    if (hasCode(error, 'DELIVERY_CLAIM_INVALID_STATUS')) return { message: '이미 다른 상태로 바뀐 요청입니다. 목록을 새로 고쳤습니다.', stale: true };
    if (hasCode(error, 'DELIVERY_CLAIM_NOT_FOUND')) return { message: '요청을 찾을 수 없습니다. 목록을 새로 고쳤습니다.', stale: true };
    if (hasCode(error, 'PAYMENT_REFUND_NOT_ALLOWED')) return { message: '공동물품 공구 주문은 구매 확정 후 환불할 수 없어 승인할 수 없습니다.' };
    if (hasCode(error, 'PAYMENT_REFUND_EXCEEDS_REMAINING')) return { message: '환불 가능한 금액을 넘는 요청이라 승인할 수 없습니다. 이미 환불된 주문인지 확인해 주세요.' };
    if (hasCode(error, 'PAYMENT_REFUND_IN_PROGRESS')) return { message: '환불을 처리하지 못해 승인되지 않았습니다. 잠시 후 다시 시도해 주세요. (이미 처리 중인 환불)' };
    if (hasCode(error, 'PAYMENT_NOT_FOUND')) return { message: '이 주문의 결제 정보를 찾을 수 없어 환불할 수 없습니다.' };
    if (error instanceof ApiError) {
        if (error.status === 403) return { message: '내 상품의 요청만 처리할 수 있습니다.' };
        if (error.status === 401) return { message: '로그인이 만료되었습니다. 다시 로그인해 주세요.' };
        if (error.status === 0) return { message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' };
    }
    // 정산이 끝난 결제 등 지갑에서 거절한 경우는 BE 메시지를 그대로 보여 준다.
    return { message: errorMessage(error, '처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.') };
}

export function loadErrorMessage(error: unknown): string {
    if (hasCode(error, 'DELIVERY_SELLER_ONLY')) return '판매자 정보가 등록되지 않은 계정이라 교환 · 환불 요청을 조회할 수 없습니다.';
    if (error instanceof ApiError && error.status === 403) return '교환 · 환불 요청을 조회할 권한이 없습니다.';
    return errorMessage(error, '교환 · 환불 요청을 불러오지 못했습니다.');
}
