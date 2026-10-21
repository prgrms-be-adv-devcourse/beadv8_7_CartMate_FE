'use client';

import Link from 'next/link';
import { useGetMySettlementInfo, useGetMySettlements } from '@/api/generated/payout-controller/payout-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { dotDate, won } from './settlementFormat';

function StatusBadge({ status }: { status: string | undefined }) {
    if (status === 'COMPLETED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-primary text-on-primary">정산 완료</span>;
    if (status === 'PENDING') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant text-on-surface">정산 예정</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant text-on-surface">{status ?? '-'}</span>;
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

// 정산 내역 목록. 같은 지급 예정일·상태의 정산 건은 BE 가 한 줄로 묶어서 내려 준다. (페이징 없음)
export default function SettlementList() {
    const list = useGetMySettlements();
    const info = useGetMySettlementInfo();

    const rows = list.data?.data ?? [];
    const feeRate = info.data?.data?.feeRatePercent;

    return (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden">
            <div className="px-space-lg py-space-md border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                    <h2 className="text-headline-sm text-on-surface">정산 내역 목록</h2>
                    {list.isSuccess && (
                        <span className="text-body-sm text-on-surface-variant">
                            총 <strong className="text-on-surface">{rows.length}</strong>건
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-space-sm">
                    <button className="px-space-md py-1.5 border border-outline-variant rounded text-label-sm text-on-surface flex items-center gap-space-xs hover:bg-surface-container-high" type="button">
                        <Icon name="download" className="text-[16px]" />
                        엑셀 다운로드
                    </button>
                </div>
            </div>
            {list.isPending ? (
                <TableSkeleton />
            ) : list.isError ? (
                <div className="py-space-xl px-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                    <p className="text-body-md text-on-surface">{errorMessage(list.error, '정산 내역을 불러오지 못했습니다.')}</p>
                    <button className="px-space-md py-1.5 border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-high" type="button" onClick={() => list.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : rows.length === 0 ? (
                <div className="py-space-xl px-space-lg text-center text-body-md text-on-surface-variant">정산 내역이 없습니다.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-surface-container-high text-caption text-on-surface-variant font-mono uppercase tracking-wider">
                                <th className="py-space-md px-space-lg">정산 ID / 기간</th>
                                <th className="py-space-md px-space-lg text-right">판매 금액</th>
                                <th className="py-space-md px-space-lg text-right">수수료{feeRate === undefined ? '' : ` (${feeRate}%)`}</th>
                                <th className="py-space-md px-space-lg text-right">지급액</th>
                                <th className="py-space-md px-space-lg text-center">상태</th>
                                <th className="py-space-md px-space-lg text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-high text-body-md text-on-surface">
                            {rows.map((settlement) => (
                                <tr key={settlement.settlementId} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="py-space-md px-space-lg">
                                        <Link href={ROUTES.sellerSettlement(settlement.settlementId)} className="flex flex-col">
                                            <span className="font-mono text-label-sm text-on-surface">{settlement.settlementId}</span>
                                            {/* 정산 기간은 구매확정한 달의 1일부터 말일까지다. 같은 지급일이 상태별로 나뉘어도 구분되도록 지급 예정일도 보여 준다. */}
                                            <span className="text-body-sm text-on-surface-variant">
                                                구매확정 {dotDate(settlement.periodStart)} ~ {dotDate(settlement.periodEnd)} · 지급 {dotDate(settlement.settlementDate)}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="py-space-md px-space-lg text-right font-mono">{won(settlement.salesAmount)}</td>
                                    <td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">- {won(settlement.feeAmount)}</td>
                                    <td className="py-space-md px-space-lg text-right font-mono font-semibold">{won(settlement.payoutAmount)}</td>
                                    <td className="py-space-md px-space-lg text-center">
                                        <StatusBadge status={settlement.status} />
                                    </td>
                                    <td className="py-space-md px-space-lg text-center">
                                        <Link className="text-label-sm text-on-surface underline hover:text-outline transition-colors" href={ROUTES.sellerSettlement(settlement.settlementId)}>
                                            상세보기
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Pagination Footer: BE 정산 목록은 페이징이 없어 한 번에 모두 보여 준다. */}
            <div className="px-space-lg py-space-md border-t border-surface-container-high flex items-center justify-between bg-surface-container-low/30">
                <span className="text-body-sm text-on-surface-variant">{rows.length === 0 ? '0 items' : `1-${rows.length} of ${rows.length} items`}</span>
                <div className="flex items-center gap-space-xs">
                    <button className="px-space-md py-1 border border-outline-variant rounded text-label-sm text-outline cursor-not-allowed bg-surface" disabled type="button">이전</button>
                    <button className="px-space-md py-1 bg-primary text-on-primary rounded text-label-sm" type="button">1</button>
                    <button className="px-space-md py-1 border border-outline-variant rounded text-label-sm text-outline cursor-not-allowed bg-surface" disabled type="button">다음</button>
                </div>
            </div>
        </div>
    );
}
