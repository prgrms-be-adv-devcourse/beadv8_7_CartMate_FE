'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card, EmptyState, Heading } from '@astryxdesign/core';
import { useQueries } from '@tanstack/react-query';
import { useGetMyClaims } from '@/api/generated/claim-controller/claim-controller';
import { getGetDeliveryDetailsQueryOptions } from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryClaimResponse, DeliveryDetailResponse } from '@/api/generated/model';
import { useGetMyWallet, useGetMyWalletTransactions } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { CLAIM_REASON_LABEL, CLAIM_STATUS, CLAIM_TYPE_LABEL, notAcceptedMessage, REFUND_STATUS_LABEL } from '../_lib/claimView';

const PAGE_SIZE = 10;
const CARD = 'bg-surface-container-lowest border border-outline-variant rounded p-space-md';
// 판매자가 승인·완료하면 상태가 바뀌므로 화면을 보고 있는 동안 가끔 다시 받는다.
const REFRESH_MS = 15_000;
const FAST_REFRESH_MS = 3_000;

export default function MyClaimsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const createdId = Number(searchParams.get('created')) || null;
    const [page, setPage] = useState(0);

    // 접수 확인 중(VERIFYING)이거나 환불 진행 중(PENDING)인 요청이 있으면 곧 바뀌므로 더 자주 불러온다.
    const claimsQuery = useGetMyClaims(
        { page, size: PAGE_SIZE },
        {
            query: {
                refetchInterval: (q) =>
                    (q.state.data?.data?.content ?? []).some((c) => c.status === 'VERIFYING' || c.refundStatus === 'PENDING') ? FAST_REFRESH_MS : REFRESH_MS,
            },
        },
    );
    const claims = claimsQuery.data?.data?.content ?? [];
    const totalPages = claimsQuery.data?.data?.totalPages ?? 0;
    const totalElements = claimsQuery.data?.data?.totalElements ?? 0;

    // 클레임 응답에는 주문 정보가 없다. 배송 상세로 주문번호를 찾는다.
    const deliveryIds = [...new Set(claims.map((c) => c.deliveryId).filter((id): id is number => !!id))];
    const deliveryQueries = useQueries({ queries: deliveryIds.map((id) => getGetDeliveryDetailsQueryOptions(id, { query: { staleTime: 60_000 } })) });
    const deliveryById = new Map<number, DeliveryDetailResponse>();
    deliveryQueries.forEach((q, i) => {
        if (q.data?.data) deliveryById.set(deliveryIds[i], q.data.data);
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
            <Card padding={4} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-space-md" aria-label="예치금 환불 현황">
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
                    <EmptyState icon={<Icon name="assignment_return" />} title="신청한 교환 · 환불이 없습니다" description="배송 완료된 주문에서 교환이나 환불을 신청할 수 있습니다." actions={<Button label="주문 내역에서 신청하기" variant="secondary" href={ROUTES.orders} />} />
                ) : (
                    <ul className="flex flex-col gap-space-md">
                        {claims.map((claim) => {
                            const delivery = deliveryById.get(claim.deliveryId ?? 0);
                            return <ClaimCard key={claim.claimId} claim={claim} delivery={delivery} highlight={claim.claimId === createdId} />;
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

function ClaimCard({ claim, delivery, highlight }: { claim: DeliveryClaimResponse; delivery?: DeliveryDetailResponse; highlight: boolean }) {
    const base = CLAIM_STATUS[claim.status ?? ''] ?? { label: claim.status ?? '-', className: 'border border-outline-variant text-outline' };
    // "일부 승인"은 상태 값이 아니라 상품별 결과로 계산한 표시다(BE partiallyApproved).
    const statusLabel = claim.partiallyApproved ? `${base.label} · 일부 승인` : base.label;
    const refund = claim.claimType === 'REFUND';
    const shared = delivery?.purchaseType === 'SHARED_GROUP';
    const rejected = claim.status === 'REJECTED';
    const notAccepted = claim.status === 'NOT_ACCEPTED';
    const decided = claim.status === 'APPROVED' || claim.status === 'COMPLETED';
    const stepIndex = claim.status === 'COMPLETED' ? 2 : claim.status === 'APPROVED' ? 1 : 0;
    const badgeVariant = rejected || notAccepted ? 'error' : claim.status === 'COMPLETED' ? 'success' : 'warning';

    return (
        <li data-claim-id={claim.claimId} data-claim-status={claim.status} className={`${CARD} flex flex-col gap-space-sm ${highlight ? 'border-primary ring-1 ring-primary' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex flex-wrap items-center gap-space-sm">
                    <span className="font-label-md text-label-md text-on-surface font-bold">요청 #{claim.claimId}</span>
                    <Badge label={CLAIM_TYPE_LABEL[claim.claimType ?? ''] ?? claim.claimType ?? '-'} variant={refund ? 'purple' : 'blue'} />
                    <span data-testid="claim-status"><Badge label={statusLabel} variant={badgeVariant} /></span>
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
                    <li key={item.deliveryItemId} className="text-on-surface" data-item-result={item.result}>
                        <span className="inline-flex flex-wrap items-center gap-space-xs">
                            {item.productName ?? `상품 #${item.orderItemId}`} <span className="text-on-surface-variant">× {item.quantity}개</span>
                            {item.result === 'APPROVED' && <Badge label="승인" variant="success" />}
                            {item.result === 'REJECTED' && <Badge label="거절" variant="red" />}
                        </span>
                        {item.result === 'REJECTED' && item.rejectReason && <div className="font-caption text-caption text-on-surface-variant">판매자 거절 사유: {item.rejectReason}</div>}
                    </li>
                ))}
            </ul>
            {claim.detail && <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low rounded p-space-sm whitespace-pre-line">{claim.detail}</p>}

            {notAccepted && (
                <p className="font-body-sm text-body-sm text-error bg-error-container/30 rounded p-space-sm">{notAcceptedMessage(claim.notAcceptedCode)}</p>
            )}
            {claim.status === 'VERIFYING' && <p className="font-body-sm text-body-sm text-on-surface-variant">접수할 수 있는지 확인하고 있습니다. 잠시 뒤 판매자에게 전달됩니다.</p>}

            {/* 진행 단계 */}
            {!rejected && !notAccepted && (
                <ol className="flex items-center gap-space-xs font-caption text-caption" aria-label="진행 단계">
                    {STEPS.map((step, i) => (
                        <li key={step} className="flex items-center gap-space-xs">
                            <span className={`px-space-xs py-0.5 rounded ${i <= stepIndex ? 'bg-primary text-on-primary font-bold' : 'border border-outline-variant text-outline'}`}>{step}</span>
                            {i < STEPS.length - 1 && <Icon name="chevron_right" className="text-[14px] text-outline" />}
                        </li>
                    ))}
                </ol>
            )}

            {refund && !notAccepted && (
                <div className="mt-space-xs pt-space-sm border-t border-surface-container flex flex-wrap items-center justify-between gap-space-sm">
                    <span className={`font-body-sm text-body-sm ${claim.refundStatus === 'FAILED' ? 'text-error' : 'text-on-surface-variant'}`} data-refund-status={claim.refundStatus}>
                        {shared
                            ? '공동물품 공구 주문은 구매 확정 후 환불되지 않아 판매자가 승인할 수 없습니다.'
                            : decided
                              ? (REFUND_STATUS_LABEL[claim.refundStatus ?? ''] ?? '예치금 환불 진행 중') +
                                (claim.partiallyApproved ? ' (판매자가 승인한 상품만 환불됩니다)' : '')
                              : rejected
                                ? '거절된 요청은 환불되지 않습니다.'
                                : '판매자가 승인한 상품만 예치금으로 환불됩니다. 금액은 쿠폰 할인을 반영해 계산됩니다.'}
                    </span>
                    {decided && claim.refundStatus === 'COMPLETED' && (
                        <Link href={ROUTES.depositHistory} className="font-caption text-caption text-primary hover:underline">
                            예치금 내역에서 금액 보기
                        </Link>
                    )}
                </div>
            )}
        </li>
    );
}
