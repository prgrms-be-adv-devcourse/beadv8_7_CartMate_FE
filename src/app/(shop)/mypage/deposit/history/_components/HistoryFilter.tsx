'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

const TYPE_FILTERS = ['전체 (ALL)', '충전', '결제', '동결 (보류)', '동결 해제', '환불'];
const PERIOD_PRESETS = ['오늘', '1주일', '1개월', '3개월', '6개월'];

const DEFAULT_TYPE = TYPE_FILTERS[0];
const DEFAULT_PERIOD = '1개월';

// 거래 유형 필터 + 기간 설정 (선택 상태만 관리)
export default function HistoryFilter() {
    const [type, setType] = useState(DEFAULT_TYPE);
    const [period, setPeriod] = useState(DEFAULT_PERIOD);

    return (
        <div className="bg-surface-container-lowest border border-outline-variant p-space-lg mb-space-lg flex flex-col gap-space-lg">
            {/* Type Filter Tabs */}
            <div className="flex flex-col gap-space-xs">
                <div className="font-label-sm text-label-sm text-on-surface-variant">거래 유형 필터</div>
                <div className="flex flex-wrap items-center gap-space-xs">
                    {TYPE_FILTERS.map((item) => (
                        <button
                            key={item}
                            className={
                                item === type
                                    ? 'h-8 px-space-md bg-primary text-on-primary font-label-sm text-label-sm border border-primary transition-colors'
                                    : 'h-8 px-space-md bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm border border-outline-variant hover:border-primary hover:text-on-surface transition-colors'
                            }
                            type="button"
                            onClick={() => setType(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Range & Preset Chips */}
            <div className="pt-space-md border-t border-surface-container flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex flex-wrap items-center gap-space-md">
                    {/* Preset Quick Chips */}
                    <div className="flex items-center gap-1">
                        <span className="font-label-sm text-label-sm text-on-surface-variant mr-space-xs">기간 설정:</span>
                        {PERIOD_PRESETS.map((item) => (
                            <button
                                key={item}
                                className={
                                    item === period
                                        ? 'h-7 px-space-sm bg-primary text-on-primary border border-primary font-caption text-caption'
                                        : 'h-7 px-space-sm bg-surface-container-lowest text-on-surface-variant border border-outline-variant font-caption text-caption hover:border-primary'
                                }
                                type="button"
                                onClick={() => setPeriod(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    {/* Date Range Inputs */}
                    <div className="flex items-center gap-space-xs">
                        <div className="h-9 px-space-sm bg-surface-container-lowest border border-outline-variant flex items-center gap-space-xs">
                            <Icon name="calendar_today" className="text-outline text-[16px]" />
                            <input
                                className="w-24 bg-transparent font-caption text-caption text-on-surface border-none outline-none focus:outline-none"
                                type="text"
                                defaultValue="2024-09-01"
                            />
                        </div>
                        <span className="text-outline font-caption text-caption">~</span>
                        <div className="h-9 px-space-sm bg-surface-container-lowest border border-outline-variant flex items-center gap-space-xs">
                            <Icon name="calendar_today" className="text-outline text-[16px]" />
                            <input
                                className="w-24 bg-transparent font-caption text-caption text-on-surface border-none outline-none focus:outline-none"
                                type="text"
                                defaultValue="2024-11-25"
                            />
                        </div>
                    </div>
                </div>
                {/* Action Button */}
                <div className="flex items-center gap-space-sm">
                    <button
                        className="h-9 px-space-md bg-surface-container-lowest border border-outline-variant font-label-sm text-label-sm text-on-surface hover:border-primary flex items-center gap-1"
                        type="button"
                        onClick={() => {
                            setType(DEFAULT_TYPE);
                            setPeriod(DEFAULT_PERIOD);
                        }}
                    >
                        <Icon name="restart_alt" className="text-[16px]" />
                        초기화
                    </button>
                    <button
                        className="h-9 px-space-lg bg-primary text-on-primary font-label-md text-label-md border border-primary flex items-center gap-space-xs hover:bg-neutral-800 transition-colors"
                        type="button"
                    >
                        <Icon name="search" className="text-[16px]" />
                        조회하기
                    </button>
                </div>
            </div>
        </div>
    );
}
