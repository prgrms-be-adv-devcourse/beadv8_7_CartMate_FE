'use client';

import Link from 'next/link';
import { useGetAdminDashboard } from '@/api/generated/admin-dashboard-controller/admin-dashboard-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

const won = (n?: number) => `₩ ${(n ?? 0).toLocaleString('ko-KR')}`;
const count = (n?: number) => `${(n ?? 0).toLocaleString('ko-KR')}`;

const ROLE_LABEL: Record<string, string> = { BUYER: '구매자', SELLER: '판매자', ADMIN: '관리자' };
const STATUS_LABEL: Record<string, { text: string; className: string }> = {
    ACTIVE: { text: '정상', className: 'text-on-surface-variant' },
    SUSPENDED: { text: '정지', className: 'text-error font-semibold' },
    WITHDRAWN: { text: '탈퇴', className: 'text-outline' },
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
                    <div className="font-caption text-caption text-outline uppercase tracking-wider mb-1">[ ADMIN / DASHBOARD ]</div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">대시보드</h1>
                </div>
                <div className="flex items-center gap-space-sm">
                    {data?.generatedAt && <span className="font-caption text-caption text-outline">기준 {formatDateTime(data.generatedAt)}</span>}
                    <button
                        className="h-9 px-space-md border border-outline-variant rounded font-label-sm text-label-sm flex items-center gap-space-xs hover:border-primary disabled:opacity-50"
                        type="button"
                        onClick={() => void query.refetch()}
                        disabled={query.isFetching}
                    >
                        <Icon name="refresh" className="text-[16px]" />
                        새로고침
                    </button>
                </div>
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-4 gap-space-md" aria-hidden>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="h-28 rounded bg-surface-container animate-pulse" />
                    ))}
                </div>
            ) : !data ? (
                <div className="p-space-xl bg-surface-container-lowest border border-outline-variant rounded flex flex-col items-center gap-space-md">
                    <p className="font-body-sm text-body-sm text-error">{errorMessage(query.error, '대시보드를 불러오지 못했습니다.')}</p>
                    <button className="h-9 px-space-md border border-outline-variant rounded font-label-sm" type="button" onClick={() => void query.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : (
                <>
                    {/* 회원 */}
                    <section className="flex flex-col gap-space-sm">
                        <h2 className="font-label-md text-label-md text-on-surface-variant">회원</h2>
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
                        <h2 className="font-label-md text-label-md text-on-surface-variant">오늘 결제</h2>
                        <div className="grid grid-cols-4 gap-space-md">
                            <StatCard icon="receipt_long" label="결제 건수" value={`${count(data.payments?.todayPaidCount)}건`} />
                            <StatCard icon="payments" label="결제 금액" value={won(data.payments?.todayPaidAmount)} highlight />
                            <StatCard icon="undo" label="환불 건수" value={`${count(data.payments?.todayRefundCount)}건`} />
                            <StatCard icon="money_off" label="환불 금액" value={won(data.payments?.todayRefundAmount)} />
                        </div>
                    </section>

                    {/* 최근 가입 */}
                    <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                        <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">최근 가입 회원</h2>
                            <Link className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-xs" href={ROUTES.adminMembers}>
                                회원 관리 <Icon name="arrow_forward" className="text-[14px]" />
                            </Link>
                        </div>
                        {(data.recentMembers ?? []).length === 0 ? (
                            <p className="py-space-lg text-center font-body-sm text-body-sm text-outline">가입한 회원이 없습니다.</p>
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
                                        const status = STATUS_LABEL[m.status ?? ''] ?? STATUS_LABEL.ACTIVE;
                                        return (
                                            <tr key={m.id} className="hover:bg-surface-container-low">
                                                <td className="py-2 px-2">
                                                    <Link className="font-label-md text-on-surface hover:underline" href={ROUTES.adminMember(m.id ?? 0)}>
                                                        {m.nickname}
                                                    </Link>
                                                </td>
                                                <td className="py-2 px-2 text-on-surface-variant">{m.email}</td>
                                                <td className="py-2 px-2">{ROLE_LABEL[m.role ?? ''] ?? m.role}</td>
                                                <td className={`py-2 px-2 ${status.className}`}>{status.text}</td>
                                                <td className="py-2 px-2 text-right text-outline">{formatDateTime(m.joinedAt)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </section>
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
        <div
            className={`h-full p-space-lg rounded border bg-surface-container-lowest flex flex-col justify-between gap-space-sm ${
                highlight ? 'border-primary' : 'border-outline-variant'
            } ${href ? 'hover:border-primary transition-colors' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline">{label}</span>
                <Icon name={icon} className="text-outline text-[18px]" />
            </div>
            <div className={`font-headline-md text-headline-md font-bold ${warn ? 'text-error' : 'text-on-surface'}`}>{value}</div>
        </div>
    );
    return href ? <Link href={href}>{body}</Link> : body;
}