'use client';

import { useState, type ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

export type Notice = {
    id: string;
    pinned: boolean;
    no?: number;
    badge: string;
    categories: string[];
    title: string;
    date: string;
    views: string;
    author: string;
    content: ReactNode;
    attachment?: string;
};

const CATEGORY_TABS = ['전체보기', '긴급/중요', '공동구매/MOQ', '배송/물류', '이벤트/혜택'];

const TAB_ACTIVE = 'h-9 px-space-md rounded-full bg-primary text-on-primary font-label-sm text-label-sm transition-colors whitespace-nowrap';
const TAB_INACTIVE =
    'h-9 px-space-md rounded-full bg-surface-container border border-outline-variant text-on-surface-variant font-label-sm text-label-sm hover:border-primary transition-colors whitespace-nowrap';

// 공지사항: 카테고리 탭 + 아코디언 목록
export default function NoticeBoard({ notices }: { notices: Notice[] }) {
    const [category, setCategory] = useState(CATEGORY_TABS[0]);
    const [openId, setOpenId] = useState<string | null>(null);

    const visible = category === CATEGORY_TABS[0] ? notices : notices.filter((notice) => notice.categories.includes(category));

    return (
        <>
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-space-xs mb-space-lg overflow-x-auto pb-space-xs">
                {CATEGORY_TABS.map((tab) => (
                    <button key={tab} className={category === tab ? TAB_ACTIVE : TAB_INACTIVE} type="button" onClick={() => setCategory(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Notice Table Wrapper */}
            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm mb-space-xl">
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-surface-container border-b border-outline-variant py-3 px-space-md font-label-sm text-label-sm text-on-surface-variant items-center">
                    <div className="col-span-1 text-center">번호</div>
                    <div className="col-span-2 text-center">구분</div>
                    <div className="col-span-6">제목</div>
                    <div className="col-span-2 text-center">작성일</div>
                    <div className="col-span-1 text-center">조회수</div>
                </div>

                {/* Notice List */}
                <div className="divide-y divide-outline-variant font-body-sm text-body-sm">
                    {visible.map((notice) => (
                        <div key={notice.id} className="group">
                            <div
                                className={`grid grid-cols-12 py-4 px-space-md items-center cursor-pointer transition-colors ${
                                    notice.pinned ? 'bg-surface-container-low hover:bg-surface-container' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                                }`}
                                role="button"
                                tabIndex={0}
                                aria-expanded={openId === notice.id}
                                onClick={() => setOpenId(openId === notice.id ? null : notice.id)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        setOpenId(openId === notice.id ? null : notice.id);
                                    }
                                }}
                            >
                                {notice.pinned ? (
                                    <>
                                        <div className="col-span-1 text-center font-bold text-primary flex items-center justify-center">
                                            <span className="inline-flex items-center px-1.5 py-0.5 bg-primary text-on-primary font-caption text-caption rounded">공지</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="px-2 py-0.5 border border-primary text-primary font-caption text-caption uppercase tracking-wider rounded">
                                                {notice.badge}
                                            </span>
                                        </div>
                                        <div className="col-span-6 font-medium text-on-surface group-hover:underline flex items-center gap-space-xs truncate">
                                            <Icon name="push_pin" className="text-[16px] text-primary" />
                                            <span>{notice.title}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-1 text-center text-outline font-body-sm">{notice.no}</div>
                                        <div className="col-span-2 text-center">
                                            <span className="px-2 py-0.5 border border-outline-variant text-on-surface-variant font-caption text-caption rounded">
                                                {notice.badge}
                                            </span>
                                        </div>
                                        <div className="col-span-6 text-on-surface group-hover:underline truncate">{notice.title}</div>
                                    </>
                                )}
                                <div className="col-span-2 text-center text-outline">{notice.date}</div>
                                <div className="col-span-1 text-center text-outline">{notice.views}</div>
                            </div>

                            {/* Accordion Detail Content */}
                            {openId === notice.id && (
                                <div className="bg-surface-container-lowest p-space-xl border-t border-outline-variant">
                                    <div className="max-w-4xl mx-auto space-y-space-md">
                                        <div className="border-b border-outline-variant pb-space-sm mb-space-md">
                                            <div className="font-headline-md text-headline-md text-on-surface mb-2">{notice.title}</div>
                                            <div className="flex items-center gap-space-md font-caption text-caption text-outline">
                                                <span>작성자: {notice.author}</span>
                                                <span>등록일: {notice.date}</span>
                                                <span>조회수: {notice.views}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-space-md text-on-surface-variant leading-relaxed">{notice.content}</div>
                                        <div
                                            className={`pt-space-md border-t border-outline-variant flex items-center ${
                                                notice.attachment ? 'justify-between' : 'justify-end'
                                            }`}
                                        >
                                            {notice.attachment && (
                                                <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                                                    <Icon name="download" className="text-[16px]" />
                                                    <a className="hover:underline" href="#">
                                                        {notice.attachment}
                                                    </a>
                                                </div>
                                            )}
                                            <button
                                                className="h-9 px-space-md border border-outline-variant font-label-sm text-label-sm hover:border-primary transition-colors"
                                                type="button"
                                                onClick={() => setOpenId(null)}
                                            >
                                                접기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
