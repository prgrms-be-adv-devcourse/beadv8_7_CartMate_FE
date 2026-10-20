'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMyList1 } from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import type { SharedGroupPurchaseSummaryResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { statusBadgeClass, statusLabel } from '../_lib/sharedGroupPurchase';

type Filter = 'all' | 'created' | 'joined';

const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'created', label: '내가 만든' },
    { key: 'joined', label: '참여한' },
];

const TAB_ACTIVE = 'h-9 px-space-md bg-primary text-on-primary font-label-sm text-label-sm rounded';
const TAB_INACTIVE =
    'h-9 px-space-md bg-surface-container-lowest text-on-surface-variant border border-outline-variant font-label-sm text-label-sm rounded hover:bg-surface-container';

type Row = SharedGroupPurchaseSummaryResponse & { id: number };

// 내가 만들었거나 참여한 공동물품 공동구매 목록 (최근 만든 순, BE 정렬 그대로)
export default function MyGroupPurchaseList() {
    const [filter, setFilter] = useState<Filter>('all');
    const list = useGetMyList1();

    const rows = (list.data?.data ?? []).filter((row): row is Row => typeof row.id === 'number');
    const visible = rows.filter((row) => filter === 'all' || (filter === 'created' ? row.creator : !row.creator));

    return (
        <section className="flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs" role="tablist" aria-label="공동구매 종류">
                    <button className={TAB_ACTIVE} type="button" role="tab" aria-selected>
                        공동물품 (N빵)
                    </button>
                    {/* 개인물품 공동구매는 별도 화면에서 관리한다 */}
                    <Link className={TAB_INACTIVE} href={ROUTES.groupPurchasesIndividual} role="tab" aria-selected={false}>
                        개인물품
                    </Link>
                </div>
                <div className="flex items-center gap-space-xs">
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            className={`px-2 py-1 font-label-sm text-label-sm ${
                                filter === item.key ? 'font-bold text-on-surface border-b border-primary' : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                            type="button"
                            aria-pressed={filter === item.key}
                            onClick={() => setFilter(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {list.isPending ? (
                <div className="flex flex-col gap-space-sm" aria-hidden>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-28 bg-surface-container-low animate-pulse" />
                    ))}
                </div>
            ) : list.isError ? (
                <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center" role="alert">
                    <p className="font-body-md text-body-md text-on-surface">{errorMessage(list.error, '공동구매 목록을 불러오지 못했습니다.')}</p>
                    <button className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md" type="button" onClick={() => void list.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : visible.length === 0 ? (
                <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
                    <Icon name="groups" className="text-[40px] text-outline" />
                    <p className="font-body-md text-body-md text-on-surface">
                        {rows.length === 0 ? '아직 만들거나 참여한 공동구매가 없습니다.' : '해당하는 공동구매가 없습니다.'}
                    </p>
                    {rows.length === 0 && (
                        <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={ROUTES.groupPurchaseNew}>
                            공동구매 만들기
                        </Link>
                    )}
                </div>
            ) : (
                <ul className="flex flex-col gap-space-sm">
                    {visible.map((row) => (
                        <li key={row.id}>
                            <GroupPurchaseCard row={row} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function GroupPurchaseCard({ row }: { row: Row }) {
    const count = row.participantCount ?? 0;
    const max = row.maxParticipants ?? 0;
    const percent = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

    return (
        <Link
            className="group block bg-surface-container-lowest border border-outline-variant hover:border-primary transition-colors p-space-md"
            href={ROUTES.groupPurchase(row.id)}
        >
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-sm">
                <div className="flex flex-wrap items-center gap-space-xs">
                    <span className={statusBadgeClass(row.status, row.editable)}>{statusLabel(row.status, row.editable)}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded border border-outline-variant font-caption text-caption text-on-surface-variant">
                        {row.creator ? '내가 만든' : '참여 중'}
                    </span>
                    <span className="font-caption text-caption text-outline">#{row.id}</span>
                </div>
                <span className="font-caption text-caption text-outline">수정 마감 {formatDateTime(row.editDeadlineAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-space-md">
                <h3 className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary truncate">{row.title}</h3>
                <Icon name="arrow_forward" className="text-outline text-[18px] shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-space-sm flex flex-col gap-1">
                <div className="w-full h-2 bg-surface-container border border-outline-variant overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
                <span className="font-caption text-caption text-outline">
                    참여 {count} / {max}명
                </span>
            </div>
        </Link>
    );
}
