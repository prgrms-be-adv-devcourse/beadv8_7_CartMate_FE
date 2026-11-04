'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    getAdminNotice,
    getGetAdminNoticesQueryKey,
    useCreateNotice,
    useDeleteNotice,
    useGetAdminNotices,
    useUpdateNotice,
} from '@/api/generated/admin-notice-controller/admin-notice-controller';
import type { NoticeSummaryResponse } from '@/api/generated/model';
import { getGetNoticesQueryKey } from '@/api/generated/notice-controller/notice-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { NOTICE_CATEGORIES, noticeBadgeClass, noticeCategoryLabel, type NoticeCategory } from '@/lib/notice';

const PAGE_SIZE = 20;

type Form = { category: NoticeCategory; title: string; content: string; pinned: boolean };
const EMPTY: Form = { category: 'NOTICE', title: '', content: '', pinned: false };

// 관리자 공지사항: 목록·검색, 등록·수정(같은 폼), 삭제
export default function AdminNoticeManager() {
    const queryClient = useQueryClient();
    const formRef = useRef<HTMLFormElement>(null);

    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);

    const [editingId, setEditingId] = useState<number | null>(null); // null = 새 공지
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<Form>(EMPTY);
    const [error, setError] = useState<string | null>(null);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const list = useGetAdminNotices({ keyword: keyword || undefined, page, size: PAGE_SIZE }, { query: { staleTime: 0 } });
    const pageData = list.data?.data;
    const notices = pageData?.content ?? [];
    const totalPages = pageData?.totalPages ?? 0;

    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: getGetAdminNoticesQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetNoticesQueryKey() });
    };
    const closeForm = () => {
        setFormOpen(false);
        setEditingId(null);
        setForm(EMPTY);
        setError(null);
    };
    const onFail = (e: unknown) => setError(errorMessage(e, '저장하지 못했습니다.'));

    const create = useCreateNotice({ mutation: { onSuccess: () => { refresh(); closeForm(); }, onError: onFail } });
    const update = useUpdateNotice({ mutation: { onSuccess: () => { refresh(); closeForm(); }, onError: onFail } });
    const remove = useDeleteNotice({
        mutation: {
            onSuccess: () => refresh(),
            onError: (e) => alert(errorMessage(e, '삭제하지 못했습니다.')),
        },
    });
    const saving = create.isPending || update.isPending;

    const openNew = () => {
        setEditingId(null);
        setForm(EMPTY);
        setError(null);
        setFormOpen(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    };

    // 목록에는 본문이 없어서 수정할 때 상세를 받아 폼에 채운다
    const openEdit = async (notice: NoticeSummaryResponse) => {
        if (!notice.id) return;
        setLoadingEdit(true);
        setError(null);
        try {
            const detail = (await getAdminNotice(notice.id)).data;
            setForm({
                category: (detail?.category ?? 'NOTICE') as NoticeCategory,
                title: detail?.title ?? '',
                content: detail?.content ?? '',
                pinned: detail?.pinned ?? false,
            });
            setEditingId(notice.id);
            setFormOpen(true);
            setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
        } catch (e) {
            alert(errorMessage(e, '공지를 불러오지 못했습니다.'));
        } finally {
            setLoadingEdit(false);
        }
    };

    const onDelete = (notice: NoticeSummaryResponse) => {
        if (!notice.id) return;
        if (confirm(`"${notice.title}" 공지를 삭제할까요? 사용자 화면에서도 바로 사라집니다.`)) {
            remove.mutate({ id: notice.id });
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.title.trim()) return setError('제목을 입력해주세요.');
        if (!form.content.trim()) return setError('내용을 입력해주세요.');
        const data = { ...form, title: form.title.trim() };
        if (editingId === null) create.mutate({ data });
        else update.mutate({ id: editingId, data });
    };

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setKeyword(keywordInput.trim());
        setPage(0);
    };

    return (
        <div className="flex flex-col gap-space-lg">
            <div className="flex items-end justify-between gap-space-md">
                <div>
                    <div className="font-caption text-caption text-outline uppercase tracking-wider mb-1">[ ADMIN / NOTICES ]</div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">공지사항 관리</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                        등록한 공지는 고객센터 공지사항에 바로 보입니다. 상단 고정한 공지는 목록 맨 위에 나옵니다.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openNew}
                    className="flex items-center gap-space-xs h-10 px-space-lg rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90"
                >
                    <Icon name="add" className="text-[18px]" /> 새 공지 작성
                </button>
            </div>

            {/* 작성·수정 폼 */}
            {formOpen && (
                <form ref={formRef} onSubmit={onSubmit} className="bg-surface-container-lowest border border-primary rounded p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <h2 className="font-headline-sm text-headline-sm font-bold">{editingId === null ? '새 공지 작성' : `공지 수정 #${editingId}`}</h2>
                        <button type="button" onClick={closeForm} className="text-outline hover:text-on-surface" aria-label="닫기">
                            <Icon name="close" className="text-[20px]" />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-space-md">
                        <label className="flex items-center gap-space-sm font-label-md text-label-md">
                            구분
                            <select
                                className="h-10 px-space-sm border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-body-sm"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value as NoticeCategory })}
                            >
                                {NOTICE_CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        [{c.label}] {c.description}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-space-xs font-label-md text-label-md cursor-pointer">
                            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                            상단 고정
                        </label>
                    </div>

                    <input
                        className="h-11 px-space-md border border-outline-variant rounded font-body-md text-body-md outline-none focus:border-primary"
                        placeholder="제목"
                        maxLength={200}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                        className="min-h-60 p-space-md border border-outline-variant rounded font-body-md text-body-md outline-none focus:border-primary"
                        placeholder="내용 (줄바꿈이 그대로 보입니다)"
                        maxLength={20000}
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                    />

                    {error && <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p>}

                    <div className="flex justify-end gap-space-sm">
                        <button type="button" onClick={closeForm} className="h-10 px-space-md border border-outline-variant rounded font-label-md">
                            취소
                        </button>
                        <button type="submit" disabled={saving} className="h-10 px-space-lg bg-primary text-on-primary rounded font-label-md disabled:opacity-50">
                            {saving ? '저장 중…' : editingId === null ? '등록' : '수정 완료'}
                        </button>
                    </div>
                </form>
            )}

            {/* 검색 */}
            <form onSubmit={onSearch} className="flex justify-end gap-space-xs">
                <input
                    className="h-9 w-64 px-space-sm border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-body-sm outline-none focus:border-primary"
                    placeholder="제목 검색"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                />
                <button type="submit" className="h-9 px-space-md border border-outline-variant rounded font-label-sm text-label-sm hover:border-primary">
                    검색
                </button>
            </form>

            {/* 목록 */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
                            <th className="py-space-sm px-space-md w-20 text-center">번호</th>
                            <th className="py-space-sm px-space-md w-24 text-center">구분</th>
                            <th className="py-space-sm px-space-md">제목</th>
                            <th className="py-space-sm px-space-md w-24 text-center">고정</th>
                            <th className="py-space-sm px-space-md w-20 text-right">조회</th>
                            <th className="py-space-sm px-space-md w-40">작성일</th>
                            <th className="py-space-sm px-space-md w-36 text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                        {list.isPending ? (
                            <tr><td colSpan={7} className="py-space-xl text-center text-outline">불러오는 중…</td></tr>
                        ) : list.isError ? (
                            <tr><td colSpan={7} className="py-space-xl text-center text-error">{errorMessage(list.error, '공지를 불러오지 못했습니다.')}</td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan={7} className="py-space-xl text-center text-outline">등록된 공지가 없습니다.</td></tr>
                        ) : (
                            notices.map((n) => (
                                <tr key={n.id} className={n.pinned ? 'bg-surface-container-low/40' : 'hover:bg-surface-container-low'}>
                                    <td className="py-space-sm px-space-md text-center font-mono text-outline">{n.id}</td>
                                    <td className="py-space-sm px-space-md text-center">
                                        <span className={noticeBadgeClass(n.category)}>{noticeCategoryLabel(n.category)}</span>
                                    </td>
                                    <td className="py-space-sm px-space-md font-label-md text-label-md text-on-surface">{n.title}</td>
                                    <td className="py-space-sm px-space-md text-center">
                                        {n.pinned ? <Icon name="push_pin" className="text-[18px] text-primary" /> : <span className="text-outline">-</span>}
                                    </td>
                                    <td className="py-space-sm px-space-md text-right text-outline">{(n.viewCount ?? 0).toLocaleString('ko-KR')}</td>
                                    <td className="py-space-sm px-space-md text-outline">{formatDateTime(n.createdAt)}</td>
                                    <td className="py-space-sm px-space-md">
                                        <div className="flex justify-center gap-space-xs">
                                            <button
                                                type="button"
                                                disabled={loadingEdit}
                                                onClick={() => void openEdit(n)}
                                                className="h-8 px-space-sm rounded bg-surface-container text-primary font-label-sm text-label-sm hover:bg-surface-container-high disabled:opacity-50"
                                            >
                                                수정
                                            </button>
                                            <button
                                                type="button"
                                                disabled={remove.isPending}
                                                onClick={() => onDelete(n)}
                                                className="h-8 px-space-sm rounded border border-error text-error font-label-sm text-label-sm hover:bg-error-container disabled:opacity-50"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-space-xs" aria-label="페이지">
                    <button type="button" className="w-8 h-8 border border-outline-variant rounded disabled:opacity-40" disabled={page === 0} onClick={() => setPage((v) => v - 1)} aria-label="이전 페이지">
                        <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    <span className="font-label-sm text-label-sm text-on-surface-variant px-space-sm">{page + 1} / {totalPages}</span>
                    <button type="button" className="w-8 h-8 border border-outline-variant rounded disabled:opacity-40" disabled={page >= totalPages - 1} onClick={() => setPage((v) => v + 1)} aria-label="다음 페이지">
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </nav>
            )}
        </div>
    );
}