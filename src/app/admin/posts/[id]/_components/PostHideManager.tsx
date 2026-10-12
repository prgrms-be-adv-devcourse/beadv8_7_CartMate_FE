'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const HIDE_REASONS = [
    { value: '부적절한 상품 규정 위반', label: '부적절한 상품 (체육시설/용품 규격 미달)' },
    { value: '허위 정보 표기 및 과장 광고', label: '허위 정보 표기 및 과장 광고' },
    { value: '가격 오류 및 부정 가격 책정', label: '가격 오류 및 부정 가격 책정' },
    { value: '지식재산권 및 상표권 침해', label: '지식재산권 및 브랜드 상표권 침해' },
    { value: '기타 운영자 직권 사유', label: '기타 운영 정책 위반 (직접 사유 기재)' },
];

// 판매글 숨김 상태 관리: 상단 헤더/배지, 숨김 배너, 숨김 사유 폼, 확인 모달
// children 으로 받은 정적 섹션(상품 정보, 옵션 표)은 배너와 숨김 관리 카드 사이에 렌더링된다.
export default function PostHideManager({ postId, children }: { postId: string; children: ReactNode }) {
    const [hidden, setHidden] = useState(false);
    const [reason, setReason] = useState(HIDE_REASONS[0].value);
    const [memo, setMemo] = useState('');
    const [appliedReason, setAppliedReason] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const applyHide = () => {
        setAppliedReason(reason);
        setHidden(true);
        setModalOpen(false);
    };

    const resetForm = () => {
        setReason(HIDE_REASONS[0].value);
        setMemo('');
    };

    return (
        <>
            {/* 1. Header & Actions Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-outline-variant">
                <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                        <span>판매글 관리</span>
                        <span className="text-outline">/</span>
                        <span>판매글 목록</span>
                        <span className="text-outline">/</span>
                        <span className="text-primary font-semibold">판매글 상세 ({postId})</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">판매글 상세 정보</h1>
                        {hidden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant">
                                <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                                관리자 숨김
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-on-primary">
                                <span className="w-1.5 h-1.5 rounded-full bg-surface"></span>
                                판매 중
                            </span>
                        )}
                    </div>
                </div>
                {/* Top Action Buttons */}
                <div className="flex items-center gap-space-sm flex-wrap">
                    <Link
                        href={ROUTES.adminPosts}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
                    >
                        <Icon name="arrow_back" className="text-[18px]" />
                        목록으로
                    </Link>
                    {hidden ? (
                        <button
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded bg-surface-container-lowest border border-primary text-primary font-label-md text-label-md hover:bg-surface-container transition-colors"
                            type="button"
                            onClick={() => setHidden(false)}
                        >
                            <Icon name="visibility" className="text-[18px]" />
                            숨김 해제 (판매 재개)
                        </button>
                    ) : (
                        <button
                            className="inline-flex items-center gap-1.5 h-10 px-4 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity"
                            type="button"
                            onClick={() => setModalOpen(true)}
                        >
                            <Icon name="visibility_off" className="text-[18px]" />
                            관리자 숨김 처리
                        </button>
                    )}
                </div>
            </div>
            {/* Status Alert Banner (Shown if Hidden) */}
            {hidden && (
                <div className="flex items-center justify-between p-space-md rounded bg-surface-container-high border border-outline-variant">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="report" className="text-outline" />
                        <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface">현재 관리자에 의해 노출이 중단된 판매글입니다.</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">사유: {appliedReason} (적용 관리자: admin_master)</span>
                        </div>
                    </div>
                    <span className="font-caption text-caption text-outline font-mono">CODE: ADMIN_SUPPRESSION_APPLIED</span>
                </div>
            )}
            {children}
            {/* 4. Inline Admin Hide Reason Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="shield" className="text-on-surface-variant text-[20px]" />
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">관리자 조치: 숨김 관리</h3>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">플랫폼 운영 관리 정책 준수</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                    <div className="lg:col-span-5 flex flex-col gap-space-sm">
                        <div className="flex items-center gap-2">
                            <Icon name="info" className="text-[18px] text-outline" />
                            <span className="font-label-md text-label-md text-on-surface">관리자 숨김 사유 설정</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            숨김 처리된 판매글은 일반 사용자 검색 목록 및 카테고리에서 즉시 제외되며, 결제가 차단됩니다. 사유와 메모는 판매자에게 시스템 알림으로 발송될 수
                            있습니다.
                        </p>
                    </div>
                    <div className="lg:col-span-7 bg-surface-container-low p-space-md rounded border border-outline-variant flex flex-col gap-space-md">
                        {/* Reason Select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="hideReasonSelect">
                                사유 선택 <span className="text-outline">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary appearance-none"
                                    id="hideReasonSelect"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    {HIDE_REASONS.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                                <Icon name="expand_more" className="absolute right-3 top-2.5 text-outline pointer-events-none text-[20px]" />
                            </div>
                        </div>
                        {/* Admin Memo */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-label-sm text-label-sm text-on-surface" htmlFor="hideReasonMemo">
                                관리자 메모 입력창 <span className="font-caption text-caption text-outline font-normal">(상세 소명 및 근거)</span>
                            </label>
                            <textarea
                                className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
                                id="hideReasonMemo"
                                placeholder="구체적인 위반 내역 또는 판매자 소명 요청 안내 사항을 입력하세요."
                                rows={3}
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                        </div>
                        {/* Button Actions */}
                        <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-outline-variant">
                            <button
                                className="h-9 px-4 rounded bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                                type="button"
                                onClick={resetForm}
                            >
                                취소 / 초기화
                            </button>
                            <button
                                className="h-9 px-4 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity"
                                type="button"
                                onClick={applyHide}
                            >
                                숨김 확정 처리
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Interactive Modal Overlay (Triggered by Header Button) */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest border border-primary w-full max-w-[480px] rounded p-space-lg flex flex-col gap-space-md">
                        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                            <div className="flex items-center gap-space-xs">
                                <Icon name="warning" className="text-primary text-[20px]" />
                                <h4 className="font-headline-sm text-headline-sm text-on-surface">판매글 관리자 숨김 확인</h4>
                            </div>
                            <button className="text-outline hover:text-primary transition-colors" type="button" onClick={() => setModalOpen(false)}>
                                <Icon name="close" className="text-[20px]" />
                            </button>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                            해당 판매글 <span className="font-mono font-semibold text-primary">{postId}</span>을(를) &apos;관리자 숨김&apos; 상태로 전환하시겠습니까? 숨김 후에는
                            검색 노출이 중지됩니다.
                        </p>
                        <div className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded border border-outline-variant">
                            <span className="font-label-sm text-label-sm text-on-surface">적용할 숨김 사유</span>
                            <div className="font-body-sm text-body-sm text-primary font-medium">{reason}</div>
                        </div>
                        <div className="flex items-center justify-end gap-space-sm pt-space-xs">
                            <button
                                className="h-10 px-4 rounded border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container"
                                type="button"
                                onClick={() => setModalOpen(false)}
                            >
                                취소
                            </button>
                            <button className="h-10 px-5 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90" type="button" onClick={applyHide}>
                                숨김 확정
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
