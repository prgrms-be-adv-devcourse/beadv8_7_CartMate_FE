'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import Icon from '@/components/ui/Icon';
import {
    getGetSellerDeliveriesQueryKey,
    getGetSellerDeliveriesQueryOptions,
    useGetSellerDeliveries,
} from '@/api/generated/delivery-controller/delivery-controller';
import { formatDateTime } from '@/lib/format';
import DeliveryActions, { type ActionResult } from './DeliveryActions';
import DeliveryDetailModal from './DeliveryDetailModal';
import ShippingStatusTabs from './ShippingStatusTabs';
import {
    STATUS_BADGE,
    STATUS_LABEL,
    STATUS_TABS,
    fullAddress,
    isDeliveryStatus,
    itemsOf,
    loadErrorMessage,
    optionText,
    type DeliveryStatus,
} from './delivery';

const PAGE_SIZE = 10;
const PREPARING_SOON = '준비 중인 기능입니다';

export default function ShippingContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // 탭과 페이지는 주소에 남겨 새로고침·뒤로 가기에도 유지한다.
    const statusParam = searchParams.get('status');
    const status: DeliveryStatus = isDeliveryStatus(statusParam) ? statusParam : 'REQUESTED';
    const page = Math.max(0, Math.trunc(Number(searchParams.get('page') ?? 1)) - 1) || 0;

    const [result, setResult] = useState<ActionResult | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);

    const navigate = (next: { status?: DeliveryStatus; page?: number }) => {
        const params = new URLSearchParams();
        params.set('status', next.status ?? status);
        const nextPage = next.page ?? 0;
        if (nextPage > 0) params.set('page', String(nextPage + 1));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 상태별 건수. BE에 건수 API가 없어 상태마다 한 건짜리 페이지를 받아 totalElements를 쓴다.
    const countQueries = useQueries({
        queries: STATUS_TABS.map((tab) => getGetSellerDeliveriesQueryOptions({ status: tab.status, size: 1 })),
    });
    const counts: Partial<Record<DeliveryStatus, number>> = {};
    STATUS_TABS.forEach((tab, i) => {
        const total = countQueries[i].data?.data?.totalElements;
        if (total !== undefined) counts[tab.status] = total;
    });

    const list = useGetSellerDeliveries({ status, page, size: PAGE_SIZE });
    const pageData = list.data?.data;
    const deliveries = pageData?.content ?? [];
    const totalElements = pageData?.totalElements ?? 0;
    const totalPages = pageData?.totalPages ?? 0;

    // 처리 결과를 보여 주고, 성공했거나 상태가 이미 바뀐 경우 목록·건수·상세를 다시 받는다.
    const handleResult = useCallback(
        (next: ActionResult) => {
            setResult(next);
            if (next.ok || next.stale) {
                void queryClient.invalidateQueries({ queryKey: getGetSellerDeliveriesQueryKey() });
                void queryClient.invalidateQueries({ predicate: (q) => /^\/api\/deliveries\/\d+$/.test(String(q.queryKey[0])) });
            }
        },
        [queryClient],
    );

    // 처리 후 마지막 페이지가 비면 앞 페이지로 옮긴다.
    const overflowPage = pageData && deliveries.length === 0 && page > 0 && page >= totalPages ? Math.max(0, totalPages - 1) : null;
    useEffect(() => {
        if (overflowPage === null) return;
        const params = new URLSearchParams({ status });
        if (overflowPage > 0) params.set('page', String(overflowPage + 1));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [overflowPage, status, pathname, router]);

    const rangeStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = page * PAGE_SIZE + deliveries.length;
    const activeLabel = STATUS_TABS.find((t) => t.status === status)?.label ?? '';

    return (
        <>
            {/* 처리 결과 안내 */}
            {result && (
                <div
                    role={result.ok ? 'status' : 'alert'}
                    className={`sticky top-20 z-30 mb-space-lg rounded-xl px-space-lg py-space-md shadow-md flex items-start justify-between gap-space-md ${result.ok ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}
                >
                    <div className="flex items-start gap-space-sm">
                        <Icon name={result.ok ? 'check_circle' : 'error'} className="text-[20px]" />
                        <span className="text-body-md">{result.message}</span>
                    </div>
                    <button type="button" onClick={() => setResult(null)} aria-label="안내 닫기" className="opacity-70 hover:opacity-100">
                        <Icon name="close" className="text-[18px]" />
                    </button>
                </div>
            )}

            {/* 상태 탭 · 검색 조건 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-xl flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-surface-variant pb-space-md">
                    <ShippingStatusTabs
                        active={status}
                        counts={counts}
                        onChange={(next) => {
                            setResult(null);
                            navigate({ status: next, page: 0 });
                        }}
                    />
                    <div className="flex items-center gap-space-sm">
                        <span className="text-body-sm text-on-surface-variant">정렬:</span>
                        <select
                            aria-label="정렬"
                            disabled
                            title={PREPARING_SOON}
                            className="bg-surface border border-outline-variant rounded-lg px-space-sm py-1.5 text-body-sm text-on-surface disabled:opacity-60"
                        >
                            <option>최신 요청순</option>
                        </select>
                    </div>
                </div>
                {/* BE가 검색·기간·택배사 필터를 지원하지 않아 비활성으로 둔다. */}
                <fieldset disabled title={PREPARING_SOON} className="grid grid-cols-1 md:grid-cols-4 gap-space-md items-end opacity-60">
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">검색 기간</label>
                        <div className="flex items-center gap-space-xs">
                            <input className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" type="date" aria-label="시작일" />
                            <span className="text-on-surface-variant">~</span>
                            <input className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" type="date" aria-label="종료일" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">검색어</label>
                        <div className="relative">
                            <input className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-space-sm py-2 text-body-sm text-on-surface" placeholder="주문번호, 상품명, 수령인 검색" type="text" />
                            <Icon name="search" className="absolute left-2.5 top-2.5 text-outline text-[18px]" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">택배사 선택</label>
                        <select className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" defaultValue="">
                            <option value="">전체 택배사</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button type="button" className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md">
                            검색 (준비 중)
                        </button>
                    </div>
                </fieldset>
            </div>

            {/* 배송 목록 */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
                <div className="px-space-lg py-space-md border-b border-surface-variant flex items-center justify-between">
                    <div className="font-headline-sm text-on-surface flex items-center gap-space-sm">
                        <span>{activeLabel} 목록</span>
                        {pageData && <span className="text-caption bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full">총 {totalElements}건</span>}
                    </div>
                    {list.isFetching && !list.isPending && <span className="text-body-sm text-on-surface-variant">새로 불러오는 중...</span>}
                </div>

                {list.isPending ? (
                    <p className="p-space-xl text-center text-on-surface-variant">배송 목록을 불러오는 중...</p>
                ) : list.isError ? (
                    <div className="p-space-xl flex flex-col items-center gap-space-sm text-center">
                        <Icon name="error" className="text-error text-[32px]" />
                        <p className="text-on-surface">{loadErrorMessage(list.error)}</p>
                        <button
                            type="button"
                            onClick={() => list.refetch()}
                            disabled={list.isFetching}
                            className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-space-md py-1.5 rounded-lg font-label-md disabled:opacity-50"
                        >
                            다시 시도
                        </button>
                    </div>
                ) : deliveries.length === 0 ? (
                    <div className="p-space-xl flex flex-col items-center gap-space-sm text-center text-on-surface-variant">
                        <Icon name="inventory_2" className="text-[32px]" />
                        <p>{activeLabel} 상태의 배송이 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low border-b border-surface-variant text-caption font-label-md text-on-surface-variant">
                                    <th className="p-space-md">주문 / 요청 일시</th>
                                    <th className="p-space-md min-w-[200px]">상품 / 옵션 · 수량</th>
                                    <th className="p-space-md min-w-[200px]">수령인 / 배송지</th>
                                    <th className="p-space-md text-center">배송상태</th>
                                    <th className="p-space-md">{status === 'REQUESTED' ? '송장 등록' : status === 'PREPARING' ? '송장 · 발송' : '송장'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-variant text-body-md text-on-surface">
                                {deliveries.map((delivery) => (
                                    <tr key={delivery.deliveryId} className="align-top hover:bg-surface-container-low transition-colors">
                                        <td className="p-space-md whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setDetailId(delivery.deliveryId!)}
                                                className="font-label-md text-primary hover:underline text-left"
                                            >
                                                주문 #{delivery.orderId}
                                            </button>
                                            <div className="text-caption text-on-surface-variant">배송 #{delivery.deliveryId}</div>
                                            <div className="text-caption text-on-surface-variant">{formatDateTime(delivery.createdAt)}</div>
                                        </td>
                                        <td className="p-space-md">
                                            <ul className="flex flex-col gap-1">
                                                {itemsOf(delivery).map((item) => (
                                                    <li key={item.deliveryItemId}>
                                                        <span className="font-label-md">{item.productName ?? `상품 #${item.orderItemId ?? item.deliveryItemId}`}</span>
                                                        <span className="text-on-surface-variant"> × {item.quantity}</span>
                                                        {optionText(item) && <div className="text-caption text-on-surface-variant">{optionText(item)}</div>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-space-md">
                                            <div className="font-label-md">{delivery.receiverName}</div>
                                            <div className="text-caption text-on-surface-variant">
                                                {delivery.receiverPhone}
                                                <br />
                                                {fullAddress(delivery)}
                                            </div>
                                        </td>
                                        <td className="p-space-md text-center whitespace-nowrap">
                                            {delivery.status && (
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-caption font-label-md ${STATUS_BADGE[delivery.status] ?? STATUS_BADGE.REQUESTED}`}>
                                                    {STATUS_LABEL[delivery.status] ?? delivery.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-space-md">
                                            <DeliveryActions delivery={delivery} onResult={handleResult} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 페이지 이동 */}
                {pageData && totalPages > 1 && (
                    <div className="p-space-md border-t border-surface-variant flex items-center justify-between">
                        <div className="text-body-sm text-on-surface-variant">
                            {rangeStart}-{rangeEnd} / 총 {totalElements}건
                        </div>
                        <div className="flex flex-wrap items-center gap-space-xs">
                            <button
                                type="button"
                                aria-label="이전 페이지"
                                onClick={() => navigate({ page: page - 1 })}
                                disabled={page === 0}
                                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                            >
                                <Icon name="chevron_left" className="text-[16px]" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-current={i === page ? 'page' : undefined}
                                    onClick={() => navigate({ page: i })}
                                    className={`w-8 h-8 rounded flex items-center justify-center font-label-md ${i === page ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                aria-label="다음 페이지"
                                onClick={() => navigate({ page: page + 1 })}
                                disabled={page >= totalPages - 1}
                                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50"
                            >
                                <Icon name="chevron_right" className="text-[16px]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {detailId !== null && <DeliveryDetailModal deliveryId={detailId} onClose={() => setDetailId(null)} />}
        </>
    );
}
