'use client';

import { useState } from 'react';

const TABS = ['전체 (12)', '처리대기 (5)', '처리완료 (7)'];

export default function ClaimStatusTabs() {
    const [active, setActive] = useState(0);

    return (
        <div className="flex bg-surface-container rounded-lg p-space-xs border border-outline-variant">
            {TABS.map((tab, index) => (
                <button
                    key={tab}
                    type="button"
                    onClick={() => setActive(index)}
                    className={
                        index === active
                            ? 'px-space-md py-space-xs text-label-sm font-label-sm bg-primary text-on-primary rounded-lg transition-all'
                            : 'px-space-md py-space-xs text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-all'
                    }
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
