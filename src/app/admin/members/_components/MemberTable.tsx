'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export type Member = {
    id: string;
    code: string;
    email: string;
    nickname: string;
    role: '일반' | '판매자';
    status: '정상' | '정지';
    joinedAt: string;
};

const ROLE_CLASS: Record<Member['role'], string> = {
    일반: 'inline-block px-2 py-0.5 rounded text-caption font-caption bg-surface border border-outline-variant text-on-surface-variant',
    판매자: 'inline-block px-2 py-0.5 rounded text-caption font-caption bg-secondary-container text-on-secondary-container',
};

const STATUS_CLASS: Record<Member['status'], string> = {
    정상: 'inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption bg-surface-container-high text-on-surface-variant border border-outline-variant',
    정지: 'inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption bg-primary text-on-primary border border-primary',
};

const PAGES = [2, 3, 4, 5];

// 회원 테이블 + 하단 요약/페이지네이션 (전체 선택 및 선택 개수 표시)
export default function MemberTable({ members }: { members: Member[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);

    const allChecked = selected.length > 0 && selected.length === members.length;
    const indeterminate = selected.length > 0 && selected.length < members.length;

    const toggleAll = (checked: boolean) => {
        setSelected(checked ? members.map((member) => member.id) : []);
    };

    const toggleOne = (id: string, checked: boolean) => {
        setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
    };

    return (
        <>
            {/* 3. Member Table Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden flex flex-col">
                {/* Batch Actions & Summary Bar */}
                <div className="px-space-md py-space-sm bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                className="w-4 h-4 rounded border-outline accent-primary cursor-pointer"
                                id="check-all"
                                type="checkbox"
                                checked={allChecked}
                                ref={(el) => {
                                    if (el) el.indeterminate = indeterminate;
                                }}
                                onChange={(e) => toggleAll(e.target.checked)}
                            />
                            <span className="font-label-sm text-label-sm text-primary">전체 선택</span>
                        </label>
                        <span className="text-outline">|</span>
                        <span className="font-caption text-caption text-on-surface-variant">
                            선택된 항목: <span className="font-label-sm text-label-sm text-primary">{selected.length}</span>건
                        </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                        <button
                            className="px-space-sm py-1 rounded border border-outline-variant bg-surface font-caption text-caption text-on-surface-variant hover:bg-surface-container transition-colors"
                            type="button"
                        >
                            선택 정상 전환
                        </button>
                        <button
                            className="px-space-sm py-1 rounded border border-outline-variant bg-surface font-caption text-caption text-error hover:bg-error-container transition-colors"
                            type="button"
                        >
                            선택 계정 정지
                        </button>
                    </div>
                </div>
                {/* Data Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-high border-b border-outline-variant font-label-sm text-label-sm text-on-surface">
                                <th className="py-3 px-space-md w-12 text-center">선택</th>
                                <th className="py-3 px-space-md w-28">회원번호</th>
                                <th className="py-3 px-space-md">이메일</th>
                                <th className="py-3 px-space-md w-36">닉네임</th>
                                <th className="py-3 px-space-md w-24 text-center">구분</th>
                                <th className="py-3 px-space-md w-24 text-center">상태</th>
                                <th className="py-3 px-space-md w-32 text-center">가입일</th>
                                <th className="py-3 px-space-md w-28 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
                            {members.map((member) => (
                                <tr
                                    key={member.id}
                                    className="hover:bg-surface-container transition-colors cursor-pointer group"
                                    onClick={() => router.push(ROUTES.adminMember(member.id))}
                                >
                                    <td className="py-3.5 px-space-md text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            className="w-4 h-4 rounded border-outline accent-primary cursor-pointer"
                                            type="checkbox"
                                            checked={selected.includes(member.id)}
                                            onChange={(e) => toggleOne(member.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-3.5 px-space-md font-mono text-primary font-medium">{member.code}</td>
                                    <td className="py-3.5 px-space-md">
                                        <span className="text-primary font-medium group-hover:underline underline-offset-2">{member.email}</span>
                                    </td>
                                    <td className="py-3.5 px-space-md text-on-surface-variant">{member.nickname}</td>
                                    <td className="py-3.5 px-space-md text-center">
                                        <span className={ROLE_CLASS[member.role]}>{member.role}</span>
                                    </td>
                                    <td className="py-3.5 px-space-md text-center">
                                        <span className={STATUS_CLASS[member.status]}>{member.status}</span>
                                    </td>
                                    <td className="py-3.5 px-space-md text-center font-mono text-caption text-on-surface-variant">{member.joinedAt}</td>
                                    <td className="py-3.5 px-space-md text-center" onClick={(e) => e.stopPropagation()}>
                                        <Link
                                            className="inline-flex items-center justify-center px-2.5 py-1 rounded bg-surface border border-outline-variant font-label-sm text-label-sm text-primary hover:bg-primary hover:text-on-primary transition-colors"
                                            href={ROUTES.adminMember(member.id)}
                                        >
                                            상세보기
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* 4. Bottom Area: Count & Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-xs">
                {/* Showing Count Summary */}
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                    총 <span className="font-label-md text-label-md text-primary">1,482</span>명 (<span>선택 {selected.length}명</span>)
                </div>
                {/* Pagination Controls */}
                <nav aria-label="페이지 이동" className="flex items-center gap-1">
                    <button
                        className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-40"
                        disabled
                        type="button"
                    >
                        <Icon name="chevron_left" className="text-[16px]" />
                    </button>
                    <button className="w-8 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">
                        1
                    </button>
                    {PAGES.map((page) => (
                        <button
                            key={page}
                            className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container flex items-center justify-center transition-colors"
                            type="button"
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors"
                        type="button"
                    >
                        <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                </nav>
                {/* Page Size Dropdown */}
                <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                    <span>페이지당 표시:</span>
                    <select
                        className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none cursor-pointer"
                        defaultValue="20개씩"
                    >
                        <option>10개씩</option>
                        <option>20개씩</option>
                        <option>50개씩</option>
                    </select>
                </div>
            </div>
        </>
    );
}
