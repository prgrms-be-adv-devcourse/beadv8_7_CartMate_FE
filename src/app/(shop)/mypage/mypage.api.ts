// =====================================================================
// 마이페이지 데이터 (GET /api/members/me/dashboard)
// 백엔드가 wallet, cart, order, delivery 모듈에서 회원별 정보를 모아서 준다.
// =====================================================================

import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export type WalletSummary = {
    balance: number;
    heldBalance: number;
};

export type ActiveGroupPurchase = {
    id: string;
    purchaseType: 'PER_PERSON' | 'SHARED';
    icon: string;
    category: string;
    title: string;
    summary: string; // 카드 두 번째 줄 (분담금, 참여·결제 인원)
    status: 'EDITING' | 'PAYING' | 'CONFIRMED' | 'SHIPPING';
    deadline: string;
    href: string;
    actionText: string;
};

export type RecentOrder = {
    id: string;
    date: string;
    name: string;
    option: string;
    quantity: string;
    amount: number;
    status: 'PAYMENT_PENDING' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'PURCHASE_CONFIRMED' | 'CANCELED';
};

// 백엔드 응답 (MyPageDashboardResponse)
type DashboardResponse = {
    wallet: { balance: number; heldBalance: number };
    groupPurchases: {
        id: number;
        purchaseType: 'SHARED' | 'PER_PERSON';
        stage: 'RECRUITING' | 'PAYING';
        title: string;
        itemCount: number;
        myAmount: number;
        joinedCount: number;
        targetCount: number;
        myPaymentStatus: 'UNPAID' | 'PAID' | null;
        deadlineAt: string | null;
        sharedGroupOrderId: number | null;
    }[];
    recentOrders: {
        id: number;
        orderNumber: string;
        orderType: 'PERSONAL' | 'INDIVIDUAL_GROUP';
        orderedAt: string | null;
        title: string;
        itemCount: number;
        totalAmount: number;
        orderStatus: 'PAYMENT_PENDING' | 'PAID' | 'CANCELED';
        deliveryStatus: 'REQUESTED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CONFIRMED' | 'CANCELED' | null;
    }[];
    shippingCount: number;
};

// 세 함수가 동시에 불려도 요청은 한 번만 보내도록 공유
let pending: Promise<DashboardResponse> | null = null;

function getDashboard(): Promise<DashboardResponse> {
    if (!pending) {
        pending = apiFetch<DashboardResponse>('/api/members/me/dashboard')
            .then((res) => res.data as DashboardResponse)
            .finally(() => {
                setTimeout(() => {
                    pending = null;
                }, 0);
            });
    }
    return pending;
}

const won = (n: number) => `₩ ${n.toLocaleString('ko-KR')}`;

function daysLeft(iso: string | null) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function deadlineText(iso: string | null, label: string) {
    const left = daysLeft(iso);
    if (left === null) return '';
    if (left <= 0) return `${label} 마감 임박`;
    return `${label} 마감 D-${left}`;
}

function formatDate(iso: string | null) {
    if (!iso) return '-';
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}.${mm}.${dd}`;
}

export async function fetchWalletSummary(): Promise<WalletSummary> {
    const { wallet } = await getDashboard();
    return wallet;
}

export async function fetchActiveGroupPurchases(): Promise<ActiveGroupPurchase[]> {
    const { groupPurchases } = await getDashboard();

    return groupPurchases.map((g) => {
        const isShared = g.purchaseType === 'SHARED';

        // 공동물품 분담금 결제 중
        if (g.stage === 'PAYING') {
            const iPaid = g.myPaymentStatus === 'PAID';
            return {
                id: `GB-${g.id}`,
                purchaseType: g.purchaseType,
                icon: 'sports_soccer',
                category: '분담금 결제',
                title: g.title,
                summary: `내 분담금 ${won(g.myAmount)} · 결제 ${g.joinedCount}/${g.targetCount}명${iPaid ? ' · 결제 완료' : ''}`,
                status: 'PAYING',
                deadline: deadlineText(g.deadlineAt, '결제'),
                href: ROUTES.checkoutShared(g.sharedGroupOrderId!),
                actionText: iPaid ? '결제 현황' : '결제하기',
            };
        }

        // 모집 중
        return {
            id: `GB-${g.id}`,
            purchaseType: g.purchaseType,
            icon: isShared ? 'sports_soccer' : 'checkroom',
            category: isShared ? '참여자 모집' : `상품 ${g.itemCount}종`,
            title: g.title,
            summary: isShared ? `참여 ${g.joinedCount}/${g.targetCount}명` : '각자 사이즈를 골라 주문',
            status: 'EDITING',
            deadline: deadlineText(g.deadlineAt, isShared ? '모집' : '주문'),
            href: isShared ? ROUTES.groupPurchase(g.id) : ROUTES.groupPurchaseIndividual(g.id),
            actionText: '상세 보기',
        };
    });
}

export async function fetchRecentOrders(): Promise<RecentOrder[]> {
    const { recentOrders } = await getDashboard();

    return recentOrders.map((o) => {
        // 주문 상태가 우선, 결제 이후에는 배송 상태로 보여준다
        let status: RecentOrder['status'];
        if (o.orderStatus === 'PAYMENT_PENDING') status = 'PAYMENT_PENDING';
        else if (o.orderStatus === 'CANCELED') status = 'CANCELED';
        else if (o.deliveryStatus === 'CONFIRMED') status = 'PURCHASE_CONFIRMED';
        else if (o.deliveryStatus === 'DELIVERED') status = 'DELIVERED';
        else if (o.deliveryStatus === 'SHIPPING') status = 'SHIPPING';
        else if (o.deliveryStatus === 'PREPARING') status = 'PREPARING';
        else status = 'PAID';

        return {
            id: o.orderNumber,
            date: formatDate(o.orderedAt),
            name: o.itemCount > 1 ? `${o.title} 외 ${o.itemCount - 1}건` : o.title,
            option: o.orderType === 'INDIVIDUAL_GROUP' ? '공동구매 주문' : '',
            quantity: `${o.itemCount}종`,
            amount: o.totalAmount,
            status,
        };
    });
}