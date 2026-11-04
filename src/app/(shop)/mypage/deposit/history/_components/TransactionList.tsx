'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
                <div key={i} className="h-12 bg-surface-container animate-pulse" />
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
            {/* Table Utility Bar (Count & Export) */}
            <div className="flex items-center justify-between pb-space-sm mb-space-xs">
                <div className="font-body-sm text-body-sm text-on-surface">
                    총 <span className="font-bold text-primary">{totalElements}</span>건의 거래 내역
                </div>
                <div className="flex items-center gap-space-sm">
                    <button
                        className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface flex items-center gap-1 hover:border-primary"
                        type="button"
                    >
                        <Icon name="file_download" className="text-[16px]" />
                        엑셀 다운로드 (.CSV)
                    </button>
                    <select className="h-8 px-space-xs bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface outline-none">
                        <option>20개씩 보기</option>
                        <option>50개씩 보기</option>
                        <option>100개씩 보기</option>
                    </select>
                </div>
            </div>

            {/* 3. Complete Data Table Structure */}
            <div className="w-full bg-surface-container-lowest border border-outline-variant overflow-x-auto">
                {query.isPending ? (
                    <TableSkeleton />
                ) : query.isError ? (
                    <div className="py-space-xl px-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                        <p className="font-body-md text-body-md text-on-surface">{errorMessage(query.error, '거래 내역을 불러오지 못했습니다.')}</p>
                        <button className="h-8 px-space-md bg-surface-container-lowest border border-outline-variant font-label-sm text-label-sm text-on-surface hover:border-primary" type="button" onClick={() => query.refetch()}>
                            다시 시도
                        </button>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-space-xl px-space-lg text-center font-body-md text-body-md text-on-surface-variant">
                        {totalElements > 0 ? (
                            <>
                                이 페이지에는 거래 내역이 없습니다.{' '}
                                <button className="text-primary font-label-sm underline" type="button" onClick={() => goPage(1)}>
                                    첫 페이지로
                                </button>
                            </>
                        ) : (
                            '거래 내역이 없습니다.'
                        )}
                    </div>
                ) : (
                    <table className="w-full border-collapse text-left font-body-sm text-body-sm">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                                <th className="py-space-md px-space-md w-36 whitespace-nowrap">일시</th>
                                <th className="py-space-md px-space-sm w-28 text-center whitespace-nowrap">거래 유형</th>
                                <th className="py-space-md px-space-md">거래 내용 / 주문 번호</th>
                                <th className="py-space-md px-space-md w-44 text-right whitespace-nowrap">거래 금액</th>
                                <th className="py-space-md px-space-md w-48 text-right whitespace-nowrap">거래 후 잔액</th>
                                <th className="py-space-md px-space-md w-28 text-center whitespace-nowrap">영수증 / 증빙</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {rows.map((tx) => {
                                const info = transactionTypeInfo(tx.transactionType);
                                return (
                                    <tr key={tx.transactionId} className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-space-md px-space-md text-on-surface-variant font-caption text-caption whitespace-nowrap">{formatDateTime(tx.createdAt)}</td>
                                        <td className="py-space-md px-space-sm text-center">
                                            <span className="inline-block px-2 py-0.5 border border-outline-variant bg-surface-container text-on-surface font-caption text-caption font-semibold">{info.label}</span>
                                        </td>
                                        <td className="py-space-md px-space-md">
                                            <div className="font-label-md text-label-md text-on-surface">{info.title}</div>
                                            <div className="font-caption text-caption text-outline flex items-center gap-space-xs mt-0.5">
                                                {tx.orderId != null && (
                                                    <>
                                                        <span>주문번호: #{tx.orderId}</span>
                                                        <span>·</span>
                                                    </>
                                                )}
                                                <span>거래번호: #{tx.transactionId}</span>
                                            </div>
                                        </td>
                                        <td className={`py-space-md px-space-md text-right font-label-md text-label-md whitespace-nowrap font-bold ${info.amountClassName}`}>
                                            {info.sign}
                                            {(tx.amount ?? 0).toLocaleString('ko-KR')}원
                                        </td>
                                        <td className="py-space-md px-space-md text-right whitespace-nowrap">
                                            <div className="font-label-md text-label-md text-primary font-bold">{(tx.balanceAfter ?? 0).toLocaleString('ko-KR')}원</div>
                                        </td>
                                        <td className="py-space-md px-space-md text-center whitespace-nowrap">
                                            {/* 영수증 API 는 아직 없다. */}
                                            <button className="h-7 px-space-sm bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface hover:border-primary" type="button">
                                                영수증
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 4. Pagination Navigation Bar */}
            <div className="flex items-center justify-between pt-space-lg mt-space-md">
                <div className="font-caption text-caption text-outline">
                    표시 중: {from} - {to} (총 {totalElements} 항목)
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm hover:border-primary disabled:text-outline disabled:cursor-not-allowed flex items-center gap-0.5"
                        disabled={page <= 1}
                        type="button"
                        onClick={() => goPage(page - 1)}
                    >
                        <Icon name="chevron_left" className="text-[16px]" />
                        이전
                    </button>
                    {pages.map((n) => (
                        <button
                            key={n}
                            aria-current={n === page ? 'page' : undefined}
                            className={
                                n === page
                                    ? 'w-8 h-8 bg-primary text-on-primary border border-primary font-label-sm text-label-sm flex items-center justify-center'
                                    : 'w-8 h-8 bg-surface-container-lowest text-on-surface border border-outline-variant font-label-sm text-label-sm hover:border-primary flex items-center justify-center'
                            }
                            type="button"
                            onClick={() => goPage(n)}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm hover:border-primary disabled:text-outline disabled:cursor-not-allowed flex items-center gap-0.5"
                        disabled={totalPages === 0 || page >= totalPages}
                        type="button"
                        onClick={() => goPage(page + 1)}
                    >
                        다음
                        <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                </div>
                <div className="w-24" />
            </div>
        </>
    );
}
