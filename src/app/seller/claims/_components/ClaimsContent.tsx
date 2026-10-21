'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { getGetSellerClaimsQueryKey, getGetSellerClaimsQueryOptions, useGetSellerClaims } from '@/api/generated/claim-controller/claim-controller';
import type { GetSellerClaimsClaimType } from '@/api/generated/model';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import ClaimActions from './ClaimActions';
import ClaimStatusTabs from './ClaimStatusTabs';
import {
    CLAIM_TABS,
    REASON_LABEL,
    STATUS_BADGE,
    STATUS_LABEL,
    TYPE_LABEL,
    isClaimTab,
    isClaimType,
    loadErrorMessage,
    type ActionResult,
    type ClaimTab,
} from './claim';

const PAGE_SIZE = 10;
const PREPARING_SOON = '준비 중인 기능입니다';

export default function ClaimsContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // 탭 · 유형 · 페이지는 주소에 남겨 새로고침 · 뒤로 가기에도 유지한다.
    const tabParam = searchParams.get('tab');
    const tab: ClaimTab = isClaimTab(tabParam) ? tabParam : 'pending';
    const typeParam = searchParams.get('type');
    const claimType: GetSellerClaimsClaimType | undefined = isClaimType(typeParam) ? typeParam : undefined;
    const page = Math.max(0, Math.trunc(Number(searchParams.get('page') ?? 1)) - 1) || 0;

    const [result, setResult] = useState<ActionResult | null>(null);

    const navigate = (next: { tab?: ClaimTab; type?: GetSellerClaimsClaimType | null; page?: number }) => {
        const params = new URLSearchParams();
        params.set('tab', next.tab ?? tab);
        const type = next.type === undefined ? claimType : next.type;
        if (type) params.set('type', type);
        const nextPage = next.page ?? 0;
        if (nextPage > 0) params.set('page', String(nextPage + 1));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 탭별 건수. 건수 API가 없어 탭마다 한 건짜리 페이지를 받아 totalElements를 쓴다(배송 관리와 같은 방식).
    const countQueries = useQueries({
        queries: CLAIM_TABS.map((t) => getGetSellerClaimsQueryOptions({ status: t.status, claimType, size: 1 })),
    });
    const counts: Partial<Record<ClaimTab, number>> = {};
    CLAIM_TABS.forEach((t, i) => {
        const total = countQueries[i].data?.data?.totalElements;
        if (total !== undefined) counts[t.tab] = total;
    });

    const activeTab = CLAIM_TABS.find((t) => t.tab === tab) ?? CLAIM_TABS[0];
    const list = useGetSellerClaims({ status: activeTab.status, claimType, page, size: PAGE_SIZE });
    const pageData = list.data?.data;
    const claims = pageData?.content ?? [];
    const totalElements = pageData?.totalElements ?? 0;
    const totalPages = pageData?.totalPages ?? 0;

    const handleResult = (next: ActionResult) => {
        setResult(next);
        if (next.ok || next.stale) void queryClient.invalidateQueries({ queryKey: getGetSellerClaimsQueryKey() });
    };

    // 처리 후 마지막 페이지가 비면 앞 페이지로 옮긴다.
    const overflowPage = pageData && claims.length === 0 && page > 0 && page >= totalPages ? Math.max(0, totalPages - 1) : null;
    useEffect(() => {
        if (overflowPage === null) return;
        const params = new URLSearchParams({ tab });
        if (claimType) params.set('type', claimType);
        if (overflowPage > 0) params.set('page', String(overflowPage + 1));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [overflowPage, tab, claimType, pathname, router]);

    const rangeStart = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const rangeEnd = page * PAGE_SIZE + claims.length;

    return (
        <>
            <div className="flex flex-wrap items-center justify-end gap-space-md mb-space-lg">
                <ClaimStatusTabs
                    active={tab}
                    counts={counts}
                    onChange={(next) => {
                        setResult(null);
                        navigate({ tab: next, page: 0 });
                    }}
                />
            </div>

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

            {/* 필터. 유형은 BE가 지원하고, 기간 · 검색은 지원하지 않아 비활성으로 둔다. */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-space-md mb-space-lg flex flex-wrap items-center justify-between gap-space-md shadow-sm">
                <div className="flex flex-wrap items-center gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <label htmlFor="claim-type-filter" className="text-caption text-on-surface-variant font-label-sm">
                            유형
                        </label>
                        <select
                            id="claim-type-filter"
                            value={claimType ?? ''}
                            onChange={(e) => {
                                setResult(null);
                                navigate({ type: isClaimType(e.target.value) ? e.target.value : null, page: 0 });
                            }}
                            className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded px-space-md py-space-xs outline-none focus:border-primary"
                        >
                            <option value="">전체 유형</option>
                            <option value="EXCHANGE">교환</option>
                            <option value="REFUND">환불</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-space-sm opacity-60" title={PREPARING_SOON}>
                        <label htmlFor="claim-period-filter" className="text-caption text-on-surface-variant font-label-sm">
                            기간
                        </label>
                        <select id="claim-period-filter" disabled className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded px-space-md py-space-xs">
                            <option>전체 기간 (준비 중)</option>
                        </select>
                    </div>
                </div>
                <fieldset disabled title={PREPARING_SOON} className="flex items-center gap-space-sm opacity-60">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
                        <input
                            aria-label="주문번호 또는 상품명 검색"
                            className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded pl-10 pr-space-md py-space-xs w-56"
                            placeholder="주문번호 또는 상품명 검색"
                            type="text"
                        />
                    </div>
                    <button type="button" className="bg-primary text-on-primary text-label-sm px-space-md py-space-xs rounded font-label-sm">
                        검색 (준비 중)
                    </button>
                </fieldset>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
                <div className="px-space-lg py-space-md border-b border-outline-variant flex items-center justify-between">
                    <div className="font-label-md text-on-surface flex items-center gap-space-sm">
                        <span>{activeTab.label} 목록</span>
                        {pageData && <span className="text-caption bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full">총 {totalElements}건</span>}
                    </div>
                    {list.isFetching && !list.isPending && <span className="text-body-sm text-on-surface-variant">새로 불러오는 중...</span>}
                </div>

                {list.isPending ? (
                    <p className="p-space-xl text-center text-on-surface-variant">교환 · 환불 요청을 불러오는 중...</p>
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
                ) : claims.length === 0 ? (
                    <div className="p-space-xl flex flex-col items-center gap-space-sm text-center text-on-surface-variant">
                        <Icon name="assignment_return" className="text-[32px]" />
                        <p>{activeTab.label} 상태의 교환 · 환불 요청이 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container border-b border-outline-variant text-on-surface text-label-sm">
                                    <th className="py-space-md px-space-lg">요청 / 신청일</th>
                                    <th className="py-space-md px-space-lg">주문</th>
                                    <th className="py-space-md px-space-lg min-w-[160px]">상품 · 수량</th>
                                    <th className="py-space-md px-space-lg">유형</th>
                                    <th className="py-space-md px-space-lg min-w-[160px]">사유</th>
                                    <th className="py-space-md px-space-lg">상태</th>
                                    <th className="py-space-md px-space-lg text-right min-w-[200px]">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                                {claims.map((claim) => (
                                    <tr key={claim.claimId} data-claim-id={claim.claimId} data-claim-status={claim.status} className="align-top hover:bg-surface-container/50 transition-colors">
                                        <td className="py-space-md px-space-lg whitespace-nowrap">
                                            <div className="font-label-sm text-primary">#{claim.claimId}</div>
                                            <div className="text-caption text-on-surface-variant">{formatDateTime(claim.createdAt)}</div>
                                        </td>
                                        <td className="py-space-md px-space-lg whitespace-nowrap">
                                            <div className="font-label-sm">{claim.orderNumber ?? `주문 #${claim.orderId}`}</div>
                                            <div className="text-caption text-on-surface-variant">배송 #{claim.deliveryId}</div>
                                        </td>
                                        <td className="py-space-md px-space-lg">
                                            <ul className="flex flex-col gap-0.5">
                                                {(claim.items ?? []).map((item) => (
                                                    <li key={item.deliveryItemId}>
                                                        {item.productName ?? `상품 #${item.orderItemId}`}
                                                        <span className="text-on-surface-variant"> × {item.quantity}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="py-space-md px-space-lg">
                                            <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant whitespace-nowrap">
                                                {TYPE_LABEL[claim.claimType ?? ''] ?? claim.claimType}
                                            </span>
                                        </td>
                                        <td className="py-space-md px-space-lg text-on-surface-variant">
                                            <div className="text-on-surface">{REASON_LABEL[claim.reason ?? ''] ?? claim.reason}</div>
                                            {claim.detail && <div className="text-caption whitespace-pre-line line-clamp-3">{claim.detail}</div>}
                                        </td>
                                        <td className="py-space-md px-space-lg whitespace-nowrap">
                                            <span className={`inline-flex items-center px-space-sm py-0.5 rounded-full text-caption font-label-sm ${STATUS_BADGE[claim.status ?? ''] ?? STATUS_BADGE.REQUESTED}`}>
                                                {STATUS_LABEL[claim.status ?? ''] ?? claim.status}
                                            </span>
                                        </td>
                                        <td className="py-space-md px-space-lg text-right">
                                            <ClaimActions claim={claim} onResult={handleResult} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pageData && totalPages > 1 && (
                    <div className="px-space-lg py-space-md border-t border-outline-variant flex items-center justify-between">
                        <span className="text-caption text-on-surface-variant">
                            {rangeStart}-{rangeEnd} / 총 {totalElements}건
                        </span>
                        <div className="flex flex-wrap items-center gap-space-xs">
                            <button
                                type="button"
                                aria-label="이전 페이지"
                                onClick={() => navigate({ page: page - 1 })}
                                disabled={page === 0}
                                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-50"
                            >
                                <Icon name="chevron_left" className="text-[16px]" />
                            </button>
                            <span className="text-label-sm text-on-surface px-space-sm">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                type="button"
                                aria-label="다음 페이지"
                                onClick={() => navigate({ page: page + 1 })}
                                disabled={page >= totalPages - 1}
                                className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container disabled:opacity-50"
                            >
                                <Icon name="chevron_right" className="text-[16px]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
