'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import MemberTable, { type Member } from './MemberTable';

// ===== 백엔드 응답 모양 =====
type AdminMember = {
    id: number;
    email: string;
    nickname: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWN';
    joinedAt: string;
};

type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

// ===== 검색 조건 =====
type SearchType = 'email' | 'id' | 'nickname';
type StatusFilter = 'all' | 'ACTIVE' | 'SUSPENDED';
type RoleFilter = 'all' | 'BUYER' | 'SELLER';
type QuickPeriod = 'all' | '1m' | '3m' | null;

type Condition = {
    searchType: SearchType;
    keyword: string;
    status: StatusFilter;
    role: RoleFilter;
    joinedFrom: string;
    joinedTo: string;
};

const DEFAULT_PAGE_SIZE = 20;

const INITIAL_CONDITION: Condition = {
    searchType: 'email',
    keyword: '',
    status: 'all',
    role: 'all',
    joinedFrom: '',
    joinedTo: '',
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'ACTIVE', label: '정상' },
    { value: 'SUSPENDED', label: '정지' },
];

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: '전체' },
    { value: 'BUYER', label: '일반' },
    { value: 'SELLER', label: '판매자' },
];

const ROLE_LABEL: Record<AdminMember['role'], Member['role']> = { BUYER: '일반', SELLER: '판매자', ADMIN: '관리자' };
const STATUS_LABEL: Record<AdminMember['status'], Member['status']> = { ACTIVE: '정상', SUSPENDED: '정지', WITHDRAWN: '탈퇴' };

const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

// 백엔드 응답을 기존 MemberTable 이 쓰는 모양으로 변환
function toTableMember(m: AdminMember): Member {
    return {
        id: String(m.id),
        code: `M-${String(m.id).padStart(5, '0')}`,
        email: m.email,
        nickname: m.nickname,
        role: ROLE_LABEL[m.role],
        status: STATUS_LABEL[m.status],
        joinedAt: m.joinedAt.slice(0, 10),
    };
}

function buildQuery(c: Condition, page: number, size: number) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    if (c.keyword.trim()) {
        params.set('searchType', c.searchType);
        params.set('keyword', c.keyword.trim());
    }
    if (c.status !== 'all') params.set('status', c.status);
    if (c.role !== 'all') params.set('role', c.role);
    if (c.joinedFrom) params.set('joinedFrom', c.joinedFrom);
    if (c.joinedTo) params.set('joinedTo', c.joinedTo);
    return params.toString();
}

export default function MembersContent() {
    // 입력 중인 조건과, 실제로 검색에 적용된 조건을 분리 (검색 버튼을 눌러야 반영)
    const [form, setForm] = useState<Condition>(INITIAL_CONDITION);
    const [applied, setApplied] = useState<Condition>(INITIAL_CONDITION);
    const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>('all');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const [result, setResult] = useState<PageResponse<AdminMember> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async (condition: Condition, pageNumber: number, size: number) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<PageResponse<AdminMember>>(`/api/admin/members?${buildQuery(condition, pageNumber, size)}`);
            setResult(res.data);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : '회원 목록을 불러오지 못했습니다.');
            setResult(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(applied, page, pageSize);
    }, [applied, page, pageSize, load]);

    // 선택 일괄 정지·해제
    const handleBulkAction = async (action: 'SUSPEND' | 'ACTIVATE', memberIds: string[]) => {
        let suspend: { reasonType: string; reasonDetail: string; duration: string } | undefined;

        if (action === 'SUSPEND') {
            const reason = window.prompt(
                `선택한 ${memberIds.length}명을 7일간 정지합니다.\n정지 사유를 입력해주세요. (기간·사유를 자세히 정하려면 회원 상세에서 정지하세요)`,
            );
            if (reason === null) return; // 취소
            if (!reason.trim()) {
                alert('정지 사유를 입력해주세요.');
                return;
            }
            suspend = { reasonType: 'OTHER', reasonDetail: reason.trim(), duration: 'DAYS_7' };
        } else if (!window.confirm(`선택한 ${memberIds.length}명의 정지를 해제할까요?`)) {
            return;
        }

        try {
            const res = await apiFetch<{ successCount: number; failures: { memberId: number; reason: string }[] }>(
                '/api/admin/members/bulk-status',
                {
                    method: 'POST',
                    body: JSON.stringify({ memberIds: memberIds.map(Number), action, suspend }),
                },
            );
            const failures = res.data?.failures ?? [];
            const lines = [`${res.data?.successCount ?? 0}명 처리되었습니다.`];
            if (failures.length > 0) {
                lines.push('', `처리하지 못한 회원 ${failures.length}명:`);
                failures.forEach((f) => lines.push(`· M-${String(f.memberId).padStart(5, '0')}: ${f.reason}`));
            }
            alert(lines.join('\n'));
            load(applied, page, pageSize);
        } catch (e) {
            alert(e instanceof ApiError ? e.message : '일괄 처리 중 오류가 발생했습니다.');
        }
    };

    const update = <K extends keyof Condition>(key: K, value: Condition[K]) => setForm((prev) => ({ ...prev, [key]: value }));

    const applySearch = () => {
        setPage(0);
        setApplied({ ...form });
    };

    const resetFilters = () => {
        setForm(INITIAL_CONDITION);
        setQuickPeriod('all');
        setPage(0);
        setApplied(INITIAL_CONDITION);
    };

    const handleQuickPeriod = (period: Exclude<QuickPeriod, null>) => {
        setQuickPeriod(period);
        if (period === 'all') {
            setForm((prev) => ({ ...prev, joinedFrom: '', joinedTo: '' }));
            return;
        }
        const to = new Date();
        const from = new Date();
        from.setMonth(from.getMonth() - (period === '1m' ? 1 : 3));
        setForm((prev) => ({ ...prev, joinedFrom: toDateInput(from), joinedTo: toDateInput(to) }));
    };

    const members = (result?.content ?? []).map(toTableMember);

    return (
        <div className="flex flex-col w-full gap-space-lg">
            {/* 1. Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-sm border-b border-outline-variant">
                <div>
                    <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-space-xs">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                        <span>Member Management Core</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">회원 목록</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        전체 등록 회원을 조회하고 상태 및 권한을 관리합니다.
                        {result && <span className="ml-2 text-on-surface font-semibold">총 {result.totalElements.toLocaleString('ko-KR')}명</span>}
                    </p>
                </div>
            </div>

            {/* 2. Search & Filter */}
            <form
                className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md"
                onSubmit={(e) => {
                    e.preventDefault();
                    applySearch();
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                    <div className="md:col-span-3 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="search-target">
                            검색 조건
                        </label>
                        <div className="relative">
                            <select
                                className="w-full h-10 px-space-sm pr-8 bg-surface border border-outline-variant rounded font-body-sm text-body-sm text-primary focus:border-primary focus:outline-none appearance-none cursor-pointer"
                                id="search-target"
                                value={form.searchType}
                                onChange={(e) => update('searchType', e.target.value as SearchType)}
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
                                    placeholder={
                                        form.searchType === 'id'
                                            ? '회원번호 숫자만 입력 (예: 3)'
                                            : form.searchType === 'nickname'
                                              ? '닉네임 일부 입력 (예: 러너)'
                                              : '이메일 일부 입력 (예: cartmate)'
                                    }
                                    type="text"
                                    value={form.keyword}
                                    onChange={(e) => update('keyword', e.target.value)}
                                />
                                <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
                            </div>
                            <button
                                className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-1"
                                type="submit"
                            >
                                <span>검색</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-outline-variant w-full"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
                    {/* 계정 상태 */}
                    <div className="lg:col-span-4 flex flex-col gap-1.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">계정 상태</span>
                        <div className="flex items-center gap-1 bg-surface p-1 border border-outline-variant rounded" role="radiogroup">
                            {STATUS_OPTIONS.map((option) => (
                                <label key={option.value} className="flex-1 text-center cursor-pointer">
                                    <input
                                        className="peer sr-only"
                                        name="status-filter"
                                        type="radio"
                                        checked={form.status === option.value}
                                        onChange={() => update('status', option.value)}
                                    />
                                    <span className="block py-1.5 px-2 rounded text-center font-label-sm text-label-sm text-on-surface-variant peer-checked:bg-primary peer-checked:text-on-primary transition-all">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 회원 구분 */}
                    <div className="lg:col-span-4 flex flex-col gap-1.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">회원 구분</span>
                        <div className="flex items-center gap-1 bg-surface p-1 border border-outline-variant rounded" role="radiogroup">
                            {ROLE_OPTIONS.map((option) => (
                                <label key={option.value} className="flex-1 text-center cursor-pointer">
                                    <input
                                        className="peer sr-only"
                                        name="role-filter"
                                        type="radio"
                                        checked={form.role === option.value}
                                        onChange={() => update('role', option.value)}
                                    />
                                    <span className="block py-1.5 px-2 rounded text-center font-label-sm text-label-sm text-on-surface-variant peer-checked:bg-primary peer-checked:text-on-primary transition-all">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 가입일 범위 */}
                    <div className="lg:col-span-4 flex flex-col gap-1.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant">가입일 범위</span>
                        <div className="flex items-center gap-1">
                            <input
                                className="w-full h-[38px] px-2 bg-surface border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none"
                                type="date"
                                value={form.joinedFrom}
                                onChange={(e) => {
                                    update('joinedFrom', e.target.value);
                                    setQuickPeriod(null);
                                }}
                            />
                            <span className="text-outline text-body-sm">~</span>
                            <input
                                className="w-full h-[38px] px-2 bg-surface border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none"
                                type="date"
                                value={form.joinedTo}
                                onChange={(e) => {
                                    update('joinedTo', e.target.value);
                                    setQuickPeriod(null);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs">
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                        <span className="font-caption text-caption text-on-surface-variant mr-1">간편 기간:</span>
                        {(
                            [
                                { value: 'all', label: '전체' },
                                { value: '1m', label: '1개월' },
                                { value: '3m', label: '3개월' },
                            ] as const
                        ).map((period) => (
                            <button
                                key={period.value}
                                className={
                                    quickPeriod === period.value
                                        ? 'px-2.5 py-1 text-caption font-caption rounded border border-primary bg-primary text-on-primary'
                                        : 'px-2.5 py-1 text-caption font-caption rounded border border-outline-variant bg-surface hover:bg-surface-container text-on-surface-variant'
                                }
                                type="button"
                                onClick={() => handleQuickPeriod(period.value)}
                            >
                                {period.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end">
                        <button
                            className="px-space-md py-1.5 rounded border border-outline-variant bg-surface-container-lowest font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-1"
                            type="button"
                            onClick={resetFilters}
                        >
                            <Icon name="restart_alt" className="text-[16px]" />
                            <span>필터 초기화</span>
                        </button>
                        <button
                            className="px-space-md py-1.5 rounded bg-primary text-on-primary font-label-sm text-label-sm hover:opacity-90 transition-opacity"
                            type="submit"
                        >
                            <span>조건 검색 적용</span>
                        </button>
                    </div>
                </div>
            </form>

            {/* 3. 결과 */}
            {error ? (
                <div className="bg-surface-container-lowest border border-error/40 rounded p-space-lg text-center font-body-sm text-body-sm text-error">
                    {error}
                </div>
            ) : loading && !result ? (
                <div className="h-64 rounded bg-surface-container animate-pulse" />
            ) : members.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl text-center font-body-sm text-body-sm text-outline">
                    조건에 맞는 회원이 없습니다.
                </div>
            ) : (
                <div className={loading ? 'opacity-60 transition-opacity' : ''}>
                    <MemberTable
                        members={members}
                        totalElements={result?.totalElements ?? 0}
                        page={page}
                        totalPages={result?.totalPages ?? 0}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setPage(0);
                        }}
                        onBulkAction={handleBulkAction}
                    />
                </div>
            )}

        </div>
    );
}