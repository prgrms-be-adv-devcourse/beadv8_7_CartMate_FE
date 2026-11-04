'use client';

import Link from 'next/link';
import { useGetMyWalletTransactions } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { transactionTypeInfo } from './transactionTypes';

const RECENT_COUNT = 5;

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-space-sm" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-12 bg-surface-container animate-pulse rounded" />
            ))}
        </div>
    );
}

// 최근 거래 내역. 최신 거래 5건을 BE 거래 내역(페이징)에서 가져온다.
export default function RecentTransactions() {
    const query = useGetMyWalletTransactions({ page: 0, size: RECENT_COUNT });
    const rows = query.data?.data?.content ?? [];

    return (
        <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm">
            <div className="flex items-center justify-between pb-space-md mb-space-md">
                <div className="flex items-center gap-space-sm">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">최근 거래 내역</h3>
                    <span className="px-2 py-0.5 bg-surface-container font-caption text-caption text-secondary rounded">최근 {RECENT_COUNT}건</span>
                </div>
                <div className="flex items-center gap-space-xs font-caption text-caption text-secondary">
                    <span>기준 통화: KRW (₩)</span>
                </div>
            </div>
            {query.isPending ? (
                <TableSkeleton />
            ) : query.isError ? (
                <div className="py-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                    <p className="font-body-md text-body-md text-on-surface">{errorMessage(query.error, '거래 내역을 불러오지 못했습니다.')}</p>
                    <button className="px-space-md py-1.5 border border-outline-variant rounded font-label-sm text-label-sm text-on-surface hover:bg-surface-container" type="button" onClick={() => query.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : rows.length === 0 ? (
                <div className="py-space-xl text-center font-body-md text-body-md text-secondary">거래 내역이 없습니다.</div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                        <thead>
                            <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm">
                                <th className="py-space-sm px-space-md w-44">거래 일시</th>
                                <th className="py-space-sm px-space-md w-28">거래 유형</th>
                                <th className="py-space-sm px-space-md">상세 내용</th>
                                <th className="py-space-sm px-space-md text-right w-40">금액</th>
                                <th className="py-space-sm px-space-md text-right w-44">거래 후 잔액</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-0 text-on-surface">
                            {rows.map((tx, index) => {
                                const info = transactionTypeInfo(tx.transactionType);
                                return (
                                    <tr key={tx.transactionId} className={`hover:bg-surface-container-low/50 transition-colors ${index % 2 === 1 ? 'bg-surface-container-lowest' : ''}`}>
                                        <td className="py-space-md px-space-md text-secondary font-mono text-body-sm">{formatDateTime(tx.createdAt)}</td>
                                        <td className="py-space-md px-space-md">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-caption text-caption font-bold ${info.badgeClassName}`}>{info.label}</span>
                                        </td>
                                        <td className="py-space-md px-space-md">
                                            <div className="font-label-md text-label-md text-on-surface">{info.title}</div>
                                            {/* 거래 내역에는 상품명이 없어 주문 번호만 보여 준다. */}
                                            {tx.orderId != null && <div className="font-caption text-caption text-secondary">주문 #{tx.orderId}</div>}
                                        </td>
                                        <td className={`py-space-md px-space-md text-right font-mono font-bold ${info.amountClassName}`}>
                                            {info.sign}
                                            {(tx.amount ?? 0).toLocaleString('ko-KR')}원
                                        </td>
                                        <td className="py-space-md px-space-md text-right font-mono font-bold text-on-surface">{(tx.balanceAfter ?? 0).toLocaleString('ko-KR')}원</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Table Footer Navigation */}
            <div className="mt-space-lg pt-space-md flex items-center justify-between">
                <div className="font-caption text-caption text-secondary">[최근 {RECENT_COUNT}건만 보여 줍니다. 전체 내역은 거래 내역 화면에서 확인할 수 있습니다]</div>
                <Link className="h-10 px-space-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center gap-space-xs transition-colors" href={ROUTES.depositHistory}>
                    <span>전체 거래 내역 보기</span>
                    <Icon name="chevron_right" className="text-[16px]" />
                </Link>
            </div>
        </div>
    );
}
