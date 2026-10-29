// 공지 구분 표시 (관리자·사용자 화면 공용)
export type NoticeCategory = 'NOTICE' | 'GUIDE' | 'EVENT' | 'URGENT';

export const NOTICE_CATEGORIES: { value: NoticeCategory; label: string; description: string }[] = [
    { value: 'NOTICE', label: '공지', description: '일반 공지' },
    { value: 'GUIDE', label: '안내', description: '서비스 점검·기능 안내' },
    { value: 'EVENT', label: '이벤트', description: '프로모션·혜택' },
    { value: 'URGENT', label: '긴급', description: '장애·비상 안내' },
];

const BADGE: Record<NoticeCategory, string> = {
    NOTICE: 'bg-primary text-on-primary',
    GUIDE: 'bg-surface-container-high text-on-surface',
    EVENT: 'bg-tertiary-container text-on-tertiary-container',
    URGENT: 'bg-error text-on-error',
};

export function noticeCategoryLabel(category?: string): string {
    return NOTICE_CATEGORIES.find((c) => c.value === category)?.label ?? '공지';
}

export function noticeBadgeClass(category?: string): string {
    const color = BADGE[(category ?? 'NOTICE') as NoticeCategory] ?? BADGE.NOTICE;
    return `inline-flex items-center px-space-sm py-0.5 rounded font-caption text-caption font-semibold ${color}`;
}