'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetMySettlements } from '@/api/generated/payout-controller/payout-controller';
import { ROUTES } from '@/lib/routes';
import { dotDate } from '../../_components/settlementFormat';

const STATUS_LABEL: Record<string, string> = {
    PENDING: '정산 예정',
    COMPLETED: '정산 완료',
};

// 다른 정산으로 이동하는 드롭다운. 내 정산 목록(지급일·상태)에서 고르면 그 정산의 상세로 이동한다.
// 지급되어 정산 ID 가 바뀌는 등 현재 정산이 목록에 없으면 "정산을 선택하세요"로 보여 준다.
export default function SettlementSwitcher() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const list = useGetMySettlements();

    const rows = list.data?.data ?? [];
    const value = rows.some((row) => row.settlementId === id) ? id : '';

    return (
        <div className="flex items-center gap-space-md">
            <span className="text-label-md text-primary">정산 선택:</span>
            <select
                className="h-[42px] px-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-body-md text-primary focus:outline-none focus:border-primary"
                value={value}
                disabled={!list.isSuccess}
                onChange={(e) => {
                    if (e.target.value) router.push(ROUTES.sellerSettlement(e.target.value));
                }}
            >
                {value === '' && <option value="">{list.isSuccess ? '정산을 선택하세요' : '불러오는 중…'}</option>}
                {rows.map((row) => (
                    <option key={row.settlementId} value={row.settlementId}>
                        {dotDate(row.settlementDate)} 지급 · {STATUS_LABEL[row.status ?? ''] ?? row.status} (구매확정 {dotDate(row.periodStart)} ~ {dotDate(row.periodEnd)})
                    </option>
                ))}
            </select>
        </div>
    );
}
