'use client';

import { CLAIM_TABS, type ClaimTab } from './claim';

type Props = {
    active: ClaimTab;
    // 탭별 건수. 아직 못 받았으면 '-'
    counts: Partial<Record<ClaimTab, number>>;
    onChange: (tab: ClaimTab) => void;
};

export default function ClaimStatusTabs({ active, counts, onChange }: Props) {
    return (
        <div role="group" aria-label="처리 상태" className="flex flex-wrap bg-surface-container rounded-lg p-space-xs border border-outline-variant gap-1">
            {CLAIM_TABS.map(({ tab, label }) => {
                const isActive = tab === active;
                return (
                    <button
                        key={tab}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onChange(tab)}
                        className={
                            isActive
                                ? 'px-space-md py-space-xs text-label-sm font-label-sm bg-primary text-on-primary rounded-lg transition-all'
                                : 'px-space-md py-space-xs text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface transition-all'
                        }
                    >
                        {label} ({counts[tab] ?? '-'})
                    </button>
                );
            })}
        </div>
    );
}
