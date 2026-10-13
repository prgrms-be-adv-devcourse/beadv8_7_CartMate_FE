'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';

const REASONS = [
    { value: 'FRAUD', label: '부정 거래 (허위 주문, 자전거래, 부당 이득 취득 등)' },
    { value: 'ABUSE', label: '욕설·비방 (커뮤니티, 1:1 문의, 공동구매 분쟁 야기)' },
    { value: 'OTHER', label: '기타 (직접 사유 상세 입력)' },
];

const DURATIONS = [
    { value: '7', label: '7일 정지', sub: '단기 경고 조치', expiry: '2024.03.28 23:59:59' },
    { value: '30', label: '30일 정지', sub: '중과실 제재', expiry: '2024.04.20 23:59:59' },
    { value: 'PERMANENT', label: '영구 정지', sub: '회원 영구 박탈', expiry: '영구 (해제 없음)' },
];

// 회원 정지 처리 모달 (정지 사유/기간 선택 상태 관리)
export default function SuspendModal({ backHref }: { backHref: string }) {
    const router = useRouter();
    const [reason, setReason] = useState('OTHER');
    const [duration, setDuration] = useState('PERMANENT');
    const [submitting, setSubmitting] = useState(false);

    const expiry = DURATIONS.find((item) => item.value === duration)?.expiry;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
            alert('[처리 완료] M-09841 프로스포츠코리아 회원이 영구 정지되었으며, 등록 판매글 14건이 관리자 숨김 처리되었습니다.');
            router.push(backHref);
        }, 700);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-space-md">
            {/* Focused Modal Container */}
            <div
                aria-labelledby="modalTitle"
                aria-modal="true"
                className="w-full max-w-[540px] bg-surface-container-lowest border-2 border-primary rounded shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-150"
                role="dialog"
            >
                {/* 1. Modal Header */}
                <div className="flex items-center justify-between px-space-xl py-space-lg border-b border-outline-variant bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="gavel" className="text-primary text-[22px]" />
                        <h2 className="font-headline-md text-headline-md text-primary" id="modalTitle">
                            회원 정지 처리
                        </h2>
                    </div>
                    <Link
                        aria-label="닫기"
                        href={backHref}
                        className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
                    >
                        <Icon name="close" className="text-[18px]" />
                    </Link>
                </div>
                {/* Modal Body Content */}
                <form className="p-space-xl flex flex-col gap-space-lg overflow-y-auto max-h-[calc(85vh-130px)]" onSubmit={handleSubmit}>
                    {/* 2. Target Member Summary in modal */}
                    <div className="bg-surface p-space-md border border-outline-variant rounded flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">정지 대상 회원 식별 정보</span>
                            <span className="font-label-sm text-label-sm bg-primary text-on-primary px-space-sm py-0.5 rounded">판매자 회원</span>
                        </div>
                        <div className="flex items-baseline gap-space-sm mt-space-xs">
                            <span className="font-headline-sm text-headline-sm text-primary">프로스포츠코리아</span>
                            <span className="font-body-sm text-body-sm text-outline">(M-09841)</span>
                        </div>
                        <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                            <Icon name="mail" className="text-[16px] text-outline" />
                            <span>sports_gear@biz.co.kr</span>
                        </div>
                    </div>
                    {/* 3. Seller Warning Notice Box */}
                    <div className="bg-surface-container-high border-2 border-primary/80 rounded p-space-md flex items-start gap-space-sm">
                        <Icon name="warning" className="text-primary text-[24px] shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-space-xs text-left">
                            <span className="font-label-md text-label-md text-primary font-bold">판매자 계정 정지 주의사항</span>
                            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                                판매자 계정 정지 시, 해당 판매자가 등록한 <strong className="font-semibold underline">모든 판매글(총 14건)</strong>이 즉시{' '}
                                <strong className="font-semibold">‘관리자 숨김’</strong> 상태로 일괄 전환되며 일반 구매자에게 노출 및 신규 참여가 전면
                                차단됩니다.
                            </p>
                        </div>
                    </div>
                    {/* 4. Suspension Reason Selection */}
                    <div className="flex flex-col gap-space-sm">
                        <div className="font-label-md text-label-md text-primary flex items-center justify-between">
                            <span>
                                정지 사유 선택 <span className="text-error">*</span>
                            </span>
                            <span className="font-caption text-caption text-outline">필수 선택 항목</span>
                        </div>
                        <div className="flex flex-col gap-space-xs border border-outline-variant p-space-sm rounded bg-surface">
                            {REASONS.map((item) => {
                                const checked = reason === item.value;
                                return (
                                    <label
                                        key={item.value}
                                        className={`flex items-center gap-space-sm p-space-xs rounded hover:bg-surface-container cursor-pointer transition-colors${
                                            checked ? ' bg-surface-container-high/60' : ''
                                        }`}
                                    >
                                        <input
                                            className="w-4 h-4 text-primary accent-primary cursor-pointer"
                                            name="suspensionReason"
                                            type="radio"
                                            value={item.value}
                                            checked={checked}
                                            onChange={() => setReason(item.value)}
                                        />
                                        <span
                                            className={
                                                checked
                                                    ? 'font-label-md text-label-md text-primary font-semibold'
                                                    : 'font-body-md text-body-md text-primary'
                                            }
                                        >
                                            {item.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {/* Detailed Reason Textarea */}
                        <div className="flex flex-col gap-space-xs mt-space-xs">
                            <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="detailReason">
                                상세 사유 기록 <span className="text-error">*</span>
                            </label>
                            <textarea
                                className="w-full p-space-sm rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-primary placeholder:text-outline focus:outline-none focus:border-primary resize-none transition-colors"
                                id="detailReason"
                                name="detailReason"
                                placeholder="상세 사유를 입력하세요. (예: 정산 허위 서류 제출 및 미배송 클레임 다수 발생)"
                                required={reason === 'OTHER'}
                                rows={3}
                                maxLength={300}
                                defaultValue="정산 허위 서류 제출 의혹 및 미배송 클레임 다수(3건) 발생에 따른 소명 기한(3일) 도과로 인한 긴급 정지 조치"
                            />
                            <span className="font-caption text-caption text-outline text-right">최대 300자 (감사 로그에 영구 보존됩니다)</span>
                        </div>
                    </div>
                    {/* 5. Suspension Duration Selection */}
                    <div className="flex flex-col gap-space-sm">
                        <div className="font-label-md text-label-md text-primary flex items-center justify-between">
                            <span>
                                정지 기간 설정 <span className="text-error">*</span>
                            </span>
                            <span className="font-caption text-caption text-outline">해제 일시는 자동 계산됩니다</span>
                        </div>
                        {/* Segmented Options */}
                        <div aria-label="정지 기간 선택" className="grid grid-cols-3 gap-space-sm" role="radiogroup">
                            {DURATIONS.map((item) => {
                                const active = duration === item.value;
                                return (
                                    <label
                                        key={item.value}
                                        className={
                                            active
                                                ? 'flex flex-col items-center justify-center p-space-sm border-2 border-primary bg-primary text-on-primary rounded cursor-pointer transition-all text-center shadow-sm'
                                                : 'flex flex-col items-center justify-center p-space-sm border-2 border-outline-variant rounded cursor-pointer hover:border-primary transition-all text-center bg-surface-container-lowest'
                                        }
                                    >
                                        <input
                                            className="sr-only"
                                            name="duration"
                                            type="radio"
                                            value={item.value}
                                            checked={active}
                                            onChange={() => setDuration(item.value)}
                                        />
                                        <span
                                            className={
                                                active
                                                    ? 'font-label-md text-label-md text-on-primary font-bold'
                                                    : 'font-label-md text-label-md text-primary'
                                            }
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            className={
                                                active
                                                    ? 'font-caption text-caption text-on-secondary-container mt-0.5'
                                                    : 'font-caption text-caption text-outline mt-0.5'
                                            }
                                        >
                                            {item.sub}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="p-space-xs px-space-sm bg-surface-container rounded text-body-sm font-body-sm flex items-center justify-between text-on-surface-variant">
                            <span>
                                예정 효력 발생: <strong>즉시 (2024.03.21)</strong>
                            </span>
                            <span>
                                예정 해제일: <strong>{expiry}</strong>
                            </span>
                        </div>
                    </div>
                    {/* Confirmation Checkbox */}
                    <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface border border-outline-variant cursor-pointer">
                        <input className="mt-0.5 w-4 h-4 text-primary accent-primary rounded cursor-pointer" required type="checkbox" />
                        <span className="font-body-sm text-body-sm text-primary leading-tight">
                            위 회원에 대한 정지 조치 및 판매글 14건의 관리자 숨김 처리에 동의하며, 행정 처리 내역이 관리자 감사 로그에 기록됨을 확인했습니다.
                        </span>
                    </label>
                    {/* 6. Modal Footer Action Buttons */}
                    <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant">
                        <Link
                            href={backHref}
                            className="h-11 px-space-lg inline-flex items-center rounded border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-primary hover:bg-surface-container transition-colors"
                        >
                            취소
                        </Link>
                        <button
                            className="h-11 px-space-lg rounded border border-primary bg-primary font-label-md text-label-md text-on-primary hover:bg-on-background active:scale-[0.98] transition-all flex items-center gap-space-xs shadow-sm"
                            disabled={submitting}
                            type="submit"
                        >
                            <Icon name={submitting ? 'refresh' : 'block'} className={submitting ? 'text-[18px] animate-spin' : 'text-[18px]'} />
                            <span>{submitting ? '처리 중...' : '정지 처리 확정'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
