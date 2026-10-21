import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import SettlementList from './_components/SettlementList';
import SettlementMetrics from './_components/SettlementMetrics';

export const metadata: Metadata = { title: '정산 내역 관리 | TEAMBUY' };

const QUICK_PERIODS = ['최근 1개월', '최근 3개월', '올해'];

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
            <SettlementMetrics />
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
            {/* 정산 내역을 BE 에서 조회한다 */}
            <SettlementList />
        </div>
    );
}
