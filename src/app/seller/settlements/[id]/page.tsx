import type { Metadata } from 'next';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import SettlementDetailSummary from './_components/SettlementDetailSummary';
import SettlementDetailTable from './_components/SettlementDetailTable';

export const metadata: Metadata = { title: '정산 상세 | TEAMBUY' };

const WEEKS = ['2024년 10월 4주차 (10.21 ~ 10.27)', '2024년 10월 3주차 (10.14 ~ 10.20)', '2024년 10월 2주차 (10.07 ~ 10.13)'];

export default function SellerSettlementDetailPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Summary Cards Section: 주소의 정산 ID 를 읽는 부분은 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense>
                <SettlementDetailSummary />
            </Suspense>
            {/* Period & Filter Bar */}
            <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant mb-space-lg flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                    <span className="text-label-md text-primary">정산 주차:</span>
                    <select className="h-[42px] px-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md text-primary focus:outline-none focus:border-primary">
                        {WEEKS.map((week) => (
                            <option key={week}>{week}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button className="h-[42px] px-4 border border-outline-variant bg-surface-container-lowest text-primary text-label-md rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-2">
                        <Icon name="download" className="text-[18px]" />
                        정산 내역서 다운로드 (Excel)
                    </button>
                </div>
            </div>
            {/* 정산 ID(지급일-상태)에 묶인 판매 건을 BE 에서 조회한다 */}
            <Suspense>
                <SettlementDetailTable />
            </Suspense>
        </div>
    );
}
