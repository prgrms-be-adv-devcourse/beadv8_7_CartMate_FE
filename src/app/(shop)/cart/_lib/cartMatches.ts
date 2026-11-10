import { http, type RsData } from '@/api/http';

export type CartMatch = {
    individualGroupPurchaseId: number;
    title: string;
    inviteCode: string;
    deadlineAt: string;
    productId: number;
    productName: string | null;
    imageUrl: string | null;
    similarity: number;
    matchType: 'EXACT' | 'VECTOR';
    matchedCartProductIds: number[];
};

// 로컬 BE dev 계약. 원격 dev 병합 후 Orval 생성 훅으로 교체한다.
export async function getCartMatches(): Promise<CartMatch[]> {
    const response = await http<RsData<CartMatch[]>>('/api/carts/matches');
    return response.data;
}
