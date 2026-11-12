import type { Metadata } from 'next';
import { Heading } from '@astryxdesign/core';
import SettlementList from './_components/SettlementList';
import SettlementMetrics from './_components/SettlementMetrics';

export const metadata: Metadata = { title: '정산 내역 관리 | TEAMBUY' };

export default function SellerSettlementsPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto space-y-space-xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg border-b border-surface-container-high">
                <div className="flex flex-col space-y-space-xs">
                    <span className="text-caption text-on-surface-variant font-mono uppercase tracking-wider">SETTLEMENT MANAGEMENT</span>
                    <Heading level={1}>정산 내역 관리</Heading>
                </div>
                <div className="flex items-center gap-space-sm">
                    <span className="text-body-sm text-on-surface-variant">기준 통화:</span>
                    <span className="text-label-md font-mono text-on-surface bg-surface-container px-space-sm py-1 rounded">KRW (₩)</span>
                </div>
            </div>
            {/* Summary Metric Cards */}
            <SettlementMetrics />
            {/* 정산 내역을 BE 에서 조회한다 */}
            <SettlementList />
        </div>
    );
}
