'use client';

import { STATUS_TABS, type DeliveryStatus } from './delivery';

type Props = {
    active: DeliveryStatus;
    // 상태별 건수. 아직 못 받았으면 undefined로 두고 '-'를 보여 준다.
    counts: Partial<Record<DeliveryStatus, number>>;
    onChange: (status: DeliveryStatus) => void;
};

export default function ShippingStatusTabs({ active, counts, onChange }: Props) {
    return (
        <div role="group" aria-label="배송 상태" className="flex flex-wrap items-center gap-space-xs">
            {STATUS_TABS.map((tab) => {
                const isActive = tab.status === active;
                const count = counts[tab.status];
                return (
                    <button
                        key={tab.status}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onChange(tab.status)}
                        className={`px-space-md py-space-sm rounded-lg font-label-md transition-all ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        {tab.label}{' '}
                        <span className={`ml-space-xs px-1.5 py-0.5 rounded text-caption ${isActive ? 'bg-surface/20' : 'bg-surface-container-high'}`}>
                            {count ?? '-'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
