import type { ReactNode } from 'react';
import type { SharedGroupPurchaseDetailResponse } from '@/api/generated/model';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { formatPrice } from '@/lib/salesPost';
import { myAmount, remainingText } from '../_lib/sharedGroupPurchase';

type Detail = SharedGroupPurchaseDetailResponse;

// 상세·공동 장바구니 화면이 같이 쓰는 현황 조각들

export function DetailSkeleton() {
    return (
        <div className="flex flex-col gap-space-md" aria-hidden>
            <div className="h-32 bg-surface-container-low animate-pulse rounded-xl" />
            <div className="h-64 bg-surface-container-low animate-pulse rounded-xl" />
        </div>
    );
}

// 공동구매 상태별 안내. 진행 중인데 마감 시각이 지났으면 스케줄러가 마감 처리하기 전이다.
export function StateBanner({ purchase, deadlinePassed }: { purchase: Detail; deadlinePassed: boolean }) {
    const editable = purchase.editable === true && !deadlinePassed;
    let icon = 'info';
    let message: ReactNode;
    let tone = 'bg-surface-container-high';
    if (purchase.status === 'OPEN' && editable) {
        message = '수정 마감 전까지 참여자 누구나 상품을 담고 수량을 바꾸거나 뺄 수 있습니다. 마감되면 공동 주문이 만들어집니다.';
    } else if (purchase.status === 'OPEN') {
        icon = 'schedule';
        message = '수정 기한이 지나 더 이상 품목을 바꿀 수 없습니다. 곧 자동으로 마감됩니다.';
    } else if (purchase.status === 'FROZEN') {
        icon = 'warning';
        tone = 'bg-error-container/40';
        message = purchase.viewerIsCreator
            ? '구매할 수 없는 상품이 있어 마감이 보류되었습니다. 해당 상품을 빼면 마감할 수 있습니다. 보류 후 24시간이 지나면 그 상품을 빼고 자동 마감됩니다.'
            : '구매할 수 없는 상품이 있어 마감이 보류되었습니다. 만든 사람이 정리하거나, 보류 후 24시간이 지나면 그 상품을 빼고 자동 마감됩니다.';
    } else if (purchase.status === 'CLOSED') {
        icon = 'check_circle';
        message = `${formatDateTime(purchase.closedAt)}에 마감되어 공동 주문이 만들어졌습니다. 품목은 더 이상 바꿀 수 없습니다.`;
    } else {
        icon = 'block';
        message = `${formatDateTime(purchase.closedAt)}에 취소된 공동구매입니다.`;
    }
    return (
        <div className={`w-full ${tone} rounded-lg p-space-md shadow-sm flex items-start gap-space-sm`} role="status">
            <Icon name={icon} className="text-primary text-[22px] flex-shrink-0" />
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
        </div>
    );
}

// 수정 마감 시각과 남은 시간
export function DeadlineBox({ purchase, remainingMs }: { purchase: Detail; remainingMs: number | null }) {
    const counting = purchase.status === 'OPEN' && remainingMs !== null;
    return (
        <div className="p-space-md rounded-lg bg-surface-container text-center">
            <span className="font-caption text-caption text-secondary block mb-1">수정 마감까지</span>
            <span className="block font-headline-md text-headline-md text-primary font-bold tracking-tight">
                {counting ? remainingText(remainingMs) : '수정 마감'}
            </span>
            <p className="font-caption text-caption text-secondary mt-1">마감 일시: {formatDateTime(purchase.editDeadlineAt)}</p>
        </div>
    );
}

// 참여 인원 / 최대 인원
export function ParticipantProgress({ purchase }: { purchase: Detail }) {
    const count = purchase.participantCount ?? 0;
    const max = purchase.maxParticipants ?? 0;
    const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-primary font-semibold">현재 참여 인원</span>
                <span className="font-label-md text-label-md text-primary font-bold">
                    {count}명 <span className="text-secondary font-body-sm text-body-sm">/ 최대 {max}명</span>
                </span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

// N빵 금액 요약. 모두 BE가 계산한 값이다(구매 불가 상품은 합계에서 빠짐).
export function AmountSummary({ purchase }: { purchase: Detail }) {
    const items = purchase.items ?? [];
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    return (
        <div className="space-y-space-sm">
            <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                <span>담긴 상품</span>
                <span>
                    {items.length}종 · {totalQuantity}개
                </span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                <span>전체 합계</span>
                <span className="text-on-surface font-semibold">{formatPrice(purchase.totalPrice ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                <span>1인당 ({purchase.participantCount ?? 0}명)</span>
                <span className="text-on-surface">{formatPrice(purchase.perPersonAmount ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                <span>만든 사람 부담</span>
                <span className="text-on-surface">{formatPrice(purchase.creatorAmount ?? 0)}</span>
            </div>
            <div className="h-[1px] bg-surface-variant my-1" />
            <div className="flex items-center justify-between font-body-lg text-body-lg text-primary font-bold">
                <span>내 예상 결제액</span>
                <span className="text-headline-sm">{formatPrice(myAmount(purchase))}</span>
            </div>
            <p className="font-caption text-caption text-secondary">
                총액을 참여 인원 수로 나누고, 나누어떨어지지 않는 금액은 만든 사람이 부담합니다. 인원이나 품목이 바뀌면 금액도 바뀝니다.
            </p>
        </div>
    );
}

// BE가 아직 지원하지 않거나 다른 작업 범위인 기능 버튼
export function ComingSoonButton({ icon, label, className }: { icon: string; label: string; className?: string }) {
    return (
        <button
            className={`h-11 px-space-md rounded bg-surface-container text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ''}`}
            type="button"
            disabled
            title="준비 중인 기능입니다."
        >
            <Icon name={icon} className="text-[18px]" />
            <span>{label}</span>
            <span className="font-caption text-caption">(준비 중)</span>
        </button>
    );
}
