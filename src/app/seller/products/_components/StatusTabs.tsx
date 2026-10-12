'use client';

import { useState } from 'react';

const TABS = [
    { label: '전체', count: 24 },
    { label: '판매 중', count: 18 },
    { label: '판매 중지 (내림)', count: 6 },
];

export default function StatusTabs() {
    const [active, setActive] = useState(0);

    return (
        <div className="flex items-center gap-space-sm">
            {TABS.map((tab, index) => (
                <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActive(index)}
                    className={
                        index === active
                            ? 'px-space-md py-space-sm bg-primary text-on-primary rounded font-label-md transition-all'
                            : 'px-space-md py-space-sm bg-surface-container-high text-on-surface-variant rounded font-label-md hover:bg-surface-container-highest transition-all'
                    }
                >
                    {tab.label} <span className="ml-1 opacity-80 text-caption">{tab.count}</span>
                </button>
            ))}
        </div>
    );
}
