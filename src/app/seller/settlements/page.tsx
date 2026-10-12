import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '정산 내역 관리 | TEAMBUY' };

const METRICS = [
    { label: '총 판매 금액 (기간 내)', value: '₩ 124,580,000', note: '+12.4%' },
    { label: '총 플랫폼 수수료', value: '₩ 6,229,000', note: '5.0% 고정' },
    { label: '총 지급 예정액', value: '₩ 118,351,000', note: '정산 대기 1건' },
];

const QUICK_PERIODS = ['최근 1개월', '최근 3개월', '올해'];

const SETTLEMENTS = [
    { id: 'SET-2024-0301', period: '2024.03.01 ~ 2024.03.15', sales: '₩ 42,500,000', fee: '- ₩ 2,125,000', payout: '₩ 40,375,000', done: false },
    { id: 'SET-2024-0215', period: '2024.02.16 ~ 2024.02.29', sales: '₩ 28,100,000', fee: '- ₩ 1,405,000', payout: '₩ 26,695,000', done: true },
    { id: 'SET-2024-0201', period: '2024.02.01 ~ 2024.02.15', sales: '₩ 19,400,000', fee: '- ₩ 970,000', payout: '₩ 18,430,000', done: true },
    { id: 'SET-2024-0115', period: '2024.01.16 ~ 2024.01.31', sales: '₩ 21,380,000', fee: '- ₩ 1,069,000', payout: '₩ 20,311,000', done: true },
    { id: 'SET-2024-0101', period: '2024.01.01 ~ 2024.01.15', sales: '₩ 13,200,000', fee: '- ₩ 660,000', payout: '₩ 12,540,000', done: true },
];

export default function SellerSettlementsPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto space-y-space-xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg border-b border-surface-container-high">
                <div className="flex flex-col space-y-space-xs">
                    <span className="text-caption text-on-surface-variant font-mono uppercase tracking-wider">SETTLEMENT MANAGEMENT</span>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">정산 내역 관리</h1>
                </div>
                <div className="flex items-center gap-space-sm">
                    <span className="text-body-sm text-on-surface-variant">기준 통화:</span>
                    <span className="text-label-md font-mono text-on-surface bg-surface-container px-space-sm py-1 rounded">KRW (₩)</span>
                </div>
            </div>
            {/* Summary Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
                {METRICS.map((metric) => (
                    <div key={metric.label} className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col justify-between">
                        <span className="text-caption text-on-surface-variant uppercase tracking-wider">{metric.label}</span>
                        <div className="mt-space-md flex items-baseline justify-between">
                            <span className="text-headline-md font-mono text-on-surface">{metric.value}</span>
                            <span className="text-caption text-on-surface-variant">{metric.note}</span>
                        </div>
                    </div>
                ))}
                <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col justify-between">
                    <span className="text-caption text-on-surface-variant uppercase tracking-wider">정산 완료 비율</span>
                    <div className="mt-space-md flex items-baseline justify-between">
                        <span className="text-headline-md font-mono text-on-surface">94.2%</span>
                        <Icon name="verified" className="text-on-surface text-[18px]" />
                    </div>
                </div>
            </div>
            {/* Filter Section */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-surface-container-high flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
                <div className="flex flex-wrap items-center gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <label className="text-body-sm text-on-surface-variant" htmlFor="start-date">시작일</label>
                        <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:border-on-surface" id="start-date" type="date" defaultValue="2024-01-01" />
                    </div>
                    <span className="text-on-surface-variant">~</span>
                    <div className="flex items-center gap-space-sm">
                        <label className="text-body-sm text-on-surface-variant" htmlFor="end-date">종료일</label>
                        <input className="h-[42px] px-space-md bg-surface border border-outline-variant rounded text-body-md text-on-surface focus:outline-none focus:border-on-surface" id="end-date" type="date" defaultValue="2024-03-31" />
                    </div>
                    <div className="flex items-center gap-space-xs">
                        {QUICK_PERIODS.map((period) => (
                            <button key={period} className="px-space-md py-2 bg-surface border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-high transition-colors" type="button">
                                {period}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button className="w-full md:w-auto h-[42px] px-space-xl bg-primary text-on-primary rounded text-label-md flex items-center justify-center gap-space-sm hover:opacity-90 transition-opacity" type="button">
                        <Icon name="search" className="text-[18px]" />
                        조회하기
                    </button>
                </div>
            </div>
            {/* Settlement Table Section */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden">
                <div className="px-space-lg py-space-md border-b border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-space-md">
                        <h2 className="text-headline-sm text-on-surface">정산 내역 목록</h2>
                        <span className="text-body-sm text-on-surface-variant">
                            총 <strong className="text-on-surface">5</strong>건
                        </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button className="px-space-md py-1.5 border border-outline-variant rounded text-label-sm text-on-surface flex items-center gap-space-xs hover:bg-surface-container-high" type="button">
                            <Icon name="download" className="text-[16px]" />
                            엑셀 다운로드
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-surface-container-high text-caption text-on-surface-variant font-mono uppercase tracking-wider">
                                <th className="py-space-md px-space-lg">정산 ID / 기간</th>
                                <th className="py-space-md px-space-lg text-right">판매 금액</th>
                                <th className="py-space-md px-space-lg text-right">수수료 (5%)</th>
                                <th className="py-space-md px-space-lg text-right">지급액</th>
                                <th className="py-space-md px-space-lg text-center">상태</th>
                                <th className="py-space-md px-space-lg text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container-high text-body-md text-on-surface">
                            {SETTLEMENTS.map((settlement) => (
                                <tr key={settlement.id} className="hover:bg-surface-container-low/50 transition-colors">
                                    <td className="py-space-md px-space-lg">
                                        <Link href={ROUTES.sellerSettlement(settlement.id)} className="flex flex-col">
                                            <span className="font-mono text-label-sm text-on-surface">{settlement.id}</span>
                                            <span className="text-body-sm text-on-surface-variant">{settlement.period}</span>
                                        </Link>
                                    </td>
                                    <td className="py-space-md px-space-lg text-right font-mono">{settlement.sales}</td>
                                    <td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">{settlement.fee}</td>
                                    <td className="py-space-md px-space-lg text-right font-mono font-semibold">{settlement.payout}</td>
                                    <td className="py-space-md px-space-lg text-center">
                                        {settlement.done ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-primary text-on-primary">정산 완료</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant text-on-surface">정산 예정</span>
                                        )}
                                    </td>
                                    <td className="py-space-md px-space-lg text-center">
                                        <Link className="text-label-sm text-on-surface underline hover:text-outline transition-colors" href={ROUTES.sellerSettlement(settlement.id)}>
                                            상세보기
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Footer */}
                <div className="px-space-lg py-space-md border-t border-surface-container-high flex items-center justify-between bg-surface-container-low/30">
                    <span className="text-body-sm text-on-surface-variant">1-5 of 5 items</span>
                    <div className="flex items-center gap-space-xs">
                        <button className="px-space-md py-1 border border-outline-variant rounded text-label-sm text-outline cursor-not-allowed bg-surface" disabled type="button">이전</button>
                        <button className="px-space-md py-1 bg-primary text-on-primary rounded text-label-sm" type="button">1</button>
                        <button className="px-space-md py-1 border border-outline-variant rounded text-label-sm text-outline cursor-not-allowed bg-surface" disabled type="button">다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
