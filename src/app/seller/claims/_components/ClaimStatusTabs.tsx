'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@astryxdesign/core';
import { GetSellerClaimsStatusItem } from '@/api/generated/model';

export type ClaimTab = 'all' | 'pending' | 'progress' | 'done';

// BE 에 상태별 건수를 한 번에 주는 API 가 없어 탭에는 개수를 보여 주지 않는다.
const TABS: { key: ClaimTab; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'pending', label: '처리대기' },
    { key: 'progress', label: '처리중' },
    { key: 'done', label: '처리완료' },
];

// 탭별로 조회할 클레임 상태. 처리대기는 접수(REQUESTED), 처리중은 승인(APPROVED · 일부 승인 포함)이다.
// 처리완료는 판매자가 더 할 일이 없는 건이다: 회수 · 교환을 마친 COMPLETED 와 상품을 전부 거절한 REJECTED.
// 전체는 상태를 지정하지 않는다. (확인 중 · 접수 불가는 BE 가 판매자에게 보여 주지 않는다)
export const CLAIM_TAB_STATUSES: Record<ClaimTab, GetSellerClaimsStatusItem[] | undefined> = {
    all: undefined,
    pending: [GetSellerClaimsStatusItem.REQUESTED],
    progress: [GetSellerClaimsStatusItem.APPROVED],
    done: [GetSellerClaimsStatusItem.COMPLETED, GetSellerClaimsStatusItem.REJECTED],
};

// URL 의 tab 을 읽는다. 없거나 알 수 없는 값이면 전체다.
export function readClaimTab(raw: string | null): ClaimTab {
    return TABS.find((tab) => tab.key === raw)?.key ?? 'all';
}

// 탭은 선택한 값을 URL 쿼리스트링(?tab=)에 남기고, 목록(ClaimList)이 같은 값을 읽는다.
export default function ClaimStatusTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const active = readClaimTab(searchParams.get('tab'));

    function select(tab: ClaimTab) {
        // 탭을 바꾸면 첫 페이지부터 보여 준다.
        const params = new URLSearchParams(searchParams.toString());
        if (tab === 'all') params.delete('tab');
        else params.set('tab', tab);
        params.delete('page');
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }

    return (
        <div className="flex bg-surface-container rounded-lg p-space-xs border border-outline-variant">
            {TABS.map((tab) => (
                <Button key={tab.key} label={tab.label} size="sm" variant={tab.key === active ? 'primary' : 'ghost'} onClick={() => select(tab.key)} />
            ))}
        </div>
    );
}
