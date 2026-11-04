'use client';

import { useState, type FormEvent } from 'react';
import { useGetNotice, useGetNotices } from '@/api/generated/notice-controller/notice-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { NOTICE_CATEGORIES, noticeBadgeClass, noticeCategoryLabel, type NoticeCategory } from '@/lib/notice';

const PAGE_SIZE = 10;
const TAB = 'h-9 px-space-md border font-label-md text-label-md transition-colors';
const TAB_ACTIVE = `${TAB} bg-primary text-on-primary border-primary`;
const TAB_INACTIVE = `${TAB} bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary`;

// 고객센터 공지사항: 구분 탭, 제목 검색, 고정 공지 먼저. 제목을 누르면 펼쳐서 본문을 보여 준다.
export default function NoticeBoard() {
    const [category, setCategory] = useState<NoticeCategory | ''>('');
    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [openId, setOpenId] = useState<number | null>(null);

    const list = useGetNotices({ category: category || undefined, keyword: keyword || undefined, page, size: PAGE_SIZE });
    const pageData = list.data?.data;
    const notices = pageData?.content ?? [];
    const totalPages = pageData?.totalPages ?? 0;

    const changeTab = (value: NoticeCategory | '') => {
        setCategory(value);
        setPage(0);
        setOpenId(null);
    };
    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setKeyword(keywordInput.trim());
        setPage(0);
        setOpenId(null);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-lg border-b border-outline-variant gap-space-md">
                <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                        <span className="font-caption text-caption text-outline uppercase tracking-wider">SUPPORT CENTER</span>
                        <span className="text-outline">/</span>
                        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">ANNOUNCEMENTS</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">공지사항</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        팀바이커머스의 주요 소식과 단체주문 안내, 정책 변경 사항을 알려 드립니다.
                    </p>
                </div>
                <form onSubmit={onSearch} className="flex items-center gap-space-sm">
                    <div className="w-64 h-10 border border-outline-variant bg-surface-container-lowest flex items-center px-space-md focus-within:border-primary">
                        <Icon name="search" className="text-outline text-[18px] mr-space-sm" />
                        <input
                            className="w-full bg-transparent border-none outline-none font-body-sm text-body-sm placeholder:text-outline text-on-surface"
                            placeholder="공지사항 검색"
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                        />
                    </div>
                    <button className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md hover:opacity-90" type="submit">
                        검색
                    </button>
                </form>
            </div>

            <div className="flex flex-wrap gap-space-xs mb-space-md">
                <button type="button" className={category === '' ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => changeTab('')}>
                    전체
                </button>
                {NOTICE_CATEGORIES.map((c) => (
                    <button key={c.value} type="button" className={category === c.value ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => changeTab(c.value)}>
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="border-t-2 border-on-surface mb-space-lg">
                {list.isPending ? (
                    <div className="py-space-xl text-center text-outline font-body-sm text-body-sm">불러오는 중…</div>
                ) : list.isError ? (
                    <div className="py-space-xl text-center text-error font-body-sm text-body-sm">{errorMessage(list.error, '공지사항을 불러오지 못했습니다.')}</div>
                ) : notices.length === 0 ? (
                    <div className="py-space-xl text-center text-outline font-body-sm text-body-sm">
                        {keyword ? `"${keyword}"에 해당하는 공지가 없습니다.` : '등록된 공지사항이 없습니다.'}
                    </div>
                ) : (
                    <ul>
                        {notices.map((n) => {
                            const open = openId === n.id;
                            return (
                                <li key={n.id} className={`border-b border-outline-variant ${n.pinned ? 'bg-surface-container-low' : ''}`}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-space-md px-space-md py-space-md text-left hover:bg-surface-container"
                                        aria-expanded={open}
                                        onClick={() => setOpenId(open ? null : (n.id ?? null))}
                                    >
                                        {n.pinned && <Icon name="push_pin" className="text-[18px] text-primary shrink-0" />}
                                        <span className={noticeBadgeClass(n.category)}>{noticeCategoryLabel(n.category)}</span>
                                        <span className={`flex-1 font-body-md text-body-md text-on-surface ${n.pinned ? 'font-bold' : ''}`}>{n.title}</span>
                                        <span className="font-caption text-caption text-outline shrink-0 hidden md:block">{formatDateTime(n.createdAt)}</span>
                                        <span className="font-caption text-caption text-outline shrink-0 hidden md:block w-16 text-right">조회 {(n.viewCount ?? 0).toLocaleString('ko-KR')}</span>
                                        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[20px] text-outline shrink-0" />
                                    </button>
                                    {open && n.id && <NoticeContent id={n.id} />}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-space-xs pb-space-xl" aria-label="페이지">
                    <button type="button" className="w-9 h-9 border border-outline-variant flex items-center justify-center disabled:opacity-40" disabled={page === 0} onClick={() => setPage((v) => v - 1)} aria-label="이전 페이지">
                        <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            className={`w-9 h-9 font-label-sm text-label-sm flex items-center justify-center ${
                                i === page ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button type="button" className="w-9 h-9 border border-outline-variant flex items-center justify-center disabled:opacity-40" disabled={page >= totalPages - 1} onClick={() => setPage((v) => v + 1)} aria-label="다음 페이지">
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </nav>
            )}
        </>
    );
}

// 펼쳤을 때만 본문을 받는다 (이때 조회수가 1 오른다)
function NoticeContent({ id }: { id: number }) {
    const query = useGetNotice(id);
    const notice = query.data?.data;

    if (query.isPending) return <div className="px-space-xl py-space-lg h-24 bg-surface-container-lowest animate-pulse" aria-hidden />;
    if (!notice) return <div className="px-space-xl py-space-lg text-error font-body-sm text-body-sm">{errorMessage(query.error, '공지를 불러오지 못했습니다.')}</div>;

    return (
        <div className="px-space-xl py-space-lg bg-surface-container-lowest border-t border-outline-variant">
            <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap leading-relaxed">{notice.content}</p>
            {notice.modifiedAt && notice.createdAt && notice.modifiedAt.slice(0, 16) !== notice.createdAt.slice(0, 16) && (
                <p className="mt-space-md font-caption text-caption text-outline">수정됨 {formatDateTime(notice.modifiedAt)}</p>
            )}
        </div>
    );
}