'use client';

import { useState } from 'react';

const TABS = [
    { label: '배송 요청', count: 12 },
    { label: '배송 준비', count: 5 },
    { label: '배송 중', count: 28 },
    { label: '배송 완료', count: 142 },
];

export default function ShippingStatusTabs() {
    const [active, setActive] = useState(0);

    return (
        <div className="flex items-center gap-space-xs">
            {TABS.map((tab, index) => {
                const isActive = index === active;
                return (
                    <button
                        key={tab.label}
                        type="button"
                        onClick={() => setActive(index)}
                        className={`px-space-md py-space-sm rounded-lg font-label-md transition-all ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        {tab.label}{' '}
                        <span className={`ml-space-xs px-1.5 py-0.5 rounded text-caption ${isActive ? 'bg-surface/20' : 'bg-surface-container-high'}`}>{tab.count}</span>
                    </button>
                );
            })}
        </div>
    );
}
