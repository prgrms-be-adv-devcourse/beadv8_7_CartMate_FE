'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
    useGetAdminSalesPostCounts,
    useGetAdminSalesPosts,
} from '@/api/generated/admin-sales-post-controller/admin-sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { statusOf, won, type PostStatus } from './postStatus';

const PAGE_SIZE = 20;

const TABS: { value: PostStatus | ''; label: string }[] = [
    { value: '', label: '전체' },
    { value: 'ON_SALE', label: '판매 중' },
    { value: 'PAUSED', label: '판매자 내림' },
    { value: 'SUSPENDED', label: '관리자 숨김' },
    { value: 'CLOSED', label: '판매 종료' },
];

// 관리자 판매글 목록: 상태별 개수, 상태 탭, 제목 검색, 페이지
export default function AdminPostsContent() {
    const [status, setStatus] = useState<PostStatus | ''>('');
    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);

    const counts = useGetAdminSalesPostCounts({ query: { staleTime: 0 } });
    const list = useGetAdminSalesPosts(
        { status: status || undefined, keyword: keyword || undefined, page, size: PAGE_SIZE },
        { query: { staleTime: 0 } },
    );

    const c = counts.data?.data;
    const pageData = list.data?.data;
    const posts = pageData?.content ?? [];
    const totalPages = pageData?.totalPages ?? 0;

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setKeyword(keywordInput.trim());
        setPage(0);
    };

    const metrics = [
        { label: '전체 판매글', icon: 'inventory_2', value: c?.total, tab: '' as const, danger: false },
        { label: '판매 중', icon: 'visibility', value: c?.onSale, tab: 'ON_SALE' as const, danger: false },
        { label: '판매자 내림', icon: 'pause_circle', value: c?.pausedBySeller, tab: 'PAUSED' as const, danger: false },
        { label: '관리자 숨김', icon: 'visibility_off', value: c?.suspendedByAdmin, tab: 'SUSPENDED' as const, danger: true },
    ];

    return (
        <div className="flex flex-col gap-space-lg">
            <div>
                <div className="font-caption text-caption text-outline uppercase tracking-wider mb-1">[ ADMIN / POSTS ]</div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">판매글 관리</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                    판매글을 숨기면 새 구매가 막히고, 발송 전 진행 중인 주문은 자동으로 취소·환불됩니다.
                </p>
            </div>

            {/* 상태별 개수 (누르면 해당 탭) */}
            <div className="grid grid-cols-4 gap-space-md">
                {metrics.map((m) => (
                    <button
                        key={m.label}
                        type="button"
                        onClick={() => {
                            setStatus(m.tab);
                            setPage(0);
                        }}
                        className={`text-left bg-surface-container-lowest p-space-md border rounded flex flex-col gap-space-xs hover:border-primary transition-colors ${
                            status === m.tab ? 'border-primary' : 'border-outline-variant'
                        }`}
                    >
                        <div className="flex items-center justify-between font-label-sm text-label-sm text-outline">
                            <span>{m.label}</span>
                            <Icon name={m.icon} className="text-[18px]" />
                        </div>
                        <div
                            className={`font-headline-md text-headline-md font-bold ${
                                m.danger && (m.value ?? 0) > 0 ? 'text-error' : 'text-on-surface'
                            }`}
                        >
                            {counts.isPending ? '…' : `${(m.value ?? 0).toLocaleString('ko-KR')}건`}
                        </div>
                    </button>
                ))}
            </div>

            {/* 탭 + 검색 */}
            <div className="flex items-center justify-between gap-space-md flex-wrap">
                <div className="flex gap-space-xs">
                    {TABS.map((t) => (
                        <button
                            key={t.label}
                            type="button"
                            onClick={() => {
                                setStatus(t.value);
                                setPage(0);
                            }}
                            className={`h-8 px-space-md rounded border font-label-sm text-label-sm transition-colors ${
                                status === t.value
                                    ? 'bg-primary text-on-primary border-primary'
                                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <form onSubmit={onSearch} className="flex gap-space-xs">
                    <input
                        className="h-8 w-64 px-space-sm border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-body-sm outline-none focus:border-primary"
                        placeholder="판매글 제목 검색"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                    />
                    <button className="h-8 px-space-md border border-outline-variant rounded font-label-sm text-label-sm hover:border-primary" type="submit">
                        검색
                    </button>
                </form>
            </div>

            {/* 목록 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
                            <th className="py-space-md px-space-md w-20">번호</th>
                            <th className="py-space-md px-space-sm w-20 text-center">이미지</th>
                            <th className="py-space-md px-space-md">판매글</th>
                            <th className="py-space-md px-space-md w-40">판매자</th>
                            <th className="py-space-md px-space-md w-32 text-right">최저가</th>
                            <th className="py-space-md px-space-md w-32 text-center">상태</th>
                            <th className="py-space-md px-space-md w-36 text-center">등록일</th>
                            <th className="py-space-md px-space-md w-24 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                        {list.isPending ? (
                            <tr>
                                <td colSpan={8} className="py-space-xl text-center text-outline">불러오는 중…</td>
                            </tr>
                        ) : list.isError ? (
                            <tr>
                                <td colSpan={8} className="py-space-xl text-center text-error">
                                    {errorMessage(list.error, '판매글을 불러오지 못했습니다.')}
                                </td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-space-xl text-center text-outline">조건에 맞는 판매글이 없습니다.</td>
                            </tr>
                        ) : (
                            posts.map((p) => {
                                const s = statusOf(p.status);
                                return (
                                    <tr key={p.id} className="hover:bg-surface-container-low">
                                        <td className="py-space-sm px-space-md font-mono text-outline">#{p.id}</td>
                                        <td className="py-space-sm px-space-sm">
                                            {p.thumbnailUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={p.thumbnailUrl} alt="" className="w-12 h-12 object-cover rounded border border-outline-variant mx-auto" />
                                            ) : (
                                                <div className="w-12 h-12 rounded bg-surface-container mx-auto flex items-center justify-center">
                                                    <Icon name="image" className="text-outline text-[18px]" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-space-sm px-space-md">
                                            <Link href={ROUTES.adminPost(p.id ?? 0)} className="font-label-md text-label-md text-primary font-semibold hover:underline">
                                                {p.title}
                                            </Link>
                                            <div className="font-caption text-caption text-outline">상품 {p.productCount ?? 0}개 · 조회 {p.viewCount ?? 0}</div>
                                        </td>
                                        <td className="py-space-sm px-space-md text-on-surface-variant">{p.sellerName ?? `판매자 #${p.sellerId}`}</td>
                                        <td className="py-space-sm px-space-md text-right">{won(p.minPrice)}</td>
                                        <td className="py-space-sm px-space-md text-center">
                                            <span className={s.badge}>
                                                <span className={s.dot} />
                                                {s.label}
                                            </span>
                                        </td>
                                        <td className="py-space-sm px-space-md text-center text-outline">{formatDateTime(p.createdAt)}</td>
                                        <td className="py-space-sm px-space-md text-center">
                                            <Link
                                                href={ROUTES.adminPost(p.id ?? 0)}
                                                className="inline-flex items-center h-8 px-space-sm border border-outline-variant text-primary rounded font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap"
                                            >
                                                상세
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지 */}
            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-space-xs" aria-label="페이지">
                    <button
                        type="button"
                        className="w-8 h-8 border border-outline-variant rounded disabled:opacity-40"
                        onClick={() => setPage((v) => Math.max(v - 1, 0))}
                        disabled={page === 0}
                        aria-label="이전 페이지"
                    >
                        <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    <span className="font-label-sm text-label-sm text-on-surface-variant px-space-sm">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        type="button"
                        className="w-8 h-8 border border-outline-variant rounded disabled:opacity-40"
                        onClick={() => setPage((v) => Math.min(v + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                        aria-label="다음 페이지"
                    >
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </nav>
            )}
        </div>
    );
}