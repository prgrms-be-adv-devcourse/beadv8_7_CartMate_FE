// =====================================================================
// 마이페이지 데이터 (실제 API: GET /api/members/me/dashboard)
// mypage.mock.ts 와 같은 함수 이름·타입을 유지해서 화면 코드는 import 경로만 바꾸면 된다.
// =====================================================================

import { apiFetch } from '@/lib/api';

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
    myAmount: number;
    joinedCount: number;
    targetCount: number;
    status: 'EDITING' | 'PAYING' | 'CONFIRMED' | 'SHIPPING';
    deadline: string;
};

export type RecentOrder = {
    id: string;
    date: string;
    name: string;
    option: string;
    quantity: string;
    amount: number;
    status: 'PAID' | 'SHIPPING' | 'DELIVERED' | 'PURCHASE_CONFIRMED';
};

// 백엔드 응답 모양 (MyPageDashboardResponse)
type DashboardResponse = {
    wallet: { balance: number; heldBalance: number };
    groupPurchases: {
        id: number;
        purchaseType: 'PER_PERSON' | 'SHARED';
        title: string | null;
        itemCount: number;
        myAmount: number;
        joinedCount: number;
        targetCount: number;
        editDeadlineAt: string | null;
    }[];
    recentOrders: {
        id: number;
        orderNumber: string;
        orderedAt: string | null;
        title: string | null;
        itemCount: number;
        totalQuantity: number;
        totalAmount: number;
        orderStatus: string | null;
        deliveryStatus: string | null;
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

function daysLeft(iso: string | null) {
    if (!iso) return null;
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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
        const left = daysLeft(g.editDeadlineAt);
        const isOpen = left !== null && left > 0;
        const isShared = g.purchaseType === 'SHARED';
        const baseTitle = g.title ?? '상품 정보 없음';

        return {
            id: `GB-${g.id}`,
            purchaseType: g.purchaseType,
            icon: isShared ? 'sports_soccer' : 'checkroom',
            category: `상품 ${g.itemCount}종`,
            title: g.itemCount > 1 ? `${baseTitle} 외 ${g.itemCount - 1}건` : baseTitle,
            myAmount: g.myAmount,
            joinedCount: g.joinedCount,
            targetCount: g.targetCount,
            status: isOpen ? 'EDITING' : 'PAYING',
            deadline: isOpen ? `${isShared ? '모집' : '수정'} 마감 D-${left}` : '마감 완료',
        };
    });
}

export async function fetchRecentOrders(): Promise<RecentOrder[]> {
    const { recentOrders } = await getDashboard();

    return recentOrders.map((o) => {
        let status: RecentOrder['status'] = 'PAID';
        if (o.orderStatus === 'PURCHASE_CONFIRMED') status = 'PURCHASE_CONFIRMED';
        else if (o.deliveryStatus === 'SHIPPING') status = 'SHIPPING';
        else if (o.deliveryStatus === 'DELIVERED') status = 'DELIVERED';

        const baseName = o.title ?? '상품 정보 없음';
        return {
            id: o.orderNumber,
            date: formatDate(o.orderedAt),
            name: o.itemCount > 1 ? `${baseName} 외 ${o.itemCount - 1}건` : baseName,
            option: '',
            quantity: `${o.totalQuantity}개`,
            amount: o.totalAmount,
            status,
        };
    });
}