'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card } from '@astryxdesign/core';
import { useGetSellerClaims } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import { parseKst, toKstLocal } from '@/lib/format';
import ClaimActions from './ClaimActions';
import { CLAIM_REASON_LABEL as REASON_LABEL, CLAIM_TYPE_LABEL as TYPE_LABEL, REFUND_STATUS_LABEL } from './claimLabels';
import { CLAIM_TAB_STATUSES, readClaimTab } from './ClaimStatusTabs';
import { readClaimType } from './ClaimTypeFilter';

const PAGE_SIZE = 20;
const REFUND_POLL_MS = 3_000;
// 페이지 번호는 현재 페이지 앞뒤로 이만큼만 보여 준다.
const PAGE_WINDOW = 2;


// URL 의 page 는 사람이 보는 1부터, BE 요청은 0부터다.
function readPage(raw: string | null): number {
    const page = Number(raw);
    return Number.isInteger(page) && page >= 1 ? page : 1;
}

// 신청일은 날짜만 보여 준다. (YYYY-MM-DD)
function formatDate(value: string | undefined): string {
    const date = parseKst(value);
    return date ? toKstLocal(date).slice(0, 10) : '-';
}

// "일부 승인"은 상태 값이 아니라 상품별 결과로 계산한 표시다(BE partiallyApproved).
function StatusBadge({ claim }: { claim: SellerClaimResponse }) {
    const partial = claim.partiallyApproved ? ' · 일부 승인' : '';
    if (claim.status === 'COMPLETED') return <Badge label={`완료${partial}`} />;
    if (claim.status === 'APPROVED') return <Badge variant="info" label={`처리 중${partial}`} />;
    if (claim.status === 'REJECTED') return <Badge variant="neutral" label="거절됨" />;
    return <Badge variant="warning" label="처리 대기" />;
}

// 상품마다 판매자 결정. 수량 뒤에 색 글자로 붙인다(결정 전이면 아무것도 붙이지 않는다).
// 배지로 앞에 두면 상품명 시작 위치가 들쭉날쭉하고, 뒤에 두면 좁은 창에서 배지만 다음 줄로 떨어진다.
function ItemResult({ result, rejectReason }: { result: string | undefined; rejectReason: string | undefined }) {
    if (result === 'APPROVED') return <span className="text-[var(--color-text-success)]"> · 승인</span>;
    if (result === 'REJECTED') return <span className="text-error"> · 거절{rejectReason ? ` — ${rejectReason}` : ''}</span>;
    return null;
}

function ClaimRow({ claim }: { claim: SellerClaimResponse }) {
    const items = claim.items ?? [];
    return (
        <tr className="hover:bg-surface-container/50 transition-colors">
            {/* 공유 공동구매 배송과 이전에 만든 배송은 주문번호가 없어 주문 ID 로 대신한다. */}
            <td className="py-space-md px-space-md font-label-sm text-primary">{claim.orderNumber ?? `#${claim.orderId ?? '-'}`}</td>
            <td className="py-space-md px-space-md font-body-md min-w-[180px]">
                {items.map((item) => (
                    <div key={item.deliveryItemId} className="py-0.5">
                        <div className={item.result === 'REJECTED' ? 'text-on-surface-variant' : undefined}>{item.productName ?? '상품 정보 없음'}</div>
                        <div className="text-caption text-on-surface-variant">
                            × {item.quantity}
                            <ItemResult result={item.result} rejectReason={item.rejectReason} />
                        </div>
                    </div>
                ))}
            </td>
            <td className="py-space-md px-space-md whitespace-nowrap">
                <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant">{TYPE_LABEL[claim.claimType ?? ''] ?? claim.claimType}</span>
            </td>
            <td className="py-space-md px-space-md text-on-surface-variant">
                <div className="whitespace-nowrap">{REASON_LABEL[claim.reason ?? ''] ?? claim.reason}</div>
                {claim.detail && <div className="text-caption">{claim.detail}</div>}
            </td>
            <td className="py-space-md px-space-md text-on-surface-variant whitespace-nowrap">{formatDate(claim.createdAt)}</td>
            <td className="py-space-md px-space-md">
                <StatusBadge claim={claim} />
                {/* 반품을 승인하면 환불이 비동기로 진행된다. 끝난 환불은 "반품 · 완료"로 이미 알 수 있어, 진행 중 · 실패일 때만 적는다. */}
                {claim.claimType === 'REFUND' && (claim.refundStatus === 'PENDING' || claim.refundStatus === 'FAILED') && (
                    <div className={`text-caption mt-1 ${claim.refundStatus === 'FAILED' ? 'text-error' : 'text-on-surface-variant'}`}>{REFUND_STATUS_LABEL[claim.refundStatus ?? '']}</div>
                )}
            </td>
            <td className="py-space-md px-space-md text-center">
                {/* 접수·처리 중인 클레임만 처리 버튼을 보여 주고, 완료(·거절)된 클레임은 "처리됨"으로 표시한다. */}
                {claim.status === 'REQUESTED' || claim.status === 'APPROVED' ? <ClaimActions claim={claim} /> : <span className="text-caption text-on-surface-variant whitespace-nowrap">처리됨</span>}
            </td>
        </tr>
    );
}

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-space-sm p-space-lg" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-12 bg-surface-container animate-pulse rounded-lg" />
            ))}
        </div>
    );
}

// 판매자 교환·환불 목록. 탭(tab)과 페이지(page)는 URL 쿼리스트링에서 읽는다. (탭이 같은 쿼리를 바꾼다)
export default function ClaimList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = readClaimTab(searchParams.get('tab'));
    const page = readPage(searchParams.get('page'));

    const claimType = readClaimType(searchParams.get('type'));

    // 반품 환불은 승인 뒤 결제 서버가 따로 처리한다(비동기). 처리 직후 다시 불러오면 아직 "환불 진행 중"이라,
    // 진행 중인 환불이 화면에 있는 동안만 몇 초마다 다시 불러와 "환불 완료"로 바뀌게 한다.
    const query = useGetSellerClaims(
        { status: CLAIM_TAB_STATUSES[tab], claimType, page: page - 1, size: PAGE_SIZE },
        { query: { refetchInterval: (q) => ((q.state.data?.data?.content ?? []).some((c) => c.refundStatus === 'PENDING') ? REFUND_POLL_MS : false) } },
    );
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
            {/* Requests Table */}
            <Card className="overflow-hidden" padding={0}>
                {query.isPending ? (
                    <TableSkeleton />
                ) : query.isError ? (
                    <div className="py-space-xl px-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                        <p className="text-body-md text-on-surface">{errorMessage(query.error, '교환·환불 목록을 불러오지 못했습니다.')}</p>
                        <Button label="다시 시도" onClick={() => query.refetch()} />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-space-xl px-space-lg text-center text-body-md text-on-surface-variant">
                        {totalElements > 0 ? (
                            <>
                                이 페이지에는 교환·환불이 없습니다.{' '}
                                <button className="text-primary font-label-sm underline" type="button" onClick={() => goPage(1)}>
                                    첫 페이지로
                                </button>
                            </>
                        ) : (
                            '접수된 교환·환불이 없습니다.'
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline-variant text-on-surface text-label-sm">
                                <th className="py-space-md px-space-md whitespace-nowrap">주문번호</th>
                                <th className="py-space-md px-space-md whitespace-nowrap">상품명</th>
                                <th className="py-space-md px-space-md whitespace-nowrap">요청 유형</th>
                                <th className="py-space-md px-space-md whitespace-nowrap">사유</th>
                                <th className="py-space-md px-space-md whitespace-nowrap">신청일</th>
                                <th className="py-space-md px-space-md whitespace-nowrap">상태</th>
                                <th className="py-space-md px-space-md text-center whitespace-nowrap">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                            {rows.map((claim) => (
                                <ClaimRow key={claim.claimId} claim={claim} />
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
                {/* Pagination */}
                <div className="px-space-lg py-space-md bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
                    <span className="text-caption text-on-surface-variant">
                        총 {totalElements}개 중 {from}-{to}개 표시
                    </span>
                    <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50" disabled={page <= 1} aria-label="이전 페이지" onClick={() => goPage(page - 1)}>
                            &lt;
                        </button>
                        {pages.map((n) => (
                            <button
                                key={n}
                                aria-current={n === page ? 'page' : undefined}
                                className={
                                    n === page
                                        ? 'w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center text-label-sm font-label-sm'
                                        : 'w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container text-label-sm'
                                }
                                onClick={() => goPage(n)}
                            >
                                {n}
                            </button>
                        ))}
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-all disabled:opacity-50" disabled={totalPages === 0 || page >= totalPages} aria-label="다음 페이지" onClick={() => goPage(page + 1)}>
                            &gt;
                        </button>
                    </div>
                </div>
            </Card>
        </>
    );
}
