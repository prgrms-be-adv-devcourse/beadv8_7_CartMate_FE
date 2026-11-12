'use client';

import { useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { useGetMyDeliveries } from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { formatDate, KIND_LABEL } from '../../orders/_lib/orderView';
import { deliveryStatus, TRACK_STEPS, trackIndex } from '../_lib/deliveryView';

const PAGE_SIZE = 10;
const TONE_VARIANT = { pending: 'warning', done: 'success', muted: 'neutral' } as const;
const PAGE_BUTTON =
    'h-9 px-3 border border-outline-variant bg-surface text-on-surface rounded font-label-sm text-label-sm inline-flex items-center gap-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container';

// 내 배송 목록(GET /api/deliveries/me). BE가 최신순 페이지로 준다.
export default function DeliveryList() {
    const [page, setPage] = useState(0);
    const query = useGetMyDeliveries({ page, size: PAGE_SIZE }, { query: { placeholderData: (prev) => prev } });
    const data = query.data?.data;
    const rows = (data?.content ?? []).filter((row) => row.deliveryId !== undefined);
    const totalPages = data?.totalPages ?? 0;

    if (query.isPending) {
        return (
            <div className="flex flex-col gap-space-sm" aria-hidden>
                {[0, 1, 2].map((n) => (
                    <div key={n} className="h-28 rounded bg-surface-container animate-pulse" />
                ))}
            </div>
        );
    }

    if (query.isError && !data) {
        return (
            <EmptyState
                title="배송 목록을 불러오지 못했습니다"
                description={errorMessage(query.error, '잠시 후 다시 시도해주세요.')}
                actions={<Button label="다시 시도" variant="secondary" onClick={() => void query.refetch()} />}
            />
        );
    }

    if (rows.length === 0 && page === 0) {
        return (
            <EmptyState
                title="배송 중인 상품이 없습니다"
                description="결제가 끝난 주문은 판매자별 배송으로 만들어져 여기에 표시됩니다."
                actions={<Button label="주문 내역 보기" variant="secondary" href={ROUTES.orders} />}
            />
        );
    }

    return (
        <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                <span>총 {data?.totalElements ?? rows.length}건</span>
                {query.isFetching && <span className="font-caption text-caption text-outline">새로 고치는 중...</span>}
            </div>

            <div className="flex flex-col gap-space-sm">
                {rows.map((row) => (
                    <DeliveryRow key={row.deliveryId} row={row} />
                ))}
            </div>

            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-space-sm" aria-label="배송 목록 페이지">
                    <button className={PAGE_BUTTON} type="button" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                        <Icon name="chevron_left" className="text-[18px]" />
                        이전
                    </button>
                    <span className="font-label-sm text-label-sm text-on-surface tabular-nums">
                        {page + 1} / {totalPages}
                    </span>
                    <button className={PAGE_BUTTON} type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        다음
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </nav>
            )}
        </div>
    );
}

function DeliveryRow({ row }: { row: DeliveryResponse }) {
    const status = deliveryStatus(row.status);
    const step = trackIndex(row.status);
    const shared = row.purchaseType === 'SHARED_GROUP';
    // 주문번호가 없는 배송(공동물품 공구 · 예전에 만든 배송)은 주문 id로 보여 준다.
    const orderLabel = row.orderNumber ?? (shared ? `공동 주문 #${row.orderId}` : `주문 #${row.orderId}`);

    return (
        <Card padding={3} className="flex flex-col gap-3" data-delivery-id={row.deliveryId}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                <div className="flex flex-wrap items-center gap-space-sm min-w-0">
                    <Badge label={status.label} variant={TONE_VARIANT[status.tone]} />
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate">{orderLabel}</span>
                    <Badge label={shared ? KIND_LABEL.SHARED_GROUP : '개인 주문'} variant={shared ? 'purple' : 'neutral'} />
                </div>
                <span className="font-caption text-caption text-outline">배송 요청 {formatDate(row.createdAt)}</span>
            </div>

            {/* 진행 막대: 배송 요청 → 구매 확정 5단계 */}
            {row.status !== 'CANCELED' && (
                <div className="flex gap-1" aria-label={step >= 0 ? `${TRACK_STEPS.length}단계 중 ${step + 1}단계 · ${status.label}` : status.label} role="img">
                    {TRACK_STEPS.map((s, index) => (
                        <span key={s.status} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    ))}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {row.trackingNumber ? (
                        <>
                            <span className="text-on-surface font-bold">{row.carrier}</span> <span className="tabular-nums">{row.trackingNumber}</span>
                        </>
                    ) : (
                        '송장 등록 전'
                    )}
                    <span className="text-outline"> · 받는 분 {row.receiverName}</span>
                </div>
                <div className="flex gap-space-xs">
                    {!shared && row.orderId !== undefined && (
                        <Button label="주문 상세" variant="secondary" size="sm" href={ROUTES.order(row.orderId)} />
                    )}
                    <Button label={row.status === 'DELIVERED' ? '구매 확정하기' : '배송 조회'} variant="primary" size="sm" href={ROUTES.delivery(row.deliveryId as number)} endContent={<Icon name="chevron_right" className="text-[16px]" />} />
                </div>
            </div>
        </Card>
    );
}
