'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card, EmptyState, Text } from '@astryxdesign/core';
import { useGetMyWalletTransactions } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { transactionTypeInfo } from '../../_components/transactionTypes';

const PAGE_SIZE = 20;
// 페이지 번호는 현재 페이지 앞뒤로 이만큼만 보여 준다.
const PAGE_WINDOW = 2;

// URL 의 page 는 사람이 보는 1부터, BE 요청은 0부터다.
function readPage(raw: string | null): number {
    const page = Number(raw);
    return Number.isInteger(page) && page >= 1 ? page : 1;
}

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-space-sm p-space-md" aria-hidden>
            {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-16 bg-surface-container animate-pulse md:h-12" />
            ))}
        </div>
    );
}

// 예치금 거래 내역 표. 페이지(page)는 URL 쿼리스트링에서 읽는다. BE 는 유형·기간 조건이 없어 최신순 전체를 페이징한다.
export default function TransactionList() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const page = readPage(searchParams.get('page'));

    const query = useGetMyWalletTransactions({ page: page - 1, size: PAGE_SIZE });
    const result = query.data?.data;
    const rows = result?.content ?? [];
    const totalElements = query.isSuccess ? result?.totalElements : undefined;
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
            <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-sm mb-space-xs">
                <Text as="div">
                    {totalElements === undefined ? (query.isError ? '거래 건수를 불러오지 못했습니다.' : '거래 건수 확인 중') : <>총 <span className="font-bold text-primary">{totalElements}</span>건의 거래 내역</>}
                </Text>
                <Text as="span" type="supporting" color="secondary">페이지당 {PAGE_SIZE}건</Text>
            </div>

            <Card padding={0} className="w-full overflow-hidden">
                {query.isPending ? (
                    <TableSkeleton />
                ) : query.isError ? (
                    <div role="alert">
                        <EmptyState
                            title="거래 내역을 불러오지 못했습니다"
                            description={errorMessage(query.error, '잠시 후 다시 시도해 주세요.')}
                            icon={<Icon name="error_outline" />}
                            actions={<Button label="다시 시도" variant="secondary" onClick={() => void query.refetch()} />}
                        />
                    </div>
                ) : rows.length === 0 ? (
                    <EmptyState
                        title={(totalElements ?? 0) > 0 ? '이 페이지에는 거래 내역이 없습니다' : '거래 내역이 없습니다'}
                        description={(totalElements ?? 0) > 0 ? '페이지 번호를 다시 확인하거나 첫 페이지로 이동해 주세요.' : '예치금 거래가 발생하면 최신순으로 표시됩니다.'}
                        icon={<Icon name="receipt_long" />}
                        actions={(totalElements ?? 0) > 0 ? <Button label="첫 페이지로" variant="secondary" onClick={() => goPage(1)} /> : undefined}
                    />
                ) : (
                    <>
                        <div className="divide-y divide-outline-variant md:hidden">
                            {rows.map((tx) => {
                                const info = transactionTypeInfo(tx.transactionType);
                                return (
                                    <article key={tx.transactionId} className="p-space-md">
                                        <div className="flex items-start justify-between gap-space-md">
                                            <div className="min-w-0">
                                                <Badge label={info.label} variant="neutral" />
                                                <Text as="p" weight="semibold" className="mt-space-xs">{info.title}</Text>
                                            </div>
                                            <Text as="span" weight="bold" className={`shrink-0 ${info.amountClassName}`} hasTabularNumbers>
                                                {tx.amount == null ? '-' : `${info.sign}${tx.amount.toLocaleString('ko-KR')}원`}
                                            </Text>
                                        </div>
                                        <div className="mt-space-md grid grid-cols-2 gap-space-sm border-t border-outline-variant pt-space-sm">
                                            <div>
                                                <Text as="span" type="supporting" color="secondary">거래 후 잔액</Text>
                                                <Text as="p" weight="semibold" hasTabularNumbers>{tx.balanceAfter == null ? '-' : `${tx.balanceAfter.toLocaleString('ko-KR')}원`}</Text>
                                            </div>
                                            <div className="text-right">
                                                <Text as="span" type="supporting" color="secondary">일시</Text>
                                                <Text as="p" type="supporting">{formatDateTime(tx.createdAt)}</Text>
                                            </div>
                                        </div>
                                        <Text as="p" type="supporting" color="secondary" className="mt-space-sm break-all">
                                            {tx.orderId != null ? `주문번호: #${tx.orderId} · ` : ''}거래번호: #{tx.transactionId}
                                        </Text>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full border-collapse text-left font-body-sm text-body-sm">
                                <thead>
                                    <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                                        <th className="py-space-md px-space-md w-36 whitespace-nowrap">일시</th>
                                        <th className="py-space-md px-space-sm w-28 text-center whitespace-nowrap">거래 유형</th>
                                        <th className="py-space-md px-space-md">거래 내용 / 주문 번호</th>
                                        <th className="py-space-md px-space-md w-44 text-right whitespace-nowrap">거래 금액</th>
                                        <th className="py-space-md px-space-md w-48 text-right whitespace-nowrap">거래 후 잔액</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {rows.map((tx) => {
                                        const info = transactionTypeInfo(tx.transactionType);
                                        return (
                                            <tr key={tx.transactionId} className="hover:bg-surface-container-low transition-colors">
                                                <td className="py-space-md px-space-md text-on-surface-variant font-caption text-caption whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                                                <td className="py-space-md px-space-sm text-center"><Badge label={info.label} variant="neutral" /></td>
                                                <td className="py-space-md px-space-md">
                                                    <Text as="div" weight="semibold">{info.title}</Text>
                                                    <Text as="div" type="supporting" color="secondary" className="mt-0.5">
                                                        {tx.orderId != null ? `주문번호: #${tx.orderId} · ` : ''}거래번호: #{tx.transactionId}
                                                    </Text>
                                                </td>
                                                <td className={`py-space-md px-space-md text-right whitespace-nowrap font-bold ${info.amountClassName}`}>
                                                    {tx.amount == null ? '-' : `${info.sign}${tx.amount.toLocaleString('ko-KR')}원`}
                                                </td>
                                                <td className="py-space-md px-space-md text-right whitespace-nowrap font-bold text-primary">
                                                    {tx.balanceAfter == null ? '-' : `${tx.balanceAfter.toLocaleString('ko-KR')}원`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </Card>

            <div className="flex flex-col gap-space-md pt-space-lg mt-space-md sm:flex-row sm:items-center sm:justify-between">
                <Text as="div" type="supporting" color="secondary">
                    {totalElements === undefined ? (query.isError ? '표시 범위를 확인할 수 없습니다.' : '표시 범위 확인 중') : `표시 중: ${from} - ${to} (총 ${totalElements} 항목)`}
                </Text>
                <nav aria-label="거래 내역 페이지" className="flex items-center justify-between gap-1 sm:justify-end">
                    <Button label="이전" size="sm" variant="secondary" icon={<Icon name="chevron_left" />} isDisabled={page <= 1} onClick={() => goPage(page - 1)} />
                    <div className="hidden items-center gap-1 sm:flex">
                        {pages.map((n) => (
                            <Button
                                key={n}
                                label={String(n)}
                                aria-current={n === page ? 'page' : undefined}
                                size="sm"
                                variant={n === page ? 'primary' : 'ghost'}
                                onClick={() => goPage(n)}
                            />
                        ))}
                    </div>
                    <Badge label={`${page} / ${Math.max(totalPages, 1)}`} variant="neutral" className="sm:hidden" />
                    <Button label="다음" size="sm" variant="secondary" endContent={<Icon name="chevron_right" />} isDisabled={totalPages === 0 || page >= totalPages} onClick={() => goPage(page + 1)} />
                </nav>
            </div>
        </>
    );
}
