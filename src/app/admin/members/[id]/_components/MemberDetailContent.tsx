'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

// ===== 백엔드 응답 (AdminMemberDetailResponse) =====
export type Suspension = {
    id: number;
    reasonType: 'FRAUD' | 'ABUSE' | 'OTHER';
    reasonDetail: string;
    suspendedAt: string;
    suspendedUntil: string | null;
    releasedAt: string | null;
    releaseType: 'EXPIRED' | 'MANUAL' | null;
    adminId: number;
    adminNickname: string;
};

export type AdminMemberDetail = {
    id: number;
    email: string;
    nickname: string;
    phone: string;
    birthDate: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
    status: 'ACTIVE' | 'SUSPENDED' | 'WITHDRAWAL_PENDING' | 'WITHDRAWN';
    joinedAt: string;
    walletBalance: number;
    activeGroupCount: number;
    recentOrderCount: number;
    currentSuspension: Suspension | null;
    suspensions: Suspension[];
};

export const ROLE_LABEL: Record<AdminMemberDetail['role'], string> = { BUYER: '일반 회원', SELLER: '판매자 회원', ADMIN: '관리자' };
export const REASON_LABEL: Record<Suspension['reasonType'], string> = {
    FRAUD: '부정 거래',
    ABUSE: '욕설·비방',
    OTHER: '기타',
};
const STATUS_LABEL: Record<AdminMemberDetail['status'], string> = { ACTIVE: '정상 회원', SUSPENDED: '정지 회원', WITHDRAWAL_PENDING: '탈퇴 대기 회원', WITHDRAWN: '탈퇴 회원' };

export const memberCode = (id: number | string) => `M-${String(id).padStart(5, '0')}`;

