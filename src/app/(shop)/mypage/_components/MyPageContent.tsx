'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, type BadgeVariant } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import {
    fetchActiveGroupPurchases,
    fetchRecentOrders,
    fetchWalletSummary,
    type ActiveGroupPurchase,
    type RecentOrder,
    type WalletSummary,
} from '../mypage.api';

type Member = {
    id: number;
    email: string;
    nickname: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
};

const won = (value: number) => `₩ ${value.toLocaleString('ko-KR')}`;

const GROUP_STATUS_LABEL: Record<ActiveGroupPurchase['status'], { text: string; variant: BadgeVariant }> = {
    EDITING: { text: '참여자 모집 중', variant: 'neutral' },
    PAYING: { text: '결제 진행 중', variant: 'warning' },
    CONFIRMED: { text: '주문 확정', variant: 'success' },
    SHIPPING: { text: '배송 중', variant: 'blue' },
};

const ORDER_STATUS_LABEL: Record<RecentOrder['status'], { text: string; variant: BadgeVariant }> = {
    PAYMENT_PENDING: { text: '결제대기', variant: 'warning' },
    PAID: { text: '결제완료', variant: 'success' },
    PREPARING: { text: '배송준비', variant: 'neutral' },
    SHIPPING: { text: '배송중', variant: 'blue' },
    DELIVERED: { text: '배송완료', variant: 'success' },
    PURCHASE_CONFIRMED: { text: '구매확정', variant: 'success' },
    CANCELED: { text: '취소', variant: 'error' },
};

