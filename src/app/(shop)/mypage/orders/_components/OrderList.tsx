'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useGetMyList } from '@/api/generated/order-controller/order-controller';
import { useGetMyList3 } from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { parseKst } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import {
    byNewest,
    formatDate,
    KIND_LABEL,
    personalRow,
    sharedRow,
    STATUS_TONE_CLASS,
    TAB_KINDS,
    type OrderRow,
    type OrderTab,
} from '../_lib/orderView';

const PAGE_SIZE = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

const TABS: { key: OrderTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'personal', label: '개인구매' },
    { key: 'group', label: '공동구매' },
];

const PERIODS = [
    { value: 0, label: '전체 기간' },
    { value: 30, label: '최근 1개월' },
    { value: 90, label: '최근 3개월' },
    { value: 180, label: '최근 6개월' },
];

const TAB_ACTIVE = 'px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded transition-colors';
const TAB_INACTIVE =
    'px-space-md py-2 bg-surface text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm rounded transition-colors border border-outline-variant';
const SMALL_BUTTON =
    'h-8 px-3 whitespace-nowrap border border-outline-variant bg-surface hover:bg-surface-container hover:border-primary font-label-sm text-label-sm rounded transition-colors inline-flex items-center justify-center';

// 주문 내역: 개인 주문과 공동 주문을 합쳐 최신순으로 보여 준다.
// BE 목록은 페이지 없이 전부 내려오므로 구분·기간·검색·페이지는 화면에서 나눈다.
export default function OrderList() {
    const personal = useGetMyList();
    const shared = useGetMyList3();
    const [tab, setTab] = useState<OrderTab>('all');
    const [period, setPeriod] = useState(0);
    // 기간 필터 기준 시각. 렌더 중에 현재 시각을 읽으면 프리렌더 값이 굳으므로(cacheComponents) 기간을 고를 때 계산한다.
    const [since, setSince] = useState<number | null>(null);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);

    const rows = useMemo(
        () => [...(personal.data?.data ?? []).map(personalRow), ...(shared.data?.data ?? []).map(sharedRow)].sort(byNewest),
        [personal.data, shared.data],
    );

    const filtered = useMemo(() => {
        const word = keyword.trim().toLowerCase();
        return rows.filter((row) => {
            if (!TAB_KINDS[tab].includes(row.kind)) return false;
            if (since !== null && (parseKst(row.createdAt)?.getTime() ?? 0) < since) return false;
            return !word || row.title.toLowerCase().includes(word) || row.orderNumber.toLowerCase().includes(word);
        });
    }, [rows, tab, since, keyword]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const counts = Object.fromEntries(TABS.map((t) => [t.key, rows.filter((row) => TAB_KINDS[t.key].includes(row.kind)).length])) as Record<OrderTab, number>;

    const loading = personal.isPending || shared.isPending;
    // 한쪽만 실패하면 받은 쪽은 보여 주고 실패한 쪽만 안내한다.
    const failures = [
        personal.isError && { label: '개인 주문', error: personal.error, retry: () => void personal.refetch() },
        shared.isError && { label: '공동 주문', error: shared.error, retry: () => void shared.refetch() },
    ].filter((f) => f !== false);

    const resetPage = () => setPage(1);

    return (
        <>
            {/* 구분 탭 · 기간 · 검색 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs border-b md:border-b-0 border-outline-variant pb-space-sm md:pb-0" role="group" aria-label="주문 구분">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            className={tab === item.key ? TAB_ACTIVE : TAB_INACTIVE}
                            type="button"
                            aria-pressed={tab === item.key}
                            onClick={() => {
                                setTab(item.key);
                                resetPage();
                            }}
                        >
                            {item.label} {!loading && <span className="ml-1 opacity-75">{counts[item.key]}</span>}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-space-xs">
                    <select
                        className="h-9 px-space-sm border border-outline-variant bg-surface-container-lowest font-body-sm text-on-surface outline-none rounded"
                        aria-label="조회 기간"
                        value={period}
                        onChange={(e) => {
                            const days = Number(e.target.value);
                            setPeriod(days);
                            setSince(days > 0 ? Date.now() - days * DAY_MS : null);
                            resetPage();
                        }}
                    >
                        {PERIODS.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                    <label className="h-9 border border-outline-variant bg-surface-container-lowest flex items-center px-space-xs rounded">
                        <Icon name="search" className="text-[16px] text-outline" />
                        <input
                            className="bg-transparent border-none outline-none font-body-sm text-on-surface w-40 px-1"
                            placeholder="상품명/주문번호 검색"
                            type="search"
                            aria-label="상품명 또는 주문번호 검색"
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                resetPage();
                            }}
                        />
                    </label>
                </div>
            </div>

            {failures.map((f) => (
                <div key={f.label} className="p-space-sm bg-error-container text-on-error-container rounded flex items-center justify-between gap-space-sm font-body-sm text-body-sm" role="alert">
                    <span>
                        {f.label} 내역을 불러오지 못했습니다. {errorMessage(f.error, '')}
                    </span>
                    <button className="h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-on-surface rounded shrink-0" type="button" onClick={f.retry}>
                        다시 시도
                    </button>
                </div>
            ))}

            {/* 주문 표 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container text-on-surface-variant font-caption text-caption uppercase">
                                <th scope="col" className="p-space-md font-semibold">주문일 / 주문번호</th>
                                <th scope="col" className="p-space-md font-semibold">대표 상품명 및 수량</th>
                                <th scope="col" className="p-space-md font-semibold text-center">구분</th>
                                <th scope="col" className="p-space-md font-semibold text-center">상태</th>
                                <th scope="col" className="p-space-md font-semibold text-right">결제 금액</th>
                                <th scope="col" className="p-space-md font-semibold text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-body-sm text-on-surface">
                            {loading
                                ? [0, 1, 2].map((i) => (
                                      <tr key={i} aria-hidden>
                                          <td colSpan={6} className="p-space-md">
                                              <div className="h-10 rounded bg-surface-container animate-pulse" />
                                          </td>
                                      </tr>
                                  ))
                                : visible.map((row) => <OrderTableRow key={row.key} row={row} />)}
                            {!loading && visible.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-space-xl text-center text-on-surface-variant">
                                        <EmptyMessage hasAny={rows.length > 0} hasFailure={failures.length > 0} />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length > 0 && (
                    <div className="p-space-md border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                        <div className="font-caption text-caption text-outline">
                            총 {filtered.length}건 중 {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)}건 표시
                        </div>
                        {pageCount > 1 && <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />}
                    </div>
                )}
            </div>
        </>
    );
}

function OrderTableRow({ row }: { row: OrderRow }) {
    return (
        <tr className="hover:bg-surface-container/50 transition-colors">
            <td className="p-space-md align-top whitespace-nowrap">
                <div className="font-bold text-on-surface">{formatDate(row.createdAt)}</div>
                <div className="font-caption text-outline mt-0.5">{row.orderNumber}</div>
            </td>
            <td className="p-space-md align-top">
                <Link href={row.href} className="font-bold text-on-surface line-clamp-1 hover:text-primary">
                    {row.title}
                </Link>
                <div className="font-caption text-on-surface-variant mt-0.5">{row.subtitle}</div>
            </td>
            <td className="p-space-md align-top text-center whitespace-nowrap">
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-caption ${
                        row.kind === 'PERSONAL' ? 'border-outline-variant bg-surface text-on-surface-variant' : 'border-outline font-bold bg-surface-container text-on-surface'
                    }`}
                >
                    {KIND_LABEL[row.kind]}
                </span>
            </td>
            <td className="p-space-md align-top text-center whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-caption font-bold ${STATUS_TONE_CLASS[row.status.tone]}`}>{row.status.label}</span>
            </td>
            <td className="p-space-md align-top text-right whitespace-nowrap">
                <div className="font-bold font-headline-sm text-headline-sm">{formatPrice(row.amount)}</div>
                {row.amountNote && <div className="font-caption text-caption text-outline mt-0.5">{row.amountNote}</div>}
            </td>
            <td className="p-space-md align-top text-center">
                <div className="flex flex-col items-center gap-1">
                    <Link href={row.href} className={SMALL_BUTTON}>
                        {row.kind === 'SHARED_GROUP' ? '주문 현황' : '상세보기'}
                    </Link>
                    {row.payHref && (
                        <Link href={row.payHref} className="h-8 px-3 whitespace-nowrap bg-primary text-on-primary font-label-sm text-label-sm rounded inline-flex items-center justify-center hover:opacity-90">
                            결제하기
                        </Link>
                    )}
                </div>
            </td>
        </tr>
    );
}

function EmptyMessage({ hasAny, hasFailure }: { hasAny: boolean; hasFailure: boolean }) {
    if (hasAny) return <p>조건에 맞는 주문이 없습니다.</p>;
    if (hasFailure) return <p>표시할 주문이 없습니다.</p>;
    return (
        <div className="flex flex-col items-center gap-space-sm">
            <Icon name="receipt_long" className="text-[32px] text-outline" />
            <p>아직 주문 내역이 없습니다.</p>
            <Link href={ROUTES.home} className={SMALL_BUTTON}>
                쇼핑하러 가기
            </Link>
        </div>
    );
}

// 현재 페이지 앞뒤 2쪽까지만 번호를 보여 준다.
function pageWindow(page: number, pageCount: number): number[] {
    const start = Math.max(1, Math.min(page - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
    const base = 'w-8 h-8 border rounded flex items-center justify-center font-label-sm text-label-sm disabled:opacity-40';
    return (
        <nav className="flex items-center gap-1" aria-label="페이지">
            <button className={`${base} border-outline-variant bg-surface text-on-surface`} type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="이전 페이지">
                &lt;
            </button>
            {pageWindow(page, pageCount).map((n) => (
                <button
                    key={n}
                    className={n === page ? `${base} border-primary bg-primary text-on-primary` : `${base} border-outline-variant bg-surface text-on-surface hover:bg-surface-container`}
                    type="button"
                    aria-current={n === page ? 'page' : undefined}
                    onClick={() => onChange(n)}
                >
                    {n}
                </button>
            ))}
            <button
                className={`${base} border-outline-variant bg-surface text-on-surface`}
                type="button"
                disabled={page >= pageCount}
                onClick={() => onChange(page + 1)}
                aria-label="다음 페이지"
            >
                &gt;
            </button>
        </nav>
    );
}
