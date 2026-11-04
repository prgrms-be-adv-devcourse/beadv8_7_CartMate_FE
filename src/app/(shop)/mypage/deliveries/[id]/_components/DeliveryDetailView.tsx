'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetDeliveryDetails } from '@/api/generated/delivery-controller/delivery-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { errorStatus } from '../../../orders/_lib/orderView';
import DeliveryCard from '../../_components/DeliveryCard';

const CARD = 'bg-surface-container-lowest border border-outline-variant rounded p-space-md';
const OUTLINE_BUTTON =
    'h-10 px-space-md border border-outline-variant bg-surface-container-lowest hover:bg-surface-container font-label-md text-label-md text-on-surface rounded inline-flex items-center justify-center gap-space-xs transition-colors';

// 배송 한 건의 상세. 공동물품 공구 배송처럼 주문 상세가 따로 없는 배송도 여기서 조회 · 구매 확정한다.
export default function DeliveryDetailView() {
    const params = useParams<{ id: string }>();
    const deliveryId = Number(params.id);
    const validId = Number.isInteger(deliveryId) && deliveryId > 0;
    // DeliveryCard와 같은 쿼리라 요청은 한 번만 나간다. 여기서는 머리 · 오류 화면에만 쓴다.
    const query = useGetDeliveryDetails(deliveryId, { query: { enabled: validId, retry: (count, error) => errorStatus(error) === undefined && count < 2 } });
    const delivery = query.data?.data;

    if (!validId) return <Notice icon="search_off" title="배송을 찾을 수 없습니다" message="주소가 올바른지 확인해주세요." />;
    if (query.isPending) return <DeliveryDetailSkeleton />;
    if (!delivery) {
        const status = errorStatus(query.error);
        if (status === 404) return <Notice icon="search_off" title="배송을 찾을 수 없습니다" message="삭제되었거나 존재하지 않는 배송입니다." />;
        if (status === 403) return <Notice icon="lock" title="볼 수 없는 배송입니다" message="본인이 받는 배송만 볼 수 있습니다." />;
        return (
            <Notice icon="error" title="배송 정보를 불러오지 못했습니다" message={errorMessage(query.error, '잠시 후 다시 시도해주세요.')}>
                <button className={OUTLINE_BUTTON} type="button" onClick={() => void query.refetch()}>
                    다시 시도
                </button>
            </Notice>
        );
    }

    const shared = delivery.purchaseType === 'SHARED_GROUP';
    const orderLabel = delivery.orderNumber ?? (shared ? `공동 주문 #${delivery.orderId}` : `주문 #${delivery.orderId}`);

    return (
        <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">배송 #{deliveryId}</h1>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{orderLabel}</span>
            </div>

            <DeliveryCard deliveryId={deliveryId} title="배송 현황" showItems showReceiver />

            <div className="flex flex-col sm:flex-row gap-space-sm">
                <Link className={`${OUTLINE_BUTTON} flex-1`} href={ROUTES.deliveries}>
                    <Icon name="list" className="text-[18px]" />
                    배송 목록으로
                </Link>
                {!shared && delivery.orderId !== undefined && (
                    <Link className={`${OUTLINE_BUTTON} flex-1`} href={ROUTES.order(delivery.orderId)}>
                        <Icon name="receipt_long" className="text-[18px]" />
                        주문 상세 보기
                    </Link>
                )}
            </div>
        </div>
    );
}

function Notice({ icon, title, message, children }: { icon: string; title: string; message: string; children?: React.ReactNode }) {
    return (
        <div className={`${CARD} flex flex-col items-center text-center gap-space-sm py-space-xl`} role="alert">
            <Icon name={icon} className="text-[36px] text-outline" />
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{message}</p>
            <div className="flex gap-space-sm">
                {children}
                <Link className={OUTLINE_BUTTON} href={ROUTES.deliveries}>
                    배송 목록으로
                </Link>
            </div>
        </div>
    );
}

export function DeliveryDetailSkeleton() {
    return (
        <div className="flex flex-col gap-space-lg" aria-hidden>
            <div className="h-10 w-48 rounded bg-surface-container animate-pulse" />
            <div className="h-80 rounded bg-surface-container animate-pulse" />
        </div>
    );
}
