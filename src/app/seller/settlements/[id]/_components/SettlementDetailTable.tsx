'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetMySettlementDetail } from '@/api/generated/payout-controller/payout-controller';
import { errorMessage } from '@/api/http';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { won } from '../../_components/settlementFormat';

function TableSkeleton() {
    return (
        <div className="flex flex-col gap-space-sm p-space-lg" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-12 bg-surface-container animate-pulse rounded-lg" />
            ))}
        </div>
    );
}

// 정산 상세의 판매 건 목록. 정산 ID(지급일-상태)에 묶인 판매 건을 구매확정이 최근인 순으로 보여 준다.
// 상태가 바뀌면 정산 ID 도 바뀌므로(예: 지급되면 PENDING → COMPLETED), 못 찾으면 목록에서 다시 선택하도록 안내한다.
export default function SettlementDetailTable() {
    const { id } = useParams<{ id: string }>();
    const detail = useGetMySettlementDetail(id);

    const data = detail.data?.data;
    const items = data?.items ?? [];

    return (
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
            <div className="px-space-lg py-space-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                <div>
                    <h2 className="text-headline-sm font-headline-sm text-primary">포함된 판매 건 목록</h2>
                    {data && <p className="text-body-sm text-on-surface-variant mt-0.5">선택된 정산 기간 동안 완료된 총 {items.length}건의 거래 내역입니다.</p>}
                </div>
                {data && (
                    <div className="text-body-sm text-on-surface-variant">
                        총 건수: <span className="font-label-md text-primary">{items.length}건</span>
                    </div>
                )}
            </div>
            {detail.isPending ? (
                <TableSkeleton />
            ) : detail.isError ? (
                <div className="py-space-xl px-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                    <p className="text-body-md text-primary">{errorMessage(detail.error, '정산 상세를 불러오지 못했습니다.')}</p>
                    <p className="text-body-sm text-on-surface-variant">정산 상태가 바뀌면 정산 ID 도 바뀝니다. 목록에서 다시 선택해 주세요.</p>
                    <Link className="text-label-md text-primary underline" href={ROUTES.sellerSettlements}>
                        정산 목록으로
                    </Link>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container text-caption text-on-surface-variant">
                                    <th className="py-3 px-6 font-label-md">주문일시</th>
                                    <th className="py-3 px-6 font-label-md">상품명</th>
                                    <th className="py-3 px-6 font-label-md text-center">수량</th>
                                    <th className="py-3 px-6 font-label-md text-right">결제금액</th>
                                    <th className="py-3 px-6 font-label-md text-right">정산금액 (수수료 제외)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant text-body-md text-primary">
                                {items.map((sale) => (
                                    <tr key={sale.payoutId} className="hover:bg-surface-container-low transition-colors">
                                        {/* 상품명·수량·주문일시는 옛 정산에는 기록되어 있지 않을 수 있다. */}
                                        <td className="py-4 px-6 text-body-sm text-on-surface-variant">{formatDateTime(sale.orderedAt)}</td>
                                        <td className="py-4 px-6 font-medium">{sale.productName ?? '상품 정보 없음'}</td>
                                        <td className="py-4 px-6 text-center">{sale.quantity ?? '-'}</td>
                                        <td className="py-4 px-6 text-right font-mono">{won(sale.salesAmount)}</td>
                                        <td className="py-4 px-6 text-right font-mono font-medium text-primary">{won(sale.payoutAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-surface-container-low border-t border-outline-variant font-label-md text-primary">
                                    <td className="py-4 px-6 text-right" colSpan={2}>합계</td>
                                    <td className="py-4 px-6 text-center">{data?.totalQuantity ?? 0}</td>
                                    <td className="py-4 px-6 text-right font-mono">{won(data?.salesAmount)}</td>
                                    <td className="py-4 px-6 text-right font-mono text-on-surface">{won(data?.payoutAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {/* Pagination Footer: BE 정산 상세는 페이징이 없어 한 번에 모두 보여 준다. */}
                    <div className="px-space-lg py-space-md border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
                        <div className="text-body-sm text-on-surface-variant">{items.length === 0 ? 'Showing 0 entries' : `Showing 1 to ${items.length} of ${items.length} entries`}</div>
                        <div className="flex items-center gap-1">
                            <button className="px-3 h-8 border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-caption rounded-lg disabled:opacity-50" disabled>Prev</button>
                            <button className="px-3 h-8 border border-primary bg-primary text-on-primary text-caption rounded-lg">1</button>
                            <button className="px-3 h-8 border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-caption rounded-lg disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