export function formatDateTime(iso: string | null) {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function periodLabel(s: Suspension) {
    if (!s.suspendedUntil) return '영구 정지';
    const days = Math.round((new Date(s.suspendedUntil).getTime() - new Date(s.suspendedAt).getTime()) / 86_400_000);
    return `${days}일 계정 정지`;
}

function suspensionStatusLabel(s: Suspension) {
    if (!s.releasedAt) return '정지 중';
    return s.releaseType === 'EXPIRED' ? '기간 만료 해제' : '관리자 해제';
}

const won = (n: number) => `${n.toLocaleString('ko-KR')} 원`;

export async function fetchAdminMemberDetail(memberId: string) {
    const res = await apiFetch<AdminMemberDetail>(`/api/admin/members/${memberId}`);
    return res.data as AdminMemberDetail;
}

export default function MemberDetailContent({ memberId }: { memberId: string }) {
    const [member, setMember] = useState<AdminMemberDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activating, setActivating] = useState(false);

    const load = useCallback(async () => {
        try {
            setMember(await fetchAdminMemberDetail(memberId));
            setError(null);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : '회원 정보를 불러오지 못했습니다.');
        }
    }, [memberId]);

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0);
        return () => window.clearTimeout(timer);
    }, [load]);

    const handleActivate = async () => {
        if (!member || !window.confirm(`${member.nickname} 회원의 정지를 해제할까요?`)) return;
        setActivating(true);
        try {
            await apiFetch(`/api/admin/members/${member.id}/activate`, { method: 'POST' });
            alert('정지가 해제되었습니다.');
            await load();
        } catch (e) {
            alert(e instanceof ApiError ? e.message : '정지 해제 중 오류가 발생했습니다.');
        } finally {
            setActivating(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center gap-space-md py-space-xl">
                <Text className="text-error">{error}</Text>
                <Button label="목록으로 돌아가기" href={ROUTES.adminMembers} variant="secondary" />
            </div>
        );
    }

    if (!member) {
        return <div className="h-[600px] rounded bg-surface-container animate-pulse" />;
    }

    const code = memberCode(member.id);
    const isSuspended = member.status === 'SUSPENDED';
    const canSuspend = member.status === 'ACTIVE' && member.role !== 'ADMIN';
    const current = member.currentSuspension;

    const kpis = [
        { label: '회원 고유 식별 번호', value: code, sub: ROLE_LABEL[member.role] },
        { label: '참여 중인 공동구매', value: `${member.activeGroupCount} 건`, sub: '현재 기준' },
        { label: '보유 예치금 잔액', value: won(member.walletBalance), sub: '전체 잔액' },
        { label: '최근 주문', value: `${member.recentOrderCount} 건`, sub: '최근 5건까지 집계' },
    ];

    const profileLeft = [
        { label: '회원번호', value: code, mono: true },
        { label: '이메일 계정', value: member.email, mono: false },
        { label: '닉네임', value: member.nickname, mono: false },
        { label: '휴대폰 번호', value: member.phone, mono: false },
    ];

    return (
        <div className="flex flex-col w-full gap-space-lg">
            {/* 상단 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-outline-variant">
                <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                        <span>회원 관리</span>
                        <span className="text-outline">/</span>
                        <Link href={ROUTES.adminMembers} className="hover:text-primary">
                            회원 목록
                        </Link>
                        <span className="text-outline">/</span>
                        <span className="text-primary font-semibold">회원 상세 ({code})</span>
                    </div>
                    <div className="flex items-center gap-space-md">
                        <Heading level={1}>회원 상세 정보</Heading>
                        <Badge variant={isSuspended ? 'error' : member.status === 'ACTIVE' ? 'success' : 'neutral'} label={STATUS_LABEL[member.status]} />
                    </div>
                </div>
                <div className="flex items-center gap-space-sm">
                    <Button label="목록으로 돌아가기" href={ROUTES.adminMembers} variant="secondary" icon={<Icon name="arrow_back" className="text-[18px]" />} />
                    {canSuspend && (
                        <Button label="회원 정지 처리" href={ROUTES.adminMemberSuspend(String(member.id))} icon={<Icon name="block" className="text-[18px]" />} />
                    )}
                    {isSuspended && (
                        <Button label={activating ? '해제 중...' : '정지 해제'} icon={<Icon name="lock_open" className="text-[18px]" />} isDisabled={activating} onClick={handleActivate} />
                    )}
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="flex flex-col justify-between" padding={4}>
                        <Text color="secondary">{kpi.label}</Text>
                        <div className="flex items-baseline justify-between mt-space-xs">
                            <Heading level={3}>{kpi.value}</Heading>
                            <Text color="secondary">{kpi.sub}</Text>
                        </div>
                    </Card>
                ))}
            </div>

            {/* 기본 프로필 */}
            <Card className="overflow-hidden" padding={0}>
                <div className="px-space-lg py-space-md border-b border-outline-variant flex items-center gap-space-sm bg-surface-container-low">
                    <Icon name="badge" className="text-primary text-[20px]" />
                    <Heading level={2}>회원 기본 프로필</Heading>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
                    <div className="flex flex-col divide-y divide-outline-variant">
                        {profileLeft.map((row) => (
                            <div key={row.label} className="flex items-center px-space-lg py-space-md">
                                <span className="w-36 font-label-md text-label-md text-on-surface-variant">{row.label}</span>
                                <span className={`font-body-md text-body-md text-primary${row.mono ? ' font-mono font-medium' : ''}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col divide-y divide-outline-variant">
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">가입일시</span>
                            <span className="font-body-md text-body-md text-primary">{formatDateTime(member.joinedAt)}</span>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">회원 구분</span>
                            <span className="font-body-md text-body-md text-primary">{ROLE_LABEL[member.role]}</span>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">생년월일</span>
                            <span className="font-body-md text-body-md text-primary">{member.birthDate}</span>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">현재 계정 상태</span>
                            <div className="flex items-center gap-space-xs">
                                <span className={`w-2 h-2 rounded-full inline-block ${isSuspended ? 'bg-error' : 'bg-primary'}`}></span>
                                <span className="font-body-md text-body-md text-primary font-medium">
                                    {isSuspended
                                        ? current?.suspendedUntil
                                            ? `정지 중 (${formatDateTime(current.suspendedUntil)}까지)`
                                            : '영구 정지 (로그인 불가)'
                                        : member.status === 'WITHDRAWN'
                                          ? '탈퇴 처리됨'
                                          : '정상 이용 중 (로그인 및 공동구매 주문 가능)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 제재 이력 */}
            <Card className="overflow-hidden" padding={0}>
                <div className="px-space-lg py-space-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="gavel" className="text-primary text-[20px]" />
                        <Heading level={2}>계정 제재 및 정지 이력</Heading>
                        <Badge variant="neutral" label={`총 ${member.suspensions.length}건 기록`} />
                    </div>
                </div>

                {member.suspensions.length === 0 ? (
                    <Text className="px-space-lg py-space-xl text-center" color="secondary">제재 이력이 없습니다.</Text>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse font-body-sm text-body-sm">
                            <thead>
                                <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
                                    <th className="py-space-sm px-space-md whitespace-nowrap">처리 일시 (정지)</th>
                                    <th className="py-space-sm px-space-md whitespace-nowrap">해제 일시</th>
                                    <th className="py-space-sm px-space-md whitespace-nowrap">제재 유형 / 기간</th>
                                    <th className="py-space-sm px-space-md min-w-[240px]">상세 제재 사유</th>
                                    <th className="py-space-sm px-space-md whitespace-nowrap">처리 관리자</th>
                                    <th className="py-space-sm px-space-md whitespace-nowrap text-right">처리 상태</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant text-primary">
                                {member.suspensions.map((s) => (
                                    <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                                        <td className="py-space-md px-space-md font-mono whitespace-nowrap">{formatDateTime(s.suspendedAt)}</td>
                                        <td className="py-space-md px-space-md font-mono whitespace-nowrap">
                                            {s.releasedAt
                                                ? formatDateTime(s.releasedAt)
                                                : s.suspendedUntil
                                                  ? `${formatDateTime(s.suspendedUntil)} (예정)`
                                                  : '-'}
                                        </td>
                                        <td className="py-space-md px-space-md whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{REASON_LABEL[s.reasonType]}</span>
                                                <span className="font-caption text-caption text-secondary">{periodLabel(s)}</span>
                                            </div>
                                        </td>
                                        <td className="py-space-md px-space-md">
                                            <span className="text-on-surface-variant">{s.reasonDetail}</span>
                                        </td>
                                        <td className="py-space-md px-space-md whitespace-nowrap">{s.adminNickname}</td>
                                        <td className="py-space-md px-space-md whitespace-nowrap text-right">
                                            <Badge variant={s.releasedAt ? 'neutral' : 'error'} label={suspensionStatusLabel(s)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-space-lg py-space-sm bg-surface text-center border-t border-outline-variant">
                    <span className="font-caption text-caption text-on-surface-variant">모든 제재 기록은 영구 보존됩니다.</span>
                </div>
            </Card>
        </div>
    );
}
