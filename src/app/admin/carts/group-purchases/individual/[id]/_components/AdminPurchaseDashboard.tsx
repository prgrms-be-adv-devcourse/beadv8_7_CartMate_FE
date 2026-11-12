'use client';

import { useState } from 'react';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
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

    if (!validId) return <Text role="alert" className="text-error">올바르지 않은 공동구매 번호입니다.</Text>;
    if (dashboard.isPending) return <Text role="status" color="secondary">현황을 불러오는 중입니다…</Text>;
    const status = dashboard.error instanceof ApiError ? dashboard.error.status : undefined;
    if (dashboard.isError || !dashboard.data?.data) {
        const message = status === 404 ? '공동구매를 찾을 수 없습니다.'
            : status === 403 ? '관리자 권한이 필요합니다.'
                : errorMessage(dashboard.error, '현황을 불러오지 못했습니다.');
        return (
            <Card variant="muted" role="alert" className="flex flex-col items-start gap-space-sm">
                <Text className={status === 403 ? 'text-error' : undefined}>{message}</Text>
                {status !== 403 && status !== 404 && <Button label="다시 시도" variant="secondary" size="sm" type="button" onClick={() => void dashboard.refetch()} />}
            </Card>
        );
    }

    const data = dashboard.data.data;
    const isOpen = data.status === 'OPEN';
    const statusLabel = !isOpen ? '마감됨' : data.open ? '진행 중' : '마감 기한 경과 · 종료 처리 전';
    return (
        <div className="flex flex-col gap-space-lg">
            <Card className="flex flex-col gap-space-md">
                <div className="flex flex-wrap items-start justify-between gap-space-md">
                    <div>
                        <Heading level={2}>{data.title ?? `공동구매 #${purchaseId}`}</Heading>
                        <Text color="secondary">번호 #{purchaseId} · <Badge label={statusLabel} variant={isOpen ? data.open ? 'success' : 'warning' : 'neutral'} /></Text>
                        <Text color="secondary">마감 예정 {formatDateTime(data.deadlineAt)}</Text>
                        {data.closedAt && <Text color="secondary">실제 마감 {formatDateTime(data.closedAt)}</Text>}
                    </div>
                    <Button label={dashboard.isFetching ? '새로고침 중…' : '새로고침'} variant="secondary" size="sm" type="button" isDisabled={dashboard.isFetching} onClick={() => void dashboard.refetch()} />
                </div>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                    <Stat label="결제 완료 주문" value={`${data.orderCount ?? 0}건`} />
                    <Stat label="구매자" value={`${data.buyerCount ?? 0}명`} />
                    <Stat label="총 수량" value={`${data.totalQuantity ?? 0}개`} />
                    <Stat label="총 결제 금액" value={formatPrice(data.totalAmount ?? 0)} />
                </dl>
                <Text type="supporting" color="secondary">결제가 끝난 주문만 집계합니다.</Text>
            </Card>

            <Card>
                <Heading level={2} className="mb-space-md">상품별 현황</Heading>
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
                ) : <Text color="secondary">결제된 상품이 없습니다.</Text>}
            </Card>

            <Card>
                <Heading level={2} className="mb-space-md">구매자별 주문</Heading>
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
                ) : <Text color="secondary">결제된 주문이 없습니다.</Text>}
            </Card>

            {isOpen && (
                <Card className="flex flex-col gap-space-sm">
                    <Heading level={2}>관리자 강제 마감</Heading>
                    <Text color="secondary">마감하면 새 참여를 받을 수 없습니다.</Text>
                    {confirming ? (
                        <div className="flex flex-wrap items-center gap-space-sm">
                            <Text>공동구매 #{purchaseId}을 마감할까요?</Text>
                            <Button label={close.isPending ? '마감 중…' : '마감 확인'} variant="destructive" type="button" isDisabled={close.isPending} onClick={() => close.mutate({ id: purchaseId })} />
                            <Button label="취소" variant="secondary" type="button" isDisabled={close.isPending} onClick={() => setConfirming(false)} />
                        </div>
                    ) : <Button label="강제 마감" variant="destructive" type="button" onClick={() => { close.reset(); setConfirming(true); }} />}
                    {close.isError && <Text className="text-error" role="alert">{errorMessage(close.error, '공동구매를 마감하지 못했습니다.')}</Text>}
                </Card>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return <div className="p-space-sm bg-surface-container-low rounded"><dt className="font-caption text-caption text-on-surface-variant">{label}</dt><dd><Heading level={3}>{value}</Heading></dd></div>;
}
