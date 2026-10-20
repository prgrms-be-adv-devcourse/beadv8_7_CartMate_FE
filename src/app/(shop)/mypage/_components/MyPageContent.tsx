'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const GROUP_STATUS_LABEL: Record<ActiveGroupPurchase['status'], { text: string; className: string }> = {
    EDITING: { text: '참여자 모집 중', className: 'text-on-surface' },
    PAYING: { text: '결제 진행 중', className: 'text-primary' },
    CONFIRMED: { text: '주문 확정', className: 'text-primary' },
    SHIPPING: { text: '배송 중', className: 'text-primary' },
};

const ORDER_STATUS_LABEL: Record<RecentOrder['status'], { text: string; className: string }> = {
    PAID: { text: '결제완료', className: 'border border-outline-variant text-on-surface-variant' },
    SHIPPING: { text: '배송중', className: 'bg-primary text-on-primary' },
    DELIVERED: { text: '배송완료', className: 'bg-primary text-on-primary' },
    PURCHASE_CONFIRMED: { text: '구매확정', className: 'border border-outline-variant text-on-surface-variant' },
};

const OUTLINE_BUTTON =
    'h-10 px-space-md bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md rounded flex items-center gap-space-xs hover:border-primary transition-colors';

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

            const [walletData, groupData, orderData] = await Promise.all([
                fetchWalletSummary(),
                fetchActiveGroupPurchases(),
                fetchRecentOrders(),
            ]);
            if (cancelled) return;
            setWallet(walletData);
            setGroups(groupData);
            setOrders(orderData);
            setLoading(false);
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading || !member) {
        return (
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                <div className="h-8 w-64 rounded bg-surface-container animate-pulse mb-space-xl" />
                <div className="grid grid-cols-3 gap-space-md">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-36 rounded bg-surface-container animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const available = wallet ? wallet.balance - wallet.heldBalance : 0;
    const shippingCount = orders.filter((o) => o.status === 'SHIPPING').length;

    const metricCards = [
        {
            label: '예치금 사용 가능 잔액',
            icon: 'account_balance_wallet',
            value: won(available),
            valueClassName: 'text-primary',
            suffix: null,
            note: `공동구매 동결 중 ${won(wallet?.heldBalance ?? 0)}`,
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
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* 인사말 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl pb-space-lg border-b border-outline-variant">
                    <div>
                        <div className="font-caption text-caption text-outline uppercase tracking-wider mb-space-xs">[MY ACCOUNT DASHBOARD]</div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">{member.nickname} 회원님, 반갑습니다.</h1>
                        <p className="font-body-sm text-body-sm text-outline mt-1">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-space-md">
                        {member.role === 'SELLER' && (
                            <Link className={OUTLINE_BUTTON} href={ROUTES.seller}>
                                <Icon name="storefront" className="text-[18px]" />
                                판매자 센터
                            </Link>
                        )}
                        <Link
                            className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-space-xs hover:bg-on-surface transition-colors"
                            href={ROUTES.groupPurchaseNew}
                        >
                            <Icon name="add" className="text-[18px]" />
                            공동구매 개설하기
                        </Link>
                        <Link className={OUTLINE_BUTTON} href={ROUTES.profile}>
                            <Icon name="settings" className="text-[18px]" />
                            회원정보 수정
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    <MyPageSidebar />

                    <div className="col-span-9 flex flex-col gap-space-xl">
                        {/* 요약 카드 */}
                        <div className="grid grid-cols-3 gap-space-md">
                            {metricCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-space-xs">
                                            <span className="font-label-sm text-label-sm text-outline uppercase">{card.label}</span>
                                            <Icon name={card.icon} className="text-outline text-[18px]" />
                                        </div>
                                        <div className={`font-headline-lg text-headline-lg font-bold mt-1 ${card.valueClassName}`}>
                                            {card.value}
                                            {card.suffix && <span className="font-body-sm text-outline font-normal"> {card.suffix}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-space-lg pt-space-sm border-t border-surface-container">
                                        <span className="font-caption text-caption text-outline">{card.note}</span>
                                        <Link className="font-label-sm text-label-sm text-primary hover:underline" href={card.href}>
                                            {card.action}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 참여 중인 공동구매 */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                            <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">현재 참여 중인 공동구매 요약</h2>
                                    <p className="font-body-sm text-body-sm text-outline">참여 현황과 마감 일정을 확인하세요.</p>
                                </div>
                                <Link
                                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-xs"
                                    href={ROUTES.groupPurchases}
                                >
                                    전체 보기 <Icon name="arrow_forward" className="text-[14px]" />
                                </Link>
                            </div>

                            {groups.length === 0 ? (
                                <p className="py-space-lg text-center font-body-sm text-body-sm text-outline">참여 중인 공동구매가 없습니다.</p>
                            ) : (
                                <div className="flex flex-col gap-space-md">
                                    {groups.map((group) => {
                                        const status = GROUP_STATUS_LABEL[group.status];
                                        const isShared = group.purchaseType === 'SHARED';
                                        return (
                                            <div
                                                key={group.id}
                                                className="p-space-md bg-surface-container-low border border-outline-variant rounded flex items-center justify-between gap-space-md"
                                            >
                                                <div className="flex items-center gap-space-md">
                                                    <div className="w-16 h-16 bg-surface-container border border-outline-variant rounded flex items-center justify-center shrink-0">
                                                        <Icon name={group.icon} className="text-outline text-[24px]" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-space-xs mb-1">
                                                            <span
                                                                className={`px-1.5 py-0.5 font-caption text-caption rounded ${
                                                                    isShared ? 'border border-primary text-primary' : 'bg-primary text-on-primary'
                                                                }`}
                                                            >
                                                                {isShared ? '공동 물품' : '인당 주문'}
                                                            </span>
                                                            <span className="font-caption text-caption text-outline">{group.category}</span>
                                                            <span className="font-caption text-caption text-outline">[{group.id}]</span>
                                                        </div>
                                                        <div className="font-label-md text-label-md text-on-surface font-bold">{group.title}</div>
                                                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                                            내 분담금 {won(group.myAmount)} · 참여 {group.joinedCount}/{group.targetCount}명
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className={`font-label-sm text-label-sm font-bold ${status.className}`}>{status.text}</div>
                                                    <div className="font-caption text-caption text-outline mt-1">{group.deadline}</div>
                                                    <Link
                                                        className="mt-2 h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm rounded hover:border-primary transition-colors inline-flex items-center"
                                                        href={ROUTES.order(group.id)}
                                                    >
                                                        상세 보기
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 최근 주문 */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                            <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">최근 주문 요약 목록</h2>
                                    <p className="font-body-sm text-body-sm text-outline">최근 3개월간 주문 및 배송 내역입니다.</p>
                                </div>
                                <Link
                                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-xs"
                                    href={ROUTES.orders}
                                >
                                    전체 내역 <Icon name="arrow_forward" className="text-[14px]" />
                                </Link>
                            </div>

                            {orders.length === 0 ? (
                                <p className="py-space-lg text-center font-body-sm text-body-sm text-outline">최근 주문이 없습니다.</p>
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
                                                            {order.option && <div className="text-outline text-caption">옵션: {order.option}</div>}
                                                        </td>
                                                        <td className="py-3 px-2">{order.quantity}</td>
                                                        <td className="py-3 px-2 font-bold">{won(order.amount)}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <span className={`inline-block px-2 py-0.5 font-caption rounded ${status.className}`}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}