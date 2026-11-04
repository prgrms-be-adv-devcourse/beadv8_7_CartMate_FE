'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GetSellerDeliveriesStatus } from '@/api/generated/model';

type ShippingStatus = (typeof GetSellerDeliveriesStatus)[keyof typeof GetSellerDeliveriesStatus];

// BE 에 상태별 건수를 한 번에 주는 API 가 없어 탭에는 개수를 보여 주지 않는다.
const TABS: { status: ShippingStatus; label: string }[] = [
    { status: GetSellerDeliveriesStatus.REQUESTED, label: '배송 요청' },
    { status: GetSellerDeliveriesStatus.PREPARING, label: '배송 준비' },
    { status: GetSellerDeliveriesStatus.SHIPPING, label: '배송 중' },
    { status: GetSellerDeliveriesStatus.DELIVERED, label: '배송 완료' },
];

// URL 의 status 를 읽는다. 없거나 탭에 없는 값이면 배송 요청이다.
export function readShippingStatus(raw: string | null): ShippingStatus {
    return TABS.find((tab) => tab.status === raw)?.status ?? GetSellerDeliveriesStatus.REQUESTED;
}

// 탭은 선택한 상태를 URL 쿼리스트링(?status=)에 남기고, 목록(ShippingList)이 같은 값을 읽는다.
export default function ShippingStatusTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const active = readShippingStatus(searchParams.get('status'));

    function select(status: ShippingStatus) {
        // 탭을 바꾸면 첫 페이지부터 보여 준다.
        const params = new URLSearchParams(searchParams.toString());
        params.set('status', status);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="flex items-center gap-space-xs">
            {TABS.map((tab) => {
                const isActive = tab.status === active;
                return (
                    <button
                        key={tab.status}
                        type="button"
                        onClick={() => select(tab.status)}
                        className={`px-space-md py-space-sm rounded-lg font-label-md transition-all ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
