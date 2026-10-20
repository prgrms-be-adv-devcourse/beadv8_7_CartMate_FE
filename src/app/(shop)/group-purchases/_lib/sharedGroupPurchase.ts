import type { SharedGroupPurchaseSummaryResponseStatus } from '@/api/generated/model';
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
