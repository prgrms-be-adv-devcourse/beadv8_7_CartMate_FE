'use client';

import Link from 'next/link';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
import { useGetAdminDashboard } from '@/api/generated/admin-dashboard-controller/admin-dashboard-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

const won = (n?: number) => `₩ ${(n ?? 0).toLocaleString('ko-KR')}`;
const count = (n?: number) => `${(n ?? 0).toLocaleString('ko-KR')}`;

const ROLE_LABEL: Record<string, string> = { BUYER: '구매자', SELLER: '판매자', ADMIN: '관리자' };
const STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'error' | 'warning' | 'neutral' }> = {
    ACTIVE: { text: '정상', variant: 'success' },
    SUSPENDED: { text: '정지', variant: 'error' },
    WITHDRAWAL_PENDING: { text: '탈퇴 대기', variant: 'warning' },
    WITHDRAWN: { text: '탈퇴', variant: 'neutral' },
};

// 관리자 첫 화면. 회원·오늘 결제 요약과 최근 가입 회원을 보여 준다.
export default function AdminDashboard() {
    // 대시보드는 들어올 때마다 최신 숫자를 보여 준다
    const query = useGetAdminDashboard({ query: { staleTime: 0 } });
    const data = query.data?.data;

    return (
        <div className="flex flex-col gap-space-xl">
            <div className="flex items-end justify-between">
                <div>
                    <Text color="secondary">관리자 콘솔</Text>
                    <Heading level={1}>대시보드</Heading>
                </div>
                <div className="flex items-center gap-space-sm">
                    {data?.generatedAt && <span className="font-caption text-caption text-outline">기준 {formatDateTime(data.generatedAt)}</span>}
                    <Button label="새로고침" icon={<Icon name="refresh" className="text-[16px]" />} onClick={() => void query.refetch()} isDisabled={query.isFetching} />
                </div>
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-4 gap-space-md" aria-hidden>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-28 rounded bg-surface-container animate-pulse" />
                    ))}
                </div>
            ) : !data ? (
                <Card className="flex flex-col items-center gap-space-md text-center" padding={8}>
                    <Text className="text-error">{errorMessage(query.error, '대시보드를 불러오지 못했습니다.')}</Text>
                    <Button label="다시 시도" onClick={() => void query.refetch()} />
                </Card>
            ) : (
                <>
                    {/* 회원 */}
                    <section className="flex flex-col gap-space-sm">
                        <Heading level={2}>회원</Heading>
                        <div className="grid grid-cols-4 gap-space-md">
                            <StatCard icon="group" label="전체 회원" value={`${count(data.members?.total)}명`} href={ROUTES.adminMembers} />
                            <StatCard icon="person_add" label="오늘 가입" value={`${count(data.members?.todaySignups)}명`} highlight />
                            <StatCard
                                icon="storefront"
                                label="판매자 / 구매자"
                                value={`${count(data.members?.sellers)} / ${count(data.members?.buyers)}`}
                            />
                            <StatCard
                                icon="block"
                                label="정지 회원"
                                value={`${count(data.members?.suspended)}명`}
                                href={ROUTES.adminMembers}
                                warn={(data.members?.suspended ?? 0) > 0}
                            />
                        </div>
                    </section>

                    {/* 오늘 결제 */}
                    <section className="flex flex-col gap-space-sm">
                        <Heading level={2}>오늘 결제</Heading>
                        <div className="grid grid-cols-4 gap-space-md">
                            <StatCard icon="receipt_long" label="결제 건수" value={`${count(data.payments?.todayPaidCount)}건`} />
                            <StatCard icon="payments" label="결제 금액" value={won(data.payments?.todayPaidAmount)} highlight />
                            <StatCard icon="undo" label="환불 건수" value={`${count(data.payments?.todayRefundCount)}건`} />
                            <StatCard icon="money_off" label="환불 금액" value={won(data.payments?.todayRefundAmount)} />
                        </div>
                    </section>

                    {/* 최근 가입 */}
                    <Card className="space-y-space-md" padding={6}>
                        <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                            <Heading level={2}>최근 가입 회원</Heading>
                            <Button label="회원 관리" size="sm" href={ROUTES.adminMembers} icon={<Icon name="arrow_forward" className="text-[14px]" />} />
                        </div>
                        {(data.recentMembers ?? []).length === 0 ? (
                            <Text className="py-space-lg text-center" color="secondary">가입한 회원이 없습니다.</Text>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant font-label-sm text-label-sm text-outline">
                                        <th className="py-2 px-2 font-medium">닉네임</th>
                                        <th className="py-2 px-2 font-medium">이메일</th>
                                        <th className="py-2 px-2 font-medium">권한</th>
                                        <th className="py-2 px-2 font-medium">상태</th>
                                        <th className="py-2 px-2 font-medium text-right">가입일</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                                    {(data.recentMembers ?? []).map((m) => {
                                        const status = m.status ? STATUS_LABEL[m.status] : undefined;
                                        return (
                                            <tr key={m.id} className="hover:bg-surface-container-low">
                                                <td className="py-2 px-2">
                                                    <Link className="font-label-md text-on-surface hover:underline" href={ROUTES.adminMember(m.id ?? 0)}>
                                                        {m.nickname}
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-2 text-on-surface-variant">{m.email}</td>
                                                <td className="py-2 px-2">{ROLE_LABEL[m.role ?? ''] ?? m.role}</td>
                                                <td className="py-2 px-2"><Badge variant={status?.variant ?? 'neutral'} label={status?.text ?? m.status ?? '-'} /></td>
                                                <td className="py-2 px-2 text-right text-outline">{formatDateTime(m.joinedAt)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    href,
    highlight = false,
    warn = false,
}: {
    icon: string;
    label: string;
    value: string;
    href?: string;
    highlight?: boolean;
    warn?: boolean;
}) {
    const body = (
        <Card className={`flex h-full flex-col justify-between gap-space-sm ${highlight ? 'border-primary' : ''} ${href ? 'hover:border-primary transition-colors' : ''}`} padding={6}>
            <div className="flex items-center justify-between">
                <Text color="secondary">{label}</Text>
                <Icon name={icon} className="text-outline text-[18px]" />
            </div>
            <Heading level={3} className={warn ? 'text-error' : undefined}>{value}</Heading>
        </Card>
    );
    return href ? <Link href={href}>{body}</Link> : body;
}
