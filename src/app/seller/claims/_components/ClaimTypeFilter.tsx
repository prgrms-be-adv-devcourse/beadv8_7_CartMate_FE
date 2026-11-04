'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { GetSellerClaimsClaimType } from '@/api/generated/model';

type ClaimTypeKey = 'exchange' | 'refund';

const TYPE_BY_KEY: Record<ClaimTypeKey, GetSellerClaimsClaimType> = {
    exchange: GetSellerClaimsClaimType.EXCHANGE,
    refund: GetSellerClaimsClaimType.REFUND,
};

// URL 의 type 을 BE 의 claimType 으로 바꾼다. 없거나 알 수 없는 값이면 교환·환불 모두 조회한다.
export function readClaimType(raw: string | null): GetSellerClaimsClaimType | undefined {
    return raw === 'exchange' || raw === 'refund' ? TYPE_BY_KEY[raw] : undefined;
}

// 유형 필터는 선택한 값을 URL 쿼리스트링(?type=)에 남기고, 목록(ClaimList)이 같은 값을 읽는다.
// 탭(?tab=)과 함께 적용되며, 유형을 바꾸면 첫 페이지부터 보여 준다.
export default function ClaimTypeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const raw = searchParams.get('type');
    const value = raw === 'exchange' || raw === 'refund' ? raw : '';

    function change(next: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (next) params.set('type', next);
        else params.delete('type');
        params.delete('page');
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }

    return (
        <div className="flex items-center gap-space-sm">
            <span className="text-caption text-on-surface-variant font-label-sm">유형</span>
            <select
                className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded px-space-md py-space-xs outline-none focus:border-primary"
                value={value}
                onChange={(e) => change(e.target.value)}
            >
                <option value="">전체 유형</option>
                <option value="exchange">교환</option>
                <option value="refund">환불</option>
            </select>
        </div>
    );
}
