'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export type Member = {
    id: string;
    code: string;
    email: string;
    nickname: string;
    role: '일반' | '판매자' | '관리자';
    status: '정상' | '정지' | '탈퇴 대기' | '탈퇴';
    joinedAt: string;
};

type Props = {
    members: Member[];
    totalElements: number;
    page: number; // 0부터
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onBulkAction: (action: 'SUSPEND' | 'ACTIVATE', memberIds: string[]) => Promise<void>;
};

const PAGE_BUTTON =
    'w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-40';

// 회원 테이블 + 일괄 처리 + 페이지 이동
export default function MemberTable({
    members,
    totalElements,
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onBulkAction,
}: Props) {
    const router = useRouter();
    const [selected, setSelected] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    // 페이지가 바뀐 직후에도 현재 목록에 있는 선택만 작업 대상으로 취급한다.
    const memberIds = new Set(members.map((member) => member.id));
    const selectedOnPage = selected.filter((id) => memberIds.has(id));
    const allChecked = selectedOnPage.length > 0 && selectedOnPage.length === members.length;
    const indeterminate = selectedOnPage.length > 0 && selectedOnPage.length < members.length;

    const toggleAll = (checked: boolean) => setSelected(checked ? members.map((m) => m.id) : []);
    const toggleOne = (id: string, checked: boolean) =>
        setSelected((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));

    const runBulk = async (action: 'SUSPEND' | 'ACTIVATE') => {
        if (selectedOnPage.length === 0) {
            alert('회원을 먼저 선택해주세요.');
            return;
        }
        setProcessing(true);
        try {
            await onBulkAction(action, selectedOnPage);
        } finally {
            setProcessing(false);
        }
    };

    // 현재 페이지 주변 번호만 표시
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i).filter(
        (i) => Math.abs(i - page) <= 2 || i === 0 || i === totalPages - 1,
    );

    return (
        <>
            <Card className="overflow-hidden" padding={0}>
                {/* 일괄 처리 바 */}
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
                            선택된 항목: <span className="font-label-sm text-label-sm text-primary">{selectedOnPage.length}</span>건
                        </span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                        <Button label="선택 정상 전환" size="sm" variant="secondary" type="button" isDisabled={processing} onClick={() => runBulk('ACTIVATE')} />
                        <Button label="선택 계정 정지" size="sm" variant="destructive" type="button" isDisabled={processing} onClick={() => runBulk('SUSPEND')} />
                    </div>
                </div>

                {/* 표 */}
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
                                            checked={selectedOnPage.includes(member.id)}
                                            onChange={(e) => toggleOne(member.id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-3.5 px-space-md font-mono text-primary font-medium">{member.code}</td>
                                    <td className="py-3.5 px-space-md">
                                        <span className="text-primary font-medium group-hover:underline underline-offset-2">{member.email}</span>
                                    </td>
                                    <td className="py-3.5 px-space-md text-on-surface-variant">{member.nickname}</td>
                                    <td className="py-3.5 px-space-md text-center">
                                        <Badge variant={member.role === '관리자' ? 'info' : member.role === '판매자' ? 'success' : 'neutral'} label={member.role} />
                                    </td>
                                    <td className="py-3.5 px-space-md text-center">
                                        <Badge variant={member.status === '정상' ? 'success' : member.status === '정지' ? 'error' : member.status === '탈퇴 대기' ? 'warning' : 'neutral'} label={member.status} />
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
            </Card>

            {/* 하단: 총 인원, 페이지 이동, 페이지당 개수 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md py-space-xs">
                <Text color="secondary">총 <span className="font-semibold text-primary">{totalElements.toLocaleString('ko-KR')}</span>명 (선택 {selectedOnPage.length}명)</Text>

                <nav aria-label="페이지 이동" className="flex items-center gap-1">
                    <button className={PAGE_BUTTON} type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                        <Icon name="chevron_left" className="text-[16px]" />
                    </button>
                    {pageNumbers.map((i, idx) => (
                        <span key={i} className="flex items-center gap-1">
                            {idx > 0 && i - pageNumbers[idx - 1] > 1 && <span className="px-1 text-outline">…</span>}
                            <button
                                className={
                                    i === page
                                        ? 'w-8 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center'
                                        : PAGE_BUTTON
                                }
                                type="button"
                                onClick={() => onPageChange(i)}
                            >
                                {i + 1}
                            </button>
                        </span>
                    ))}
                    <button
                        className={PAGE_BUTTON}
                        type="button"
                        disabled={totalPages === 0 || page >= totalPages - 1}
                        onClick={() => onPageChange(page + 1)}
                    >
                        <Icon name="chevron_right" className="text-[16px]" />
                    </button>
                </nav>

                <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                    <span>페이지당 표시:</span>
                    <select
                        className="h-8 px-2 bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-primary focus:border-primary focus:outline-none cursor-pointer"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        <option value={10}>10개씩</option>
                        <option value={20}>20개씩</option>
                        <option value={50}>50개씩</option>
                    </select>
                </div>
            </div>
        </>
    );
}
