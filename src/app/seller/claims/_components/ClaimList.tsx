'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useGetSellerClaims } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import { parseKst, toKstLocal } from '@/lib/format';
import ClaimActions from './ClaimActions';
import { CLAIM_TAB_STATUSES, readClaimTab } from './ClaimStatusTabs';
import { readClaimType } from './ClaimTypeFilter';

const PAGE_SIZE = 20;
// 페이지 번호는 현재 페이지 앞뒤로 이만큼만 보여 준다.
const PAGE_WINDOW = 2;

const TYPE_LABEL: Record<string, string> = {
    EXCHANGE: '교환',
    REFUND: '환불',
};

const REASON_LABEL: Record<string, string> = {
    SIZE_MISMATCH: '사이즈 불일치',
    SIMPLE_CHANGE: '단순 변심',
    PRODUCT_DEFECT: '상품 불량',
    WRONG_DELIVERY: '오배송',
    OTHER: '기타',
};

const BADGE = 'inline-flex items-center whitespace-nowrap px-space-sm py-0.5 rounded-full text-caption font-label-sm';

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

function StatusBadge({ status }: { status: string | undefined }) {
    if (status === 'COMPLETED') return <span className={`${BADGE} bg-surface-container-high text-on-surface-variant`}>완료</span>;
    if (status === 'APPROVED') return <span className={`${BADGE} bg-primary-fixed text-on-primary-fixed`}>처리 중</span>;
    if (status === 'REJECTED') return <span className={`${BADGE} bg-surface-container-high text-on-surface-variant`}>거절됨</span>;
    return <span className={`${BADGE} bg-primary-fixed text-on-primary-fixed`}>처리 대기</span>;
}

function ClaimRow({ claim }: { claim: SellerClaimResponse }) {
    const items = claim.items ?? [];
    return (
        <tr className="hover:bg-surface-container/50 transition-colors">
            {/* 공유 공동구매 배송과 이전에 만든 배송은 주문번호가 없어 주문 ID 로 대신한다. */}
            <td className="py-space-md px-space-lg font-label-sm text-primary">{claim.orderNumber ?? `#${claim.orderId ?? '-'}`}</td>
            <td className="py-space-md px-space-lg font-body-md">
                {items.map((item) => (
                    <div key={item.deliveryItemId}>{item.productName ?? '상품 정보 없음'}</div>
                ))}
            </td>
            <td className="py-space-md px-space-lg">
                <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant">{TYPE_LABEL[claim.claimType ?? ''] ?? claim.claimType}</span>
            </td>
            <td className="py-space-md px-space-lg text-on-surface-variant">
                <div>{REASON_LABEL[claim.reason ?? ''] ?? claim.reason}</div>
                {claim.detail && <div className="text-caption">{claim.detail}</div>}
            </td>
            <td className="py-space-md px-space-lg text-on-surface-variant">{formatDate(claim.createdAt)}</td>
            <td className="py-space-md px-space-lg">
                <StatusBadge status={claim.status} />
            </td>
            <td className="py-space-md px-space-lg text-right space-x-space-xs">
                {/* 접수·처리 중인 클레임만 처리 버튼을 보여 주고, 완료(·거절)된 클레임은 "처리됨"으로 표시한다. */}
                {claim.status === 'REQUESTED' || claim.status === 'APPROVED' ? <ClaimActions claim={claim} /> : <span className="text-caption text-on-surface-variant">처리됨</span>}
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

    const query = useGetSellerClaims({ status: CLAIM_TAB_STATUSES[tab], claimType, page: page - 1, size: PAGE_SIZE });
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
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
                {query.isPending ? (
                    <TableSkeleton />
                ) : query.isError ? (
                    <div className="py-space-xl px-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                        <p className="text-body-md text-on-surface">{errorMessage(query.error, '교환·환불 목록을 불러오지 못했습니다.')}</p>
                        <button className="bg-surface border border-outline-variant text-on-surface text-label-sm px-space-md py-space-xs rounded font-label-sm hover:bg-surface-container transition-all" type="button" onClick={() => query.refetch()}>
                            다시 시도
                        </button>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline-variant text-on-surface text-label-sm">
                                <th className="py-space-md px-space-lg">주문번호</th>
                                <th className="py-space-md px-space-lg">상품명</th>
                                <th className="py-space-md px-space-lg">요청 유형</th>
                                <th className="py-space-md px-space-lg">사유</th>
                                <th className="py-space-md px-space-lg">신청일</th>
                                <th className="py-space-md px-space-lg">상태</th>
                                <th className="py-space-md px-space-lg text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                            {rows.map((claim) => (
                                <ClaimRow key={claim.claimId} claim={claim} />
                            ))}
                        </tbody>
                    </table>
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
            </div>
        </>
    );
}
