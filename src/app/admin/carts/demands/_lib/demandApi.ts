import { http, type RsData } from '@/api/http';

export type DemandFilters = {
    minExactMembers: number;
    minMembers: number;
    days: number;
    size: number;
    cooldownDays: number;
};

export type DemandCandidate = {
    productId: number;
    productName: string | null;
    imageUrl: string | null;
    purchasable: boolean;
    openGroupPurchaseId: number | null;
    exactMemberCount: number;
    similarMemberCount: number;
    totalMemberCount: number;
    similarProducts: {
        productId: number;
        similarity: number;
        matchType: string;
        memberCount: number;
    }[];
};

export type OpenDemandRequest = {
    productId: number;
    title: string;
    deadlineAt?: string;
};

export type OpenDemandResult = {
    id: number;
    inviteCode: string;
};

// 로컬 BE dev 계약. 원격 dev에 병합된 뒤 Orval 생성 훅으로 교체한다.
export async function getDemandCandidates(filters: DemandFilters): Promise<DemandCandidate[]> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) params.set(key, String(value));
    const response = await http<RsData<DemandCandidate[]>>(`/api/admin/carts/demands?${params}`);
    return response.data;
}

export async function openDemandGroupPurchase({ productId, title, deadlineAt }: OpenDemandRequest): Promise<OpenDemandResult> {
    const response = await http<RsData<OpenDemandResult>>(`/api/admin/carts/demands/${productId}/group-purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ...(deadlineAt ? { deadlineAt } : {}) }),
    });
    return response.data;
}
