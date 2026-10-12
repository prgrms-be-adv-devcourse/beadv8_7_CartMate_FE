'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

type ResultStateTabsProps = {
    intro: ReactNode;
    confirmedView: ReactNode;
    cancelledView: ReactNode;
};

const TABS = [
    { key: 'A', icon: 'verified', label: '결과 상태 A: 전원 결제 완료 (주문 확정)' },
    { key: 'B', icon: 'cancel', label: '결과 상태 B: 기한 만료 취소 (동결 해제)' },
] as const;

const BASE_TAB = 'flex items-center gap-1.5 px-space-md py-2 font-label-md text-label-md rounded transition-all';

// 결과 상태 A(주문 확정) / B(취소·동결 해제) 전환 탭
export default function ResultStateTabs({ intro, confirmedView, cancelledView }: ResultStateTabsProps) {
    const [state, setState] = useState<'A' | 'B'>('A');

    return (
        <>
            {/* SECTION HEADER & STATUS SWITCHER */}
            <section className="mb-space-xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg border-b border-surface-variant">
                    {intro}
                    <div className="flex items-center bg-surface-container-high p-1 rounded">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`${BASE_TAB} ${state === tab.key ? 'bg-primary text-on-primary shadow-sm' : 'text-secondary hover:text-on-surface'}`}
                                type="button"
                                onClick={() => setState(tab.key)}
                            >
                                <Icon name={tab.icon} className="text-[18px]" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            <div className="flex flex-col gap-space-xl transition-opacity duration-200">{state === 'A' ? confirmedView : cancelledView}</div>
        </>
    );
}
