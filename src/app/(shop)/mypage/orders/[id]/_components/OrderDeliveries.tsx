'use client';

import Link from 'next/link';
import { useGetDeliveriesByOrder } from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import DeliveryCard from '../../../deliveries/_components/DeliveryCard';
import { deliveryStatus, TRACK_STEPS, trackIndex } from '../../../deliveries/_lib/deliveryView';

const CARD = 'bg-surface-container-lowest border border-outline-variant rounded p-space-md';
const OUTLINE_BUTTON =
    'h-10 px-space-md border border-outline-variant bg-surface-container-lowest hover:bg-surface-container font-label-md text-label-md text-on-surface rounded inline-flex items-center justify-center gap-space-xs transition-colors';

// 개인 주문(일반 · 개인물품 공구)의 배송. BE는 두 주문 모두 배송 유형을 INDIVIDUAL_GROUP으로 저장한다(DeliveryOrderEventListener).
const ORDER_PURCHASE_TYPE = 'INDIVIDUAL_GROUP' as const;

export function useOrderDeliveries(orderId: number, enabled: boolean) {
    return useGetDeliveriesByOrder({ orderId, purchaseType: ORDER_PURCHASE_TYPE }, { query: { enabled } });
}

// 주문 진행 단계의 마지막 칸에 쓸 배송 요약. 판매자별로 나뉜 배송 중 가장 덜 진행된 건을 기준으로 한다.
export function summarizeDeliveries(deliveries: DeliveryResponse[] | undefined): { label: string; done: boolean } | null {
    const active = (deliveries ?? []).filter((delivery) => delivery.status !== 'CANCELED');
    if (active.length === 0) return null;
    const slowest = active.reduce((min, delivery) => (trackIndex(delivery.status) < trackIndex(min.status) ? delivery : min));
    const label = deliveryStatus(slowest.status).label;
    const done = trackIndex(slowest.status) === TRACK_STEPS.length - 1;
    return { label: active.length > 1 && !done ? `${label} 외 ${active.length - 1}건` : label, done };
}

// 주문 상세의 배송 영역. 결제가 끝난 주문만 배송이 생긴다(결제 완료 시 판매자별로 생성).
export default function OrderDeliveries({ orderId }: { orderId: number }) {
    const query = useOrderDeliveries(orderId, true);
    const deliveries = (query.data?.data ?? []).filter((delivery) => delivery.deliveryId !== undefined);

    return (
        <section className="flex flex-col gap-space-sm" aria-label="배송 조회">
            <div className="flex items-center justify-between gap-space-sm">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">배송 조회</h2>
                <Link className="font-label-sm text-label-sm text-primary hover:underline inline-flex items-center gap-0.5" href={ROUTES.deliveries}>
                    전체 배송 목록
                    <Icon name="chevron_right" className="text-[16px]" />
                </Link>
            </div>

            {query.isPending ? (
                <div className="h-56 rounded bg-surface-container animate-pulse" aria-hidden />
            ) : query.isError ? (
                <div className={`${CARD} flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm`} role="alert">
                    <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                        <Icon name="error" className="text-[20px] text-outline" />
                        {errorMessage(query.error, '배송 정보를 불러오지 못했습니다.')}
                    </div>
                    <button className={OUTLINE_BUTTON} type="button" onClick={() => void query.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : deliveries.length === 0 ? (
                <div className={`${CARD} flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant`} role="status">
                    <Icon name="hourglass_empty" className="text-[20px] text-outline" />
                    배송 정보를 준비하고 있습니다. 잠시 후 다시 확인해 주세요.
                </div>
            ) : (
                <>
                    {deliveries.length > 1 && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">판매자별로 {deliveries.length}건으로 나뉘어 배송됩니다.</p>
                    )}
                    {deliveries.map((delivery, index) => (
                        <DeliveryCard
                            key={delivery.deliveryId}
                            deliveryId={delivery.deliveryId as number}
                            title={deliveries.length > 1 ? `배송 ${index + 1} / ${deliveries.length}` : '배송 현황'}
                            showItems={deliveries.length > 1}
                        />
                    ))}
                </>
            )}
        </section>
    );
}
