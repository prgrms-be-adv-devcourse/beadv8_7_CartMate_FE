'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

const SPORTS = ['전체', '축구', '풋살', '농구', '야구', '배드민턴', '기타'];
const CATEGORIES = ['전체', '유니폼/의류', '용품/장비', '보호대/잡화'];
const STATUSES = ['전체', '판매 중', '판매자 내림', '관리자 숨김'];

const CHIP_ACTIVE = 'h-8 px-space-md bg-primary text-on-primary rounded font-label-sm text-label-sm border border-primary transition-colors';
const CHIP_IDLE =
    'h-8 px-space-md bg-surface-container-lowest text-on-surface-variant rounded font-label-sm text-label-sm border border-outline-variant hover:border-secondary transition-colors';

function ChipGroup({ items, value, onChange }: { items: string[]; value: string; onChange: (value: string) => void }) {
    return (
        <>
            {items.map((item) => (
                <button key={item} className={item === value ? CHIP_ACTIVE : CHIP_IDLE} type="button" onClick={() => onChange(item)}>
                    {item}
                </button>
            ))}
        </>
    );
}

function FilterLabel({ children }: { children: string }) {
    return (
        <span className="w-28 text-on-surface-variant font-label-sm text-label-sm flex items-center gap-space-xs">
            <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
            {children}
        </span>
    );
}

// 판매글 검색 & 필터 영역 (칩 선택 / 필터 초기화)
export default function PostFilters() {
    const [keyword, setKeyword] = useState('');
    const [sport, setSport] = useState('전체');
    const [category, setCategory] = useState('전체');
    const [status, setStatus] = useState('전체');

    const resetFilters = () => {
        setKeyword('');
        setSport('전체');
        setCategory('전체');
        setStatus('전체');
    };

    return (
        <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg mb-space-lg flex flex-col gap-space-md shadow-sm">
            {/* Integrated Keyword Search Bar */}
            <div className="flex items-center gap-space-sm w-full">
                <div className="flex items-center h-[42px] px-space-md bg-surface-container-low border border-outline-variant rounded-l text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap min-w-[210px]">
                    <Icon name="manage_search" className="text-[16px] mr-space-xs text-secondary" />
                    검색 조건: 상품명, 판매자 통합
                </div>
                <div className="relative flex-1">
                    <input
                        className="w-full h-[42px] px-space-md bg-surface-container-lowest border border-outline-variant rounded-r text-on-surface font-body-md text-body-md placeholder-outline focus:outline-none focus:border-primary transition-colors"
                        id="integrated-search"
                        placeholder="[ 상품명 또는 판매자 상호명을 입력하세요 ]"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button
                        aria-label="입력 초기화"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                        type="button"
                        onClick={() => setKeyword('')}
                    >
                        <Icon name="cancel" className="text-[18px]" />
                    </button>
                </div>
                <button
                    className="h-[42px] px-space-xl bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs rounded hover:opacity-90 transition-colors shadow-sm whitespace-nowrap"
                    type="button"
                >
                    <Icon name="search" className="text-[18px]" />
                    검색
                </button>
            </div>
            {/* Divider Line */}
            <hr className="border-t border-surface-variant my-space-xs" />
            {/* Detailed Facet Filters */}
            <div className="flex flex-col gap-space-sm text-body-sm font-body-sm">
                {/* Sport Type Filter */}
                <div className="flex items-center gap-space-md">
                    <FilterLabel>종목 필터</FilterLabel>
                    <div className="flex flex-wrap items-center gap-space-xs flex-1">
                        <ChipGroup items={SPORTS} value={sport} onChange={setSport} />
                    </div>
                </div>
                {/* Category Filter */}
                <div className="flex items-center gap-space-md">
                    <FilterLabel>카테고리 필터</FilterLabel>
                    <div className="flex flex-wrap items-center gap-space-xs flex-1">
                        <ChipGroup items={CATEGORIES} value={category} onChange={setCategory} />
                    </div>
                </div>
                {/* Status Filter */}
                <div className="flex items-center gap-space-md">
                    <FilterLabel>상태 필터</FilterLabel>
                    <div className="flex flex-wrap items-center justify-between flex-1">
                        <div className="flex items-center gap-space-xs">
                            <ChipGroup items={STATUSES} value={status} onChange={setStatus} />
                        </div>
                        <button
                            className="h-8 px-space-md flex items-center gap-space-xs font-label-sm text-label-sm text-secondary hover:text-primary transition-colors border border-outline-variant rounded hover:bg-surface-container"
                            type="button"
                            onClick={resetFilters}
                        >
                            <Icon name="restart_alt" className="text-[16px]" />
                            필터 초기화
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
