'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import {
    fetchAdminMemberDetail,
    memberCode,
    ROLE_LABEL,
    type AdminMemberDetail,
} from '../../_components/MemberDetailContent';

const REASONS = [
    { value: 'FRAUD', label: '부정 거래 (허위 주문, 자전거래, 부당 이득 취득 등)' },
    { value: 'ABUSE', label: '욕설·비방 (커뮤니티, 1:1 문의, 공동구매 분쟁 야기)' },
    { value: 'OTHER', label: '기타 (직접 사유 상세 입력)' },
] as const;

const DURATIONS = [
    { value: 'DAYS_7', label: '7일 정지', sub: '단기 경고 조치', days: 7 },
    { value: 'DAYS_30', label: '30일 정지', sub: '중과실 제재', days: 30 },
    { value: 'PERMANENT', label: '영구 정지', sub: '회원 영구 박탈', days: null },
] as const;

type Reason = (typeof REASONS)[number]['value'];
type Duration = (typeof DURATIONS)[number]['value'];

function formatDate(d: Date) {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 회원 정지 처리 모달
export default function SuspendModal({ memberId, backHref }: { memberId: string; backHref: string }) {
    const router = useRouter();
    const [member, setMember] = useState<AdminMemberDetail | null>(null);
    const [reason, setReason] = useState<Reason>('OTHER');
    const [detail, setDetail] = useState('');
    const [duration, setDuration] = useState<Duration>('DAYS_7');
    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAdminMemberDetail(memberId)
            .then((m) => {
                setMember(m);
                // 정지할 수 없는 회원이면 상세로 돌려보냄
                if (m.status !== 'ACTIVE' || m.role === 'ADMIN') {
                    alert(m.role === 'ADMIN' ? '관리자 계정은 정지할 수 없습니다.' : '정상 상태인 회원만 정지할 수 있습니다.');
                    router.replace(backHref);
                }
            })
            .catch((e) => setError(e instanceof ApiError ? e.message : '회원 정보를 불러오지 못했습니다.'));
    }, [memberId, backHref, router]);

    const selectedDuration = DURATIONS.find((d) => d.value === duration)!;
    const now = new Date();
    const expiry =
        selectedDuration.days === null
            ? '영구 (해제 없음)'
            : formatDate(new Date(now.getTime() + selectedDuration.days * 86_400_000));

    const isSeller = member?.role === 'SELLER';

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!member) return;
        setError(null);

        if (!detail.trim()) {
            setError('상세 사유를 입력해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            await apiFetch(`/api/admin/members/${member.id}/suspend`, {
                method: 'POST',
                body: JSON.stringify({ reasonType: reason, reasonDetail: detail.trim(), duration }),
            });
            alert(`${member.nickname}(${memberCode(member.id)}) 회원이 ${selectedDuration.label} 처리되었습니다.`);
            router.push(backHref);
            router.refresh();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : '정지 처리 중 오류가 발생했습니다.');
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-space-md">
            <div
                aria-labelledby="modalTitle"
                aria-modal="true"
                className="w-full max-w-[540px] bg-surface-container-lowest border-2 border-primary rounded shadow-xl flex flex-col overflow-hidden"
                role="dialog"
            >
                {/* 헤더 */}
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

                {!member ? (
                    <div className="p-space-xl">
                        {error ? (
                            <p className="font-body-sm text-body-sm text-error">{error}</p>
                        ) : (
                            <div className="h-40 rounded bg-surface-container animate-pulse" />
                        )}
                    </div>
                ) : (
                    <form className="p-space-xl flex flex-col gap-space-lg overflow-y-auto max-h-[calc(85vh-130px)]" onSubmit={handleSubmit}>
                        {/* 대상 회원 */}
                        <div className="bg-surface p-space-md border border-outline-variant rounded flex flex-col gap-space-xs">
                            <div className="flex items-center justify-between">
                                <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">정지 대상 회원 식별 정보</span>
                                <span className="font-label-sm text-label-sm bg-primary text-on-primary px-space-sm py-0.5 rounded">
                                    {ROLE_LABEL[member.role]}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-space-sm mt-space-xs">
                                <span className="font-headline-sm text-headline-sm text-primary">{member.nickname}</span>
                                <span className="font-body-sm text-body-sm text-outline">({memberCode(member.id)})</span>
                            </div>
                            <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                                <Icon name="mail" className="text-[16px] text-outline" />
                                <span>{member.email}</span>
                            </div>
                        </div>

                        {/* 판매자 주의사항 */}
                        {isSeller && (
                            <div className="bg-surface-container-high border-2 border-primary/80 rounded p-space-md flex items-start gap-space-sm">
                                <Icon name="warning" className="text-primary text-[24px] shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-space-xs text-left">
                                    <span className="font-label-md text-label-md text-primary font-bold">판매자 계정 정지 주의사항</span>
                                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                                        판매자 계정을 정지하면 정지 이벤트가 발행되어, 해당 판매자가 등록한{' '}
                                        <strong className="font-semibold">판매글이 숨김 처리</strong>되고 신규 참여가 차단됩니다.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 사유 */}
                        <div className="flex flex-col gap-space-sm">
                            <div className="font-label-md text-label-md text-primary flex items-center justify-between">
                                <span>
                                    정지 사유 선택 <span className="text-error">*</span>
                                </span>
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
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                                name="suspensionReason"
                                                type="radio"
                                                checked={checked}
                                                onChange={() => setReason(item.value)}
                                            />
                                            <span className={checked ? 'font-label-md text-label-md text-primary font-semibold' : 'font-body-md text-body-md text-primary'}>
                                                {item.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="flex flex-col gap-space-xs mt-space-xs">
                                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="detailReason">
                                    상세 사유 기록 <span className="text-error">*</span>
                                </label>
                                <textarea
                                    className="w-full p-space-sm rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-primary placeholder:text-outline focus:outline-none focus:border-primary resize-none transition-colors"
                                    id="detailReason"
                                    placeholder="상세 사유를 입력하세요. (예: 미배송 클레임 3건 발생 후 소명 기한 경과)"
                                    rows={3}
                                    maxLength={300}
                                    value={detail}
                                    onChange={(e) => setDetail(e.target.value)}
                                />
                                <span className="font-caption text-caption text-outline text-right">{detail.length} / 300자 (제재 이력에 영구 보존)</span>
                            </div>
                        </div>

                        {/* 기간 */}
                        <div className="flex flex-col gap-space-sm">
                            <div className="font-label-md text-label-md text-primary flex items-center justify-between">
                                <span>
                                    정지 기간 설정 <span className="text-error">*</span>
                                </span>
                                <span className="font-caption text-caption text-outline">해제 일시는 자동 계산됩니다</span>
                            </div>
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
                                            <input className="sr-only" name="duration" type="radio" checked={active} onChange={() => setDuration(item.value)} />
                                            <span className={active ? 'font-label-md text-label-md text-on-primary font-bold' : 'font-label-md text-label-md text-primary'}>
                                                {item.label}
                                            </span>
                                            <span className={active ? 'font-caption text-caption text-on-primary/80 mt-0.5' : 'font-caption text-caption text-outline mt-0.5'}>
                                                {item.sub}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="p-space-xs px-space-sm bg-surface-container rounded text-body-sm font-body-sm flex items-center justify-between text-on-surface-variant">
                                <span>
                                    효력 발생: <strong>즉시 ({formatDate(now)})</strong>
                                </span>
                                <span>
                                    해제 예정: <strong>{expiry}</strong>
                                </span>
                            </div>
                        </div>

                        {/* 확인 */}
                        <label className="flex items-start gap-space-sm p-space-sm rounded bg-surface border border-outline-variant cursor-pointer">
                            <input
                                className="mt-0.5 w-4 h-4 accent-primary rounded cursor-pointer"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span className="font-body-sm text-body-sm text-primary leading-tight">
                                위 회원에 대한 정지 조치에 동의하며, 처리 내역이 제재 이력에 기록됨을 확인했습니다.
                            </span>
                        </label>

                        {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

                        {/* 버튼 */}
                        <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant">
                            <Link
                                href={backHref}
                                className="h-11 px-space-lg inline-flex items-center rounded border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-primary hover:bg-surface-container transition-colors"
                            >
                                취소
                            </Link>
                            <button
                                className="h-11 px-space-lg rounded border border-primary bg-primary font-label-md text-label-md text-on-primary hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-space-xs shadow-sm disabled:opacity-50"
                                disabled={submitting || !agreed}
                                type="submit"
                            >
                                <Icon name={submitting ? 'refresh' : 'block'} className={submitting ? 'text-[18px] animate-spin' : 'text-[18px]'} />
                                <span>{submitting ? '처리 중...' : '정지 처리 확정'}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}