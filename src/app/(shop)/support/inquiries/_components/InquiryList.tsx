'use client';

import { useState } from 'react';

export type Inquiry = {
    id: string;
    answered: boolean;
    type: string;
    title: string;
    date: string;
    question: string;
    answer?: string;
    answeredAt?: string;
};

const STATUS_FILTERS = ['전체 상태', '답변 대기', '답변 완료'];

const BADGE_ANSWERED =
    'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-primary bg-primary text-on-primary font-caption text-caption';
const BADGE_WAITING =
    'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant font-caption text-caption';

// 나의 문의 내역: 상태 필터 + 아코디언 목록
export default function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
    const [status, setStatus] = useState(STATUS_FILTERS[0]);
    const [openId, setOpenId] = useState<string | null>(null);

    const visible = inquiries.filter((inquiry) => {
        if (status === '답변 대기') return !inquiry.answered;
        if (status === '답변 완료') return inquiry.answered;
        return true;
    });

    function toggle(id: string) {
        setOpenId(openId === id ? null : id);
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">나의 문의 내역</h2>
                    <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-label-sm rounded-full">총 {inquiries.length}건</span>
                </div>
                <div className="flex items-center gap-space-sm">
                    <select
                        className="h-9 px-space-sm bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-on-surface outline-none cursor-pointer"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                    >
                        {STATUS_FILTERS.map((filter) => (
                            <option key={filter}>{filter}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
                {/* List Header */}
                <div className="grid grid-cols-12 px-space-lg py-space-md bg-surface-container border-b border-outline-variant font-label-sm text-on-surface-variant uppercase tracking-wider">
                    <div className="col-span-2 text-center">상태</div>
                    <div className="col-span-2">문의 유형</div>
                    <div className="col-span-6">제목</div>
                    <div className="col-span-2 text-right">등록일</div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-outline-variant">
                    {visible.map((inquiry) => (
                        <div key={inquiry.id}>
                            <div
                                className="grid grid-cols-12 px-space-lg py-space-md items-center hover:bg-surface transition-colors cursor-pointer"
                                role="button"
                                tabIndex={0}
                                aria-expanded={openId === inquiry.id}
                                onClick={() => toggle(inquiry.id)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        toggle(inquiry.id);
                                    }
                                }}
                            >
                                <div className="col-span-2 flex justify-center">
                                    <span className={inquiry.answered ? BADGE_ANSWERED : BADGE_WAITING}>{inquiry.answered ? '답변 완료' : '답변 대기'}</span>
                                </div>
                                <div className="col-span-2 font-body-sm text-on-surface-variant">{inquiry.type}</div>
                                <div className="col-span-6 font-body-md text-on-surface font-medium truncate">{inquiry.title}</div>
                                <div className="col-span-2 text-right font-caption text-outline">{inquiry.date}</div>
                            </div>

                            {/* Accordion Content */}
                            {openId === inquiry.id && (
                                <div className="bg-surface px-space-xl py-space-lg border-t border-outline-variant">
                                    <div className="flex flex-col gap-space-md">
                                        <div className="flex items-start gap-space-md">
                                            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center font-label-sm text-on-surface">Q</div>
                                            <div className="flex-1 font-body-sm text-on-surface">{inquiry.question}</div>
                                        </div>
                                        {inquiry.answer ? (
                                            <div className="flex items-start gap-space-md pl-space-xl border-l-2 border-primary ml-4">
                                                <div className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-label-sm">A</div>
                                                <div className="flex-1 flex flex-col gap-space-xs font-body-sm text-on-surface-variant">
                                                    <p>{inquiry.answer}</p>
                                                    <span className="font-caption text-outline">답변일: {inquiry.answeredAt}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-outline pl-12 font-caption italic">담당자 확인 중입니다. 빠른 시일 내에 답변 드리겠습니다.</div>
                                        )}
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
