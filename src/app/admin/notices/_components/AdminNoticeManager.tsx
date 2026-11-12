'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
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
import { NOTICE_CATEGORIES, noticeCategoryLabel, type NoticeCategory } from '@/lib/notice';

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
            <div className="flex flex-col items-start justify-between gap-space-md sm:flex-row sm:items-end">
                <div>
                    <Text type="supporting" color="accent" className="uppercase tracking-wider">ADMIN / NOTICES</Text>
                    <Heading level={1} className="mt-1">공지사항 관리</Heading>
                    <Text color="secondary" className="mt-2">
                        등록한 공지는 고객센터 공지사항에 바로 보입니다. 상단 고정한 공지는 목록 맨 위에 나옵니다.
                    </Text>
                </div>
                <Button
                    label="새 공지 작성"
                    type="button"
                    variant="primary"
                    onClick={openNew}
                    icon={<Icon name="add" className="text-[18px]" />}
                />
            </div>

            {/* 작성·수정 폼 */}
            {formOpen && (
                <Card className="border border-primary">
                  <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <Heading level={2}>{editingId === null ? '새 공지 작성' : `공지 수정 #${editingId}`}</Heading>
                        <Button label="닫기" type="button" variant="ghost" size="sm" onClick={closeForm} icon={<Icon name="close" className="text-[20px]" />} isIconOnly />
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

                    {error && <Text className="text-error" role="alert">{error}</Text>}

                    <div className="flex justify-end gap-space-sm">
                        <Button label="취소" type="button" variant="secondary" onClick={closeForm} />
                        <Button label={saving ? '저장 중…' : editingId === null ? '등록' : '수정 완료'} type="submit" variant="primary" isDisabled={saving} />
                    </div>
                  </form>
                </Card>
            )}

            {/* 검색 */}
            <form onSubmit={onSearch} className="flex justify-end gap-space-xs">
                <input
                    className="h-9 min-w-0 flex-1 px-space-sm border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-body-sm outline-none focus:border-primary sm:w-64 sm:flex-none"
                    placeholder="제목 검색"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                />
                <Button label="검색" type="submit" variant="secondary" size="sm" />
            </form>

            {/* 목록 */}
            <Card padding={0} className="overflow-x-auto">
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
                                        <Badge label={noticeCategoryLabel(n.category)} variant={n.category === 'URGENT' ? 'error' : n.category === 'EVENT' ? 'purple' : n.category === 'GUIDE' ? 'blue' : 'neutral'} />
                                    </td>
                                    <td className="py-space-sm px-space-md font-label-md text-label-md text-on-surface">{n.title}</td>
                                    <td className="py-space-sm px-space-md text-center">
                                        {n.pinned ? <Icon name="push_pin" className="text-[18px] text-primary" /> : <span className="text-outline">-</span>}
                                    </td>
                                    <td className="py-space-sm px-space-md text-right text-outline">{(n.viewCount ?? 0).toLocaleString('ko-KR')}</td>
                                    <td className="py-space-sm px-space-md text-outline">{formatDateTime(n.createdAt)}</td>
                                    <td className="py-space-sm px-space-md">
                                        <div className="flex justify-center gap-space-xs">
                                            <Button
                                                label="수정"
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                isDisabled={loadingEdit}
                                                onClick={() => void openEdit(n)}
                                            />
                                            <Button
                                                label="삭제"
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                isDisabled={remove.isPending}
                                                onClick={() => onDelete(n)}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>

            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-space-xs" aria-label="페이지">
                    <Button label="이전 페이지" variant="secondary" size="sm" isIconOnly icon={<Icon name="chevron_left" className="text-[18px]" />} isDisabled={page === 0} onClick={() => setPage((v) => v - 1)} />
                    <Text type="supporting" color="secondary" className="px-space-sm">{page + 1} / {totalPages}</Text>
                    <Button label="다음 페이지" variant="secondary" size="sm" isIconOnly icon={<Icon name="chevron_right" className="text-[18px]" />} isDisabled={page >= totalPages - 1} onClick={() => setPage((v) => v + 1)} />
                </nav>
            )}
        </div>
    );
}
