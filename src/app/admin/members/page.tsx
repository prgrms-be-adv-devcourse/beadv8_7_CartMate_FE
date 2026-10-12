import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import MemberTable, { type Member } from './_components/MemberTable';

export const metadata: Metadata = {
    title: '회원 목록 | TEAMBUY',
};

const MEMBERS: Member[] = [
    { id: '10492', code: 'M-10492', email: 'user_soccer@test.com', nickname: '축구왕슛돌이', role: '일반', status: '정상', joinedAt: '2024-03-12' },
    { id: '10385', code: 'M-10385', email: 'team_seoul@fcmail.net', nickname: 'FC서울매니저', role: '판매자', status: '정지', joinedAt: '2024-02-18' },
    { id: '10211', code: 'M-10211', email: 'hoop_master@gmail.com', nickname: '덩크슛맨', role: '일반', status: '정상', joinedAt: '2024-01-30' },
    { id: '09841', code: 'M-09841', email: 'sports_gear@biz.co.kr', nickname: '프로스포츠코리아', role: '판매자', status: '정상', joinedAt: '2023-11-15' },
    { id: '09552', code: 'M-09552', email: 'bad_user99@spam.net', nickname: '나쁜거래자', role: '일반', status: '정지', joinedAt: '2023-10-04' },
];

const RADIO_FILTERS = [
    {
        label: '계정 상태',
        name: 'status-filter',
        options: [
            { value: 'all', label: '전체' },
            { value: 'active', label: '정상' },
            { value: 'suspended', label: '정지' },
        ],
    },
    {
        label: '회원 구분',
        name: 'role-filter',
        options: [
            { value: 'all', label: '전체' },
            { value: 'general', label: '일반' },
            { value: 'seller', label: '판매자' },
        ],
    },
];

const QUICK_PERIODS = [
    { label: '전체', active: false },
    { label: '1개월', active: false },
    { label: '3개월', active: true },
];

export default function AdminMembersPage() {
    return (
        <div className="flex flex-col w-full gap-space-lg">
            {/* 1. Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-sm border-b border-outline-variant">
                <div>
                    <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-space-xs">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                        <span>Member Management Core</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">회원 목록</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">전체 등록 회원을 조회하고 상태 및 권한을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button
                        className="flex items-center gap-space-xs px-space-md py-space-sm rounded bg-surface-container-lowest border border-outline-variant font-label-sm text-label-sm text-primary hover:bg-surface-container transition-colors"
                        type="button"
                    >
                        <Icon name="download" className="text-[16px]" />
                        <span>엑셀 다운로드</span>
                    </button>
                    <button
                        className="flex items-center gap-space-xs px-space-md py-space-sm rounded bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity"
                        type="button"
                    >
                        <Icon name="person_add" className="text-[16px]" />
                        <span>신규 회원 수기 등록</span>
                    </button>
                </div>
            </div>
            {/* 2. Search & Filter Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                {/* Top Row: Search Target & Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                    <div className="md:col-span-3 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="search-target">
                            검색 조건
                        </label>
                        <div className="relative">
                            <select
                                className="w-full h-10 px-space-sm pr-8 bg-surface border border-outline-variant rounded font-body-sm text-body-sm text-primary focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                id="search-target"
                                defaultValue="email"
                            >
                                <option value="email">이메일</option>
                                <option value="id">회원번호</option>
                                <option value="nickname">닉네임</option>
                            </select>
                            <Icon
                                name="expand_more"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-9 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="search-keyword">
                            검색어 입력
                        </label>
                        <div className="flex items-center gap-space-sm">
                            <div className="relative flex-1">
                                <input
                                    className="w-full h-10 px-space-sm pl-9 bg-surface border border-outline-variant rounded font-body-sm text-body-sm text-primary placeholder:text-outline focus:border-primary focus:outline-none"
                                    id="search-keyword"
                                    placeholder="검색어를 입력하세요 (예: user@test.com)"
                                    type="text"
                                />
                                <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                            </div>
                            <button
                                className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1"
                                type="button"
                            >
                                <span>검색</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="h-[1px] bg-outline-variant w-full"></div>
                {/* Filter Multi-Row Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                    {RADIO_FILTERS.map((filter) => (
                        <div key={filter.name} className="lg:col-span-4 flex flex-col gap-1.5">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">{filter.label}</span>
                            <div
                                aria-label={`${filter.label} 필터`}
                                className="flex items-center gap-1 bg-surface p-1 border border-outline-variant rounded"
                                role="radiogroup"
                            >
                                {filter.options.map((option, index) => (
                                    <label key={option.value} className="flex-1 text-center cursor-pointer">
                                        <input
                                            defaultChecked={index === 0}
                                            className="peer sr-only"
                                            name={filter.name}
                                            type="radio"
                                            value={option.value}
                                        />
                                        <span className="block py-1.5 px-2 rounded text-center font-label-sm text-label-sm text-on-surface-variant peer-checked:bg-primary peer-checked:text-on-primary transition-all">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* Signup Date Range */}
                    <div className="lg:col-span-4 flex flex-col gap-1.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">가입일 범위</span>
                        <div className="flex items-center gap-1">
                            <input
                                className="w-full h-[38px] px-2 bg-surface border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none"
                                type="date"
                                defaultValue="2023-10-01"
                            />
                            <span className="text-outline text-body-sm">~</span>
                            <input
                                className="w-full h-[38px] px-2 bg-surface border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none"
                                type="date"
                                defaultValue="2024-03-31"
                            />
                        </div>
                    </div>
                </div>
                {/* Quick Date Filter Presets and Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs">
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                        <span className="font-caption text-caption text-on-surface-variant mr-1">간편 기간:</span>
                        {QUICK_PERIODS.map((period) => (
                            <button
                                key={period.label}
                                className={
                                    period.active
                                        ? 'px-2.5 py-1 text-caption font-caption rounded border border-primary bg-primary text-on-primary'
                                        : 'px-2.5 py-1 text-caption font-caption rounded border border-outline-variant bg-surface hover:bg-surface-container text-on-surface-variant'
                                }
                                type="button"
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
                        <button
                            className="px-space-md py-1.5 rounded border border-outline-variant bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-1"
                            type="button"
                        >
                            <Icon name="restart_alt" className="text-[16px]" />
                            <span>필터 초기화</span>
                        </button>
                        <button
                            className="px-space-md py-1.5 rounded bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity"
                            type="button"
                        >
                            <span>조건 검색 적용</span>
                        </button>
                    </div>
                </div>
            </div>
            <MemberTable members={MEMBERS} />
        </div>
    );
}
