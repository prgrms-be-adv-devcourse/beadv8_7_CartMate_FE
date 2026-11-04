import type { Metadata } from 'next';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import SettlementDetailSummary from './_components/SettlementDetailSummary';
import SettlementDetailTable from './_components/SettlementDetailTable';
import SettlementSwitcher from './_components/SettlementSwitcher';

export const metadata: Metadata = { title: '정산 상세 | TEAMBUY' };

export default function SellerSettlementDetailPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Summary Cards Section: 주소의 정산 ID 를 읽는 부분은 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense>
                <SettlementDetailSummary />
            </Suspense>
            {/* Period & Filter Bar */}
            <div className="bg-surface-container-lowest p-space-md rounded-lg border border-outline-variant mb-space-lg flex items-center justify-between">
                {/* 내 정산 목록에서 골라 다른 정산의 상세로 이동한다 */}
                <Suspense>
                    <SettlementSwitcher />
                </Suspense>
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
