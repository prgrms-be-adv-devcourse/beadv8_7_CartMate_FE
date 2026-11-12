'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card, EmptyState, Heading } from '@astryxdesign/core';
import { useQueries } from '@tanstack/react-query';
import { useGetMyClaims } from '@/api/generated/claim-controller/claim-controller';
import { getGetDeliveryDetailsQueryOptions } from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryClaimResponse, DeliveryDetailResponse, OrderDetailResponse, WalletTransactionResponse } from '@/api/generated/model';
import { getGetDetailQueryOptions } from '@/api/generated/order-controller/order-controller';
import { useGetMyWallet, useGetMyWalletTransactions } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { CLAIM_REASON_LABEL, CLAIM_STATUS, CLAIM_TYPE_LABEL, isRefunded, refundAmountOf } from '../_lib/claimView';

const PAGE_SIZE = 10;
const CARD = 'bg-surface-container-lowest border border-outline-variant rounded p-space-md';
// 판매자가 승인·완료하면 상태가 바뀌므로 화면을 보고 있는 동안 가끔 다시 받는다.
const REFRESH_MS = 15_000;

export default function MyClaimsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const createdId = Number(searchParams.get('created')) || null;
    const [page, setPage] = useState(0);

    const claimsQuery = useGetMyClaims({ page, size: PAGE_SIZE }, { query: { refetchInterval: REFRESH_MS } });
    const claims = claimsQuery.data?.data?.content ?? [];
    const totalPages = claimsQuery.data?.data?.totalPages ?? 0;
    const totalElements = claimsQuery.data?.data?.totalElements ?? 0;

    // 클레임 응답에는 주문 정보·금액이 없다. 배송 상세 → (개인 주문이면) 주문 상세로 주문번호와 단가를 찾는다.
    const deliveryIds = [...new Set(claims.map((c) => c.deliveryId).filter((id): id is number => !!id))];
    const deliveryQueries = useQueries({ queries: deliveryIds.map((id) => getGetDeliveryDetailsQueryOptions(id, { query: { staleTime: 60_000 } })) });
    const deliveryById = new Map<number, DeliveryDetailResponse>();
    deliveryQueries.forEach((q, i) => {
        if (q.data?.data) deliveryById.set(deliveryIds[i], q.data.data);
    });

    const orderIds = [
        ...new Set(
            [...deliveryById.values()].filter((d) => d.purchaseType === 'INDIVIDUAL_GROUP' && d.orderId).map((d) => d.orderId as number),
        ),
    ];
    const orderQueries = useQueries({ queries: orderIds.map((id) => getGetDetailQueryOptions(id, { query: { staleTime: 60_000 } })) });
    const orderById = new Map<number, OrderDetailResponse>();
    orderQueries.forEach((q, i) => {
        if (q.data?.data) orderById.set(orderIds[i], q.data.data);
    });

    const wallet = useGetMyWallet({ query: { refetchInterval: REFRESH_MS } });
    const transactions = useGetMyWalletTransactions({ page: 0, size: 50 }, { query: { refetchInterval: REFRESH_MS } });
    const refundTxs = (transactions.data?.data?.content ?? []).filter((t) => t.transactionType === 'REFUND');

    return (
        <div className="flex flex-col gap-space-lg">
            {createdId && (
                <div role="status" className="rounded px-space-lg py-space-md bg-primary-fixed text-on-primary-fixed flex items-start justify-between gap-space-md">
                    <div className="flex items-start gap-space-sm">
                        <Icon name="check_circle" className="text-[20px]" />
                        <span className="font-body-md text-body-md">교환 · 환불 요청 #{createdId}이(가) 접수되었습니다. 판매자가 확인하면 상태가 바뀝니다.</span>
                    </div>
                    <button type="button" aria-label="안내 닫기" className="opacity-70 hover:opacity-100" onClick={() => router.replace(pathname, { scroll: false })}>
                        <Icon name="close" className="text-[18px]" />
                    </button>
                </div>
            )}

            {/* 예치금 · 최근 환불 */}
            <Card padding={3} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-space-md" aria-label="예치금 환불 현황">
                <div className="flex flex-col gap-1 md:border-r md:border-surface-container md:pr-space-md">
                    <span className="font-caption text-caption text-outline">예치금 잔액</span>
                    <span data-testid="wallet-balance" className="font-headline-md text-headline-md text-on-surface font-bold">
                        {wallet.data?.data ? formatPrice(wallet.data.data.balance ?? 0) : wallet.isError ? '-' : '...'}
                    </span>
                    <Link href={ROUTES.deposit} className="font-caption text-caption text-primary hover:underline">
                        예치금 관리로
                    </Link>
                </div>
                <div>
                    <div className="font-label-md text-label-md text-on-surface mb-space-xs">최근 환불 입금</div>
                    {transactions.isPending ? (
                        <p className="font-body-sm text-body-sm text-outline">불러오는 중...</p>
                    ) : transactions.isError ? (
                        <p className="font-body-sm text-body-sm text-outline">거래 내역을 불러오지 못했습니다.</p>
                    ) : refundTxs.length === 0 ? (
                        <p className="font-body-sm text-body-sm text-outline">아직 환불 입금 내역이 없습니다.</p>
                    ) : (
                        <ul data-testid="refund-transactions" className="flex flex-col divide-y divide-surface-container font-body-sm text-body-sm">
                            {refundTxs.slice(0, 3).map((t) => (
                                <li key={t.transactionId} className="py-1.5 flex flex-wrap items-center justify-between gap-space-sm">
                                    <span className="text-on-surface-variant">
                                        {formatDateTime(t.createdAt)} · 주문 #{t.orderId}
                                    </span>
                                    <span className="flex items-center gap-space-sm">
                                        <span className="text-primary font-bold">+{formatPrice(t.amount ?? 0)}</span>
                                        <span className="font-caption text-caption text-outline">잔액 {formatPrice(t.balanceAfter ?? 0)}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Card>

            {/* 클레임 목록 */}
            <section aria-label="교환 · 환불 요청 목록" className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                    <Heading level={2}>
                        요청 목록 {claimsQuery.data?.data && <span className="text-outline font-normal">총 {totalElements}건</span>}
                    </Heading>
                    {claimsQuery.isFetching && !claimsQuery.isPending && <span className="font-caption text-caption text-outline">새로 불러오는 중...</span>}
                </div>

                {claimsQuery.isPending ? (
                    <div className="h-40 bg-surface-container-low border border-outline-variant rounded animate-pulse" aria-busy="true" />
                ) : claimsQuery.isError ? (
                    <EmptyState icon={<Icon name="error" />} title="교환 · 환불 내역을 불러오지 못했습니다" description={errorMessage(claimsQuery.error, '잠시 후 다시 시도해 주세요.')} actions={<Button label="다시 시도" variant="secondary" onClick={() => void claimsQuery.refetch()} />} />
                ) : claims.length === 0 ? (
                    <EmptyState icon={<Icon name="assignment_return" />} title="신청한 교환 · 환불이 없습니다" description="배송 완료된 주문에서 교환이나 환불을 신청할 수 있습니다." actions={<Button label="주문 내역에서 신청하기" variant="secondary" href={ROUTES.orders} as={Link} />} />
                ) : (
                    <ul className="flex flex-col gap-space-md">
                        {claims.map((claim) => {
                            const delivery = deliveryById.get(claim.deliveryId ?? 0);
                            const order = delivery?.orderId && delivery.purchaseType === 'INDIVIDUAL_GROUP' ? orderById.get(delivery.orderId) : undefined;
                            return (
                                <ClaimCard
                                    key={claim.claimId}
                                    claim={claim}
                                    delivery={delivery}
                                    order={order}
                                    refundTxs={refundTxs}
                                    highlight={claim.claimId === createdId}
                                />
                            );
                        })}
                    </ul>
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-space-sm">
                        <Button label="이전" variant="secondary" isDisabled={page === 0} onClick={() => setPage((p) => p - 1)} />
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {page + 1} / {totalPages}
                        </span>
                        <Button label="다음" variant="secondary" isDisabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} />
                    </div>
                )}
            </section>
        </div>
    );
}

const STEPS = ['접수', '판매자 승인', '처리 완료'] as const;

function ClaimCard({
    claim,
    delivery,
    order,
    refundTxs,
    highlight,
}: {
    claim: DeliveryClaimResponse;
    delivery?: DeliveryDetailResponse;
    order?: OrderDetailResponse;
    refundTxs: WalletTransactionResponse[];
    highlight: boolean;
}) {
    const status = CLAIM_STATUS[claim.status ?? ''] ?? { label: claim.status ?? '-', className: 'border border-outline-variant text-outline' };
    const refund = claim.claimType === 'REFUND';
    const refunded = isRefunded(claim.claimType, claim.status);
    const amount = refund ? refundAmountOf(claim.items, order?.items) : null;
    const shared = delivery?.purchaseType === 'SHARED_GROUP';
    // 같은 주문 · 같은 금액의 환불 입금을 찾아 입금 시각을 보여 준다(클레임 응답에 환불 시각이 없음).
    const refundTx = refunded && amount !== null ? refundTxs.find((t) => t.orderId === delivery?.orderId && t.amount === amount) : undefined;
    const stepIndex = claim.status === 'COMPLETED' ? 2 : claim.status === 'APPROVED' ? 1 : 0;
    const rejected = claim.status === 'REJECTED';

    return (
        <li data-claim-id={claim.claimId} data-claim-status={claim.status} className={`${CARD} flex flex-col gap-space-sm ${highlight ? 'border-primary ring-1 ring-primary' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex flex-wrap items-center gap-space-sm">
                    <span className="font-label-md text-label-md text-on-surface font-bold">요청 #{claim.claimId}</span>
                    <Badge label={CLAIM_TYPE_LABEL[claim.claimType ?? ''] ?? claim.claimType ?? '-'} variant={refund ? 'purple' : 'blue'} />
                    <span data-testid="claim-status"><Badge label={status.label} variant={rejected ? 'error' : refunded ? 'success' : 'warning'} /></span>
                </div>
                <span className="font-caption text-caption text-outline">신청 {formatDateTime(claim.createdAt)}</span>
            </div>

            <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-wrap gap-x-space-md gap-y-1">
                {delivery?.orderId ? (
                    shared ? (
                        <span>공동 주문 #{delivery.orderId}</span>
                    ) : (
                        <Link href={ROUTES.order(delivery.orderId)} className="text-primary hover:underline">
                            주문 {delivery.orderNumber ?? `#${delivery.orderId}`}
                        </Link>
                    )
                ) : (
                    <span>배송 #{claim.deliveryId}</span>
                )}
                <span>사유: {CLAIM_REASON_LABEL[claim.reason ?? ''] ?? claim.reason}</span>
            </div>

            <ul className="flex flex-col gap-1 font-body-sm text-body-sm">
                {(claim.items ?? []).map((item) => (
                    <li key={item.deliveryItemId} className="text-on-surface">
                        {item.productName ?? `상품 #${item.orderItemId}`} <span className="text-on-surface-variant">× {item.quantity}개</span>
                    </li>
                ))}
            </ul>
            {claim.detail && <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low rounded p-space-sm whitespace-pre-line">{claim.detail}</p>}

            {/* 진행 단계 */}
            {!rejected && (
                <ol className="flex items-center gap-space-xs font-caption text-caption" aria-label="진행 단계">
                    {STEPS.map((step, i) => (
                        <li key={step} className="flex items-center gap-space-xs">
                            <span className={`px-space-xs py-0.5 rounded ${i <= stepIndex ? 'bg-primary text-on-primary font-bold' : 'border border-outline-variant text-outline'}`}>{step}</span>
                            {i < STEPS.length - 1 && <Icon name="chevron_right" className="text-[14px] text-outline" />}
                        </li>
                    ))}
                </ol>
            )}

            {refund && (
                <div className="mt-space-xs pt-space-sm border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {shared
                            ? '공동물품 공구 주문은 구매 확정 후 환불되지 않아 판매자가 승인할 수 없습니다.'
                            : refunded
                              ? refundTx
                                  ? `예치금 환불 완료 · ${formatDateTime(refundTx.createdAt)}`
                                  : '예치금 환불 완료'
                              : rejected
                                ? '거절된 요청은 환불되지 않습니다.'
                                : '판매자가 승인하면 예치금으로 환불됩니다.'}
                    </span>
                    {amount !== null && (
                        <span className="text-right">
                            <span className="font-caption text-caption text-outline mr-space-xs">{refunded ? '환불 금액' : '환불 예정 금액'}</span>
                            <span data-testid="claim-refund-amount" className={`font-headline-sm text-headline-sm font-bold ${refunded ? 'text-primary' : 'text-on-surface'}`}>
                                {formatPrice(amount)}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </li>
    );
}
