// 판매글 상태 표시 (목록·상세 공용)
export type PostStatus = 'ON_SALE' | 'PAUSED' | 'SUSPENDED' | 'CLOSED' | 'DELETED' | 'PENDING';

export const POST_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
    ON_SALE: {
        label: '판매 중',
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-primary bg-primary text-on-primary font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-surface-bright',
    },
    SUSPENDED: {
        label: '관리자 숨김',
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-error bg-error-container text-on-error-container font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-error',
    },
    PAUSED: {
        label: '판매자 내림',
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-outline-variant bg-surface-container text-secondary font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-outline',
    },
    CLOSED: {
        label: '판매 종료',
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-outline-variant bg-surface text-outline font-caption text-caption',
        dot: 'w-1.5 h-1.5 rounded-full bg-outline-variant',
    },
};

export function statusOf(status?: string) {
    return POST_STATUS[status ?? ''] ?? {
        label: status ?? '-',
        badge: 'inline-flex items-center px-space-sm py-0.5 rounded border border-outline-variant font-caption text-caption',
        dot: 'hidden',
    };
}

export const won = (n?: number | null) => (n == null ? '-' : `₩ ${n.toLocaleString('ko-KR')}`);