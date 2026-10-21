'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSellerDeliveriesQueryKey, useGetSellerDeliveries, useReadyDelivery, useShipDelivery } from '@/api/generated/delivery-controller/delivery-controller';
import { GetSellerDeliveriesStatus } from '@/api/generated/model';
import type { SellerDeliveryResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, formatPhone } from '@/lib/format';
import { readShippingStatus } from './ShippingStatusTabs';

const COURIERS = ['CJ대한통운', '우체국택배', '롯데택배'];

// BE 는 택배사·송장번호를 각각 50자까지 받는다.
const MAX_LENGTH = 50;

const BUTTON_CLASS = 'bg-primary text-on-primary hover:opacity-90 px-3 py-1 rounded text-caption font-label-md disabled:opacity-60 disabled:cursor-not-allowed';

const PAGE_SIZE = 20;
// 페이지 번호는 현재 페이지 앞뒤로 이만큼만 보여 준다.
const PAGE_WINDOW = 2;

const STATUS_LABEL: Record<string, string> = {
    REQUESTED: '배송요청',
    PREPARING: '배송준비',
    SHIPPING: '배송중',
    DELIVERED: '배송완료',
    CONFIRMED: '구매확정',
    CANCELED: '배송취소',
};

// URL 의 page 는 사람이 보는 1부터, BE 요청은 0부터다.
function readPage(raw: string | null): number {
    const page = Number(raw);
    return Number.isInteger(page) && page >= 1 ? page : 1;
}

function totalQuantity(delivery: SellerDeliveryResponse): number {
    return (delivery.items ?? []).reduce((sum, item) => sum + (item.quantity ?? 0), 0);
}

function DeliveryRow({ delivery }: { delivery: SellerDeliveryResponse }) {
    const queryClient = useQueryClient();
    const items = delivery.items ?? [];
    const address = [delivery.zipCode && `[${delivery.zipCode}]`, delivery.address, delivery.addressDetail].filter(Boolean).join(' ');
    // 이미 등록된 택배사가 고정 목록에 없어도 선택값으로 보이도록 목록에 더한다.
    const courierOptions = delivery.carrier && !COURIERS.includes(delivery.carrier) ? [...COURIERS, delivery.carrier] : COURIERS;

    const [carrier, setCarrier] = useState(delivery.carrier ?? '');
    const [trackingNumber, setTrackingNumber] = useState(delivery.trackingNumber ?? '');
    const [error, setError] = useState<string | null>(null);

    // 등록·출고에 성공하면 목록을 다시 조회한다. 상태가 바뀐 배송은 현재 탭에서 빠지고 다음 상태의 탭에 나타난다.
    function onSuccess() {
        setError(null);
        void queryClient.invalidateQueries({ queryKey: getGetSellerDeliveriesQueryKey() });
    }
    const ready = useReadyDelivery({ mutation: { onSuccess, onError: (e) => setError(errorMessage(e, '송장 등록에 실패했습니다.')) } });
    const ship = useShipDelivery({ mutation: { onSuccess, onError: (e) => setError(errorMessage(e, '출고 처리에 실패했습니다.')) } });
    const busy = ready.isPending || ship.isPending;
    // 송장은 배송 요청일 때만 입력한다. BE 는 이미 등록한 송장의 수정을 지원하지 않는다.
    const editable = delivery.status === GetSellerDeliveriesStatus.REQUESTED;
    const isPreparing = delivery.status === GetSellerDeliveriesStatus.PREPARING;

    function register() {
        const nextCarrier = carrier.trim();
        const nextTracking = trackingNumber.trim();
        if (!nextCarrier || !nextTracking) {
            setError('택배사와 송장번호를 입력해 주세요.');
            return;
        }
        if (nextCarrier.length > MAX_LENGTH || nextTracking.length > MAX_LENGTH) {
            setError(`택배사와 송장번호는 ${MAX_LENGTH}자 이하로 입력해 주세요.`);
            return;
        }
        setError(null);
        ready.mutate({ deliveryId: delivery.deliveryId!, data: { carrier: nextCarrier, trackingNumber: nextTracking } });
    }

    function shipOut() {
        if (!window.confirm('출고 처리할까요? 처리 후에는 되돌릴 수 없습니다.')) return;
        setError(null);
        ship.mutate({ deliveryId: delivery.deliveryId! });
    }

    return (
        <tr className="hover:bg-surface-container-low transition-colors">
            <td className="p-space-md text-center">
                <input className="rounded border-outline-variant" type="checkbox" />
            </td>
            <td className="p-space-md">
                {/* 공유 공동구매 배송과 이전에 만든 배송은 주문번호가 없어 주문 ID 로 대신한다. */}
                <div className="font-label-md text-primary">{delivery.orderNumber ?? `#${delivery.orderId ?? '-'}`}</div>
                <div className="text-caption text-on-surface-variant">{formatDateTime(delivery.createdAt)}</div>
            </td>
            <td className="p-space-md">
                {items.map((item) => (
                    <div key={item.deliveryItemId}>
                        <div className="font-label-md">{item.productName ?? '상품 정보 없음'}</div>
                        <div className="text-caption text-on-surface-variant">{(item.options ?? []).map((option) => `${option.optionName}: ${option.optionValue}`).join(' / ')}</div>
                    </div>
                ))}
            </td>
            <td className="p-space-md text-center font-label-md">{totalQuantity(delivery)}</td>
            <td className="p-space-md">
                <div className="font-label-md">{delivery.receiverName}</div>
                <div className="text-caption text-on-surface-variant">
                    {delivery.receiverPhone ? formatPhone(delivery.receiverPhone) : '-'}
                    <br />
                    {address}
                </div>
            </td>
            <td className="p-space-md text-center">
                <span className="inline-block px-2.5 py-1 rounded-full text-caption bg-surface-container-high text-on-surface font-label-md">{STATUS_LABEL[delivery.status ?? ''] ?? delivery.status}</span>
            </td>
            <td className="p-space-md">
                {/* 배송 요청: 송장 등록(ready) / 배송 준비: 출고(ship) / 그 이후: 비활성 */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <select
                            className="w-28 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface disabled:opacity-60"
                            value={carrier}
                            disabled={!editable || busy}
                            onChange={(e) => setCarrier(e.target.value)}
                        >
                            <option value="">택배사 선택</option>
                            {courierOptions.map((courier) => (
                                <option key={courier}>{courier}</option>
                            ))}
                        </select>
                        <input
                            className="flex-1 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface disabled:opacity-60"
                            placeholder="송장번호 입력"
                            type="text"
                            value={trackingNumber}
                            disabled={!editable || busy}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                    </div>
                    {/* 배송 중·완료 등 판매자가 더 할 일이 없는 행에는 버튼을 두지 않는다. */}
                    {(editable || isPreparing) && (
                        <div className="flex justify-end gap-1">
                            {editable ? (
                                <button className={BUTTON_CLASS} type="button" disabled={busy} onClick={register}>
                                    {ready.isPending ? '처리 중…' : '등록'}
                                </button>
                            ) : (
                                <button className={BUTTON_CLASS} type="button" disabled={busy} onClick={shipOut}>
                                    {ship.isPending ? '처리 중…' : '출고'}
                                </button>
                            )}
                        </div>
                    )}
                    {error && (
                        <p className="text-caption text-error text-right" role="alert">
                            {error}
                        </p>
                    )}
                </div>
            </td>
        </tr>
    );
}

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-space-sm p-space-lg" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-16 bg-surface-container-low animate-pulse rounded-lg" />
            ))}
        </div>
    );
}

// 판매자 배송 목록. 상태(status)와 페이지(page)는 URL 쿼리스트링에서 읽는다. (탭이 같은 쿼리를 바꾼다)
export default function ShippingList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const status = readShippingStatus(searchParams.get('status'));
    const page = readPage(searchParams.get('page'));

    const query = useGetSellerDeliveries({ status, page: page - 1, size: PAGE_SIZE });
    const result = query.data?.data;
    const rows = result?.content ?? [];
    const totalElements = result?.totalElements ?? 0;
    const totalPages = result?.totalPages ?? 0;
    const from = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = (page - 1) * PAGE_SIZE + rows.length;

    function goPage(next: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (next > 1) params.set('page', String(next));
        else params.delete('page');
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }

    const first = Math.max(1, page - PAGE_WINDOW);
    const last = Math.min(totalPages, page + PAGE_WINDOW);
    const pages = Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);

    return (
        <>
            {/* Order List Table Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
                <div className="px-space-lg py-space-md border-b border-surface-variant flex items-center justify-between">
                    <div className="font-headline-sm text-on-surface flex items-center gap-space-sm">
                        <span>주문 목록</span>
                        {result && <span className="text-caption bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full">총 {totalElements}건</span>}
                    </div>
                    <div className="text-body-sm text-on-surface-variant">
                        선택된 항목 <span className="font-label-md text-on-surface">0건</span>
                    </div>
                </div>
                {query.isPending ? (
                    <TableSkeleton />
                ) : query.isError ? (
                    <div className="p-space-xl flex flex-col items-center gap-space-sm text-center" role="alert">
                        <p className="font-body-md text-on-surface">{errorMessage(query.error, '배송 목록을 불러오지 못했습니다.')}</p>
                        <button
                            className="h-10 px-space-lg bg-surface-container-lowest border border-outline-variant font-label-md text-on-surface rounded hover:bg-surface-container"
                            type="button"
                            onClick={() => query.refetch()}
                        >
                            다시 시도
                        </button>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="p-space-xl flex flex-col items-center gap-space-xs text-center text-on-surface-variant">
                        <Icon name="inbox" className="text-[32px]" />
                        <p className="font-body-md">{totalElements > 0 ? '이 페이지에는 배송 건이 없습니다.' : '배송 건이 없습니다.'}</p>
                        {totalElements > 0 && (
                            <button className="mt-space-xs text-primary font-label-md underline" type="button" onClick={() => goPage(1)}>
                                첫 페이지로
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-surface-variant text-caption font-label-md text-on-surface-variant uppercase">
                                    <th className="p-space-md w-10 text-center">
                                        <input className="rounded border-outline-variant" type="checkbox" />
                                    </th>
                                    <th className="p-space-md">주문번호 / 일시</th>
                                    <th className="p-space-md">상품명 / 옵션</th>
                                    <th className="p-space-md text-center">수량</th>
                                    <th className="p-space-md">수령인 / 연락처</th>
                                    <th className="p-space-md text-center">배송상태</th>
                                    <th className="p-space-md">송장등록 입력</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-variant text-body-md text-on-surface">
                                {rows.map((delivery) => (
                                    // 행 안의 입력값·오류 상태를 상태나 송장 정보가 바뀌면 새로 시작하도록 key 에 포함한다.
                                    <DeliveryRow key={`${delivery.deliveryId}-${delivery.status}-${delivery.carrier ?? ''}-${delivery.trackingNumber ?? ''}`} delivery={delivery} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                <div className="p-space-md border-t border-surface-variant flex items-center justify-between">
                    <div className="text-body-sm text-on-surface-variant">
                        {from}-{to} of {totalElements} items
                    </div>
                    <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50" disabled={page <= 1} aria-label="이전 페이지" onClick={() => goPage(page - 1)}>
                            <Icon name="chevron_left" className="text-[16px]" />
                        </button>
                        {pages.map((n) => (
                            <button
                                key={n}
                                aria-current={n === page ? 'page' : undefined}
                                className={n === page ? 'w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-label-md' : 'w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low font-label-md'}
                                onClick={() => goPage(n)}
                            >
                                {n}
                            </button>
                        ))}
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50" disabled={totalPages === 0 || page >= totalPages} aria-label="다음 페이지" onClick={() => goPage(page + 1)}>
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
