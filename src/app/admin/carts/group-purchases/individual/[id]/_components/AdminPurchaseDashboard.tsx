'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetDashboard1QueryKey,
    useClose2,
    useGetDashboard1,
} from '@/api/generated/admin-individual-group-purchase-controller/admin-individual-group-purchase-controller';
import { ApiError, errorMessage } from '@/api/http';
import { formatDateTime } from '@/lib/format';
import { formatPrice } from '@/lib/salesPost';

export default function AdminPurchaseDashboard({ id }: { id: string }) {
    const purchaseId = Number(id);
    const validId = Number.isSafeInteger(purchaseId) && purchaseId > 0;
    const queryClient = useQueryClient();
    const [confirming, setConfirming] = useState(false);
    const dashboard = useGetDashboard1(purchaseId, { query: { enabled: validId, staleTime: 0 } });
    const close = useClose2({
        mutation: {
            onSuccess: async () => {
                setConfirming(false);
                await queryClient.invalidateQueries({ queryKey: getGetDashboard1QueryKey(purchaseId) });
            },
        },
    });

    if (!validId) return <p role="alert">올바르지 않은 공동구매 번호입니다.</p>;
    if (dashboard.isPending) return <p role="status">현황을 불러오는 중입니다…</p>;
    const status = dashboard.error instanceof ApiError ? dashboard.error.status : undefined;
    if (dashboard.isError || !dashboard.data?.data) {
        const message = status === 404 ? '공동구매를 찾을 수 없습니다.'
            : status === 403 ? '관리자 권한이 필요합니다.'
                : errorMessage(dashboard.error, '현황을 불러오지 못했습니다.');
        return (
            <div className="border border-outline-variant bg-surface-container-lowest rounded p-space-lg" role="alert">
                <p>{message}</p>
                {status !== 403 && status !== 404 && <button className="text-primary underline mt-space-sm" type="button" onClick={() => void dashboard.refetch()}>다시 시도</button>}
            </div>
        );
    }

    const data = dashboard.data.data;
    const isOpen = data.status === 'OPEN';
    const statusLabel = !isOpen ? '마감됨' : data.open ? '진행 중' : '마감 기한 경과 · 종료 처리 전';
    return (
        <div className="flex flex-col gap-space-lg">
            <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                <div className="flex flex-wrap items-start justify-between gap-space-md">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">{data.title ?? `공동구매 #${purchaseId}`}</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">번호 #{purchaseId} · {statusLabel}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">마감 예정 {formatDateTime(data.deadlineAt)}</p>
                        {data.closedAt && <p className="font-body-sm text-body-sm text-on-surface-variant">실제 마감 {formatDateTime(data.closedAt)}</p>}
                    </div>
                    <button className="h-9 px-space-md border border-outline-variant rounded disabled:opacity-50" type="button" disabled={dashboard.isFetching} onClick={() => void dashboard.refetch()}>
                        {dashboard.isFetching ? '새로고침 중…' : '새로고침'}
                    </button>
                </div>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                    <Stat label="결제 완료 주문" value={`${data.orderCount ?? 0}건`} />
                    <Stat label="구매자" value={`${data.buyerCount ?? 0}명`} />
                    <Stat label="총 수량" value={`${data.totalQuantity ?? 0}개`} />
                    <Stat label="총 결제 금액" value={formatPrice(data.totalAmount ?? 0)} />
                </dl>
                <p className="font-caption text-caption text-secondary">결제가 끝난 주문만 집계합니다.</p>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">상품별 현황</h2>
                {data.products?.length ? (
                    <ul className="divide-y divide-outline-variant">
                        {data.products.map((product, index) => (
                            <li key={product.productId ?? index} className="py-space-sm">
                                <div className="flex justify-between gap-space-md">
                                    <span>{product.productName ?? `상품 #${product.productId}`}</span>
                                    <span>{product.quantity ?? 0}개 · {formatPrice(product.amount ?? 0)}</span>
                                </div>
                                {!!product.options?.length && product.options.map((option, optionIndex) => (
                                    <div key={option.inventoryId ?? optionIndex} className="flex justify-between gap-space-md pl-space-md text-on-surface-variant font-body-sm text-body-sm">
                                        <span>{option.optionName ?? '기본 옵션'}</span>
                                        <span>{option.quantity ?? 0}개 · {formatPrice(option.amount ?? 0)}</span>
                                    </div>
                                ))}
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-on-surface-variant">결제된 상품이 없습니다.</p>}
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">구매자별 주문</h2>
                {data.buyers?.length ? (
                    <ul className="flex flex-col gap-space-md">
                        {data.buyers.map((buyer, index) => (
                            <li key={buyer.memberId ?? index} className="border border-outline-variant rounded p-space-md">
                                <div className="flex justify-between gap-space-md font-semibold">
                                    <span>{buyer.nickname ?? `회원 #${buyer.memberId}`}</span>
                                    <span>{buyer.quantity ?? 0}개 · {formatPrice(buyer.amount ?? 0)}</span>
                                </div>
                                {buyer.lines?.map((line, lineIndex) => (
                                    <p key={line.orderId ?? lineIndex} className="text-on-surface-variant font-body-sm text-body-sm mt-space-xs">
                                        주문 #{line.orderId} · {line.productName ?? `상품 #${line.productId}`} · {line.optionName ?? '기본 옵션'} · {line.quantity ?? 0}개 · {formatPrice(line.amount ?? 0)}
                                    </p>
                                ))}
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-on-surface-variant">결제된 주문이 없습니다.</p>}
            </section>

            {isOpen && (
                <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-sm">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">관리자 강제 마감</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">마감하면 새 참여를 받을 수 없습니다.</p>
                    {confirming ? (
                        <div className="flex flex-wrap items-center gap-space-sm">
                            <p>공동구매 #{purchaseId}을 마감할까요?</p>
                            <button className="px-space-md py-space-sm bg-error text-on-error rounded disabled:opacity-50" type="button" disabled={close.isPending} onClick={() => close.mutate({ id: purchaseId })}>
                                {close.isPending ? '마감 중…' : '마감 확인'}
                            </button>
                            <button className="px-space-md py-space-sm border border-outline-variant rounded" type="button" disabled={close.isPending} onClick={() => setConfirming(false)}>취소</button>
                        </div>
                    ) : <button className="self-start px-space-md py-space-sm border border-error text-error rounded" type="button" onClick={() => { close.reset(); setConfirming(true); }}>강제 마감</button>}
                    {close.isError && <p className="text-error" role="alert">{errorMessage(close.error, '공동구매를 마감하지 못했습니다.')}</p>}
                </section>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return <div className="p-space-sm bg-surface-container-low rounded"><dt className="font-caption text-caption text-on-surface-variant">{label}</dt><dd className="font-headline-sm text-headline-sm text-on-surface font-bold">{value}</dd></div>;
}