export default function MyPageContent() {
    const router = useRouter();
    const [member, setMember] = useState<Member | null>(null);
    const [wallet, setWallet] = useState<WalletSummary | null>(null);
    const [groups, setGroups] = useState<ActiveGroupPurchase[]>([]);
    const [orders, setOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await apiFetch<Member>('/api/members/me');
                if (cancelled) return;
                setMember(res.data);
            } catch (e) {
                // 비로그인이면 로그인 페이지로
                if (e instanceof ApiError && e.resultCode.startsWith('401')) {
                    router.replace(ROUTES.login);
                    return;
                }
                alert('회원 정보를 불러오지 못했습니다.');
                return;
            }

            try {
                const [walletData, groupData, orderData] = await Promise.all([
                    fetchWalletSummary(),
                    fetchActiveGroupPurchases(),
                    fetchRecentOrders(),
                ]);
                if (cancelled) return;
                setWallet(walletData);
                setGroups(groupData);
                setOrders(orderData);
            } catch {
                // 활동 정보를 못 불러와도 화면은 띄운다 (빈 상태로 표시)
                if (!cancelled) setWallet({ balance: 0, heldBalance: 0 });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading || !member) {
        return (
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                <div className="h-8 w-64 rounded bg-surface-container animate-pulse mb-space-xl" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-36 rounded bg-surface-container animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const available = wallet ? wallet.balance - wallet.heldBalance : 0;
    const shippingCount = orders.filter((o) => o.status === 'SHIPPING').length;
    const pendingPayCount =
        orders.filter((o) => o.status === 'PAYMENT_PENDING').length +
        groups.filter((g) => g.status === 'PAYING' && g.actionText === '결제하기').length;

    const metricCards = [
        {
            label: '예치금 사용 가능 잔액',
            icon: 'account_balance_wallet',
            value: won(available),
            valueClassName: 'text-primary',
            suffix: null,
            note: `결제 대기 ${pendingPayCount}건`,
            action: '충전/환불 >',
            href: ROUTES.deposit,
        },
        {
            label: '진행 중인 공동구매',
            icon: 'groups',
            value: `${groups.length}건`,
            valueClassName: 'text-on-surface',
            suffix: null,
            note: `결제 진행 중 ${groups.filter((g) => g.status === 'PAYING').length}건`,
            action: '현황 보기 >',
            href: ROUTES.groupPurchases,
        },
        {
            label: '배송 진행',
            icon: 'local_shipping',
            value: `${shippingCount}건`,
            valueClassName: 'text-on-surface',
            suffix: shippingCount > 0 ? '배송중' : null,
            note: '최근 주문 기준',
            action: '조회 >',
            href: ROUTES.orders,
        },
    ];

    return (
        <div className="flex w-full flex-col">
            <div className="mx-auto w-full max-w-[1200px] px-gutter py-8 sm:py-12">
                {/* 인사말 */}
                <div className="mb-8 flex flex-col justify-between gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-end">
                    <div className="flex flex-col gap-2">
                        <Text type="supporting" color="accent">MY ACCOUNT</Text>
                        <Heading level={1}>{member.nickname} 회원님, 반갑습니다.</Heading>
                        <Text color="secondary">{member.email}</Text>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {member.role === 'SELLER' && (
                            <Button label="판매자 센터" variant="secondary" href={ROUTES.seller} as={Link} icon={<Icon name="storefront" className="text-[18px]" />} />
                        )}
                        <Button label="공동구매 개설" variant="primary" href={ROUTES.groupPurchaseNew} as={Link} icon={<Icon name="add" className="text-[18px]" />} />
                        <Button label="회원정보 수정" variant="secondary" href={ROUTES.profile} as={Link} icon={<Icon name="settings" className="text-[18px]" />} />
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <MyPageSidebar />

                    <div className="flex min-w-0 flex-col gap-6 lg:col-span-9">
                        {/* 요약 카드 */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {metricCards.map((card) => (
                                <Card key={card.label} padding={4} className="flex flex-col justify-between">
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <Text type="supporting" color="secondary">{card.label}</Text>
                                            <Icon name={card.icon} className="text-outline text-[18px]" />
                                        </div>
                                        <div className={`font-headline-lg text-headline-lg font-bold ${card.valueClassName}`}>
                                            {card.value}
                                            {card.suffix && <span className="font-body-sm text-outline font-normal"> {card.suffix}</span>}
                                        </div>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
                                        <Text type="supporting" color="secondary">{card.note}</Text>
                                        <Link className="font-label-sm text-label-sm text-primary hover:underline" href={card.href}>
                                            {card.action}
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* 참여 중인 공동구매 */}
                        <Card padding={4}>
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-4">
                                <div>
                                    <Heading level={2}>참여 중인 공동구매</Heading>
                                    <Text color="secondary">참여 현황과 마감 일정을 확인하세요.</Text>
                                </div>
                                <Button label="전체 보기" variant="ghost" size="sm" href={ROUTES.groupPurchases} as={Link} endContent={<Icon name="arrow_forward" className="text-[14px]" />} />
                            </div>

                            {groups.length === 0 ? (
                                <EmptyState title="참여 중인 공동구매가 없습니다" description="새 공동구매를 둘러보거나 직접 개설해 보세요." />
                            ) : (
                                <div className="flex flex-col gap-space-md">
                                    {groups.map((group) => {
                                        const status = GROUP_STATUS_LABEL[group.status];
                                        const isShared = group.purchaseType === 'SHARED';
                                        return (
                                            <Card
                                                key={group.id}
                                                variant="muted"
                                                padding={3}
                                                className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-center gap-space-md">
                                                    <div className="w-16 h-16 bg-surface-container border border-outline-variant rounded flex items-center justify-center shrink-0">
                                                        <Icon name={group.icon} className="text-outline text-[24px]" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-space-xs mb-1">
                                                            <Badge label={isShared ? '공동 물품' : '인당 주문'} variant={isShared ? 'blue' : 'purple'} />
                                                            <span className="font-caption text-caption text-outline">{group.category}</span>
                                                            <span className="font-caption text-caption text-outline">[{group.id}]</span>
                                                        </div>
                                                        <div className="font-label-md text-label-md text-on-surface font-bold">{group.title}</div>
                                                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                                            {group.summary}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <Badge label={status.text} variant={status.variant} />
                                                    <div className="font-caption text-caption text-outline mt-1">{group.deadline}</div>
                                                    <Link
                                                        className="mt-2 h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm rounded hover:border-primary transition-colors inline-flex items-center"
                                                        href={group.href}
                                                    >
                                                        {group.actionText}
                                                    </Link>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* 최근 주문 */}
                        <Card padding={4}>
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant pb-4">
                                <div>
                                    <Heading level={2}>최근 주문</Heading>
                                    <Text color="secondary">최근 3개월간 주문 및 배송 내역입니다.</Text>
                                </div>
                                <Button label="전체 내역" variant="ghost" size="sm" href={ROUTES.orders} as={Link} endContent={<Icon name="arrow_forward" className="text-[14px]" />} />
                            </div>

                            {orders.length === 0 ? (
                                <EmptyState title="최근 주문이 없습니다" description="상품을 둘러보고 첫 주문을 시작해 보세요." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-outline-variant font-label-sm text-label-sm text-outline">
                                                <th className="py-3 px-2 font-medium">주문일자 / 번호</th>
                                                <th className="py-3 px-2 font-medium">상품명 / 옵션</th>
                                                <th className="py-3 px-2 font-medium">수량</th>
                                                <th className="py-3 px-2 font-medium">결제금액</th>
                                                <th className="py-3 px-2 font-medium text-right">주문상태</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                                            {orders.map((order) => {
                                                const status = ORDER_STATUS_LABEL[order.status];
                                                return (
                                                    <tr key={order.id}>
                                                        <td className="py-3 px-2 text-outline">
                                                            <div>{order.date}</div>
                                                            <div className="font-caption">{order.id}</div>
                                                        </td>
                                                        <td className="py-3 px-2">
                                                            <div className="font-label-md text-on-surface font-bold">{order.name}</div>
                                                            {order.option && <div className="text-outline text-caption">{order.option}</div>}
                                                        </td>
                                                        <td className="py-3 px-2">{order.quantity}</td>
                                                        <td className="py-3 px-2 font-bold">{won(order.amount)}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <Badge label={status.text} variant={status.variant} />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
