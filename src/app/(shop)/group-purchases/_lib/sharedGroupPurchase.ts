import type { SharedGroupPurchaseDetailResponse, SharedGroupPurchaseSummaryResponseStatus } from '@/api/generated/model';
import { ROUTES } from '@/lib/routes';

type Status = SharedGroupPurchaseSummaryResponseStatus;

const STATUS_LABEL: Record<Status, string> = {
    OPEN: '모집 중',
    FROZEN: '마감 보류',
    CLOSED: '마감',
    CANCELED: '취소',
};

const BADGE_BASE = 'inline-flex items-center px-2 py-0.5 rounded font-caption text-caption font-bold';

// BE는 수정 마감이 지나도 스케줄러가 돌기 전까지 OPEN으로 두므로 editable로 한 번 더 나눈다.
export function statusLabel(status: Status | undefined, editable?: boolean): string {
    if (!status) return '-';
    if (status === 'OPEN' && editable === false) return '마감 처리 중';
    return STATUS_LABEL[status];
}

export function statusBadgeClass(status: Status | undefined, editable?: boolean): string {
    if (status === 'OPEN' && editable !== false) return `${BADGE_BASE} bg-primary text-on-primary`;
    if (status === 'FROZEN') return `${BADGE_BASE} bg-error-container text-on-error-container`;
    return `${BADGE_BASE} border border-outline-variant bg-surface-container text-on-surface-variant`;
}

// 참여 API는 초대 코드만 받는다. 경로의 id는 GP-3 초대 화면이 쓰는 기존 라우트를 따르기 위한 것이다.
export function inviteUrl(origin: string, id: number, inviteCode: string): string {
    return `${origin}${ROUTES.groupPurchaseInvite(id)}?code=${encodeURIComponent(inviteCode)}`;
}

type Detail = SharedGroupPurchaseDetailResponse;

// 품목 편집 권한. BE 규칙: 담기·수량 변경은 수정 기간(editable)에 참여자 누구나,
// 빼기·옵션 변경은 그에 더해 마감 보류(FROZEN) 중이면 만든 사람도 할 수 있다(구매 불가 상품 정리용).
// 상세는 참여자만 받을 수 있으므로 참여자 여부는 따로 보지 않는다.
export function itemPermissions(purchase: Detail, deadlinePassed: boolean) {
    const editable = purchase.editable === true && !deadlinePassed;
    const frozenByCreator = purchase.status === 'FROZEN' && purchase.viewerIsCreator === true;
    return { canAdd: editable, canChangeQuantity: editable, canRemove: editable || frozenByCreator };
}

// 참여자 한 명이 낼 예상 금액. BE가 총액을 인원 수로 나누고 나머지는 만든 사람 몫(creatorAmount)에 더해 준다.
export function memberAmount(purchase: Detail, creator: boolean | undefined): number {
    return (creator ? purchase.creatorAmount : purchase.perPersonAmount) ?? 0;
}

export function myAmount(purchase: Detail): number {
    return memberAmount(purchase, purchase.viewerIsCreator);
}

export function remainingText(ms: number): string {
    if (ms <= 0) return '마감됨';
    const minutes = Math.floor(ms / 60_000);
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 ${mins}분 남음`;
    return `${Math.max(1, mins)}분 남음`;
}

export const MAX_QUANTITY = 999;
