import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, Heading, Text } from '@astryxdesign/core';
import ClaimList from './_components/ClaimList';
import ClaimStatusTabs from './_components/ClaimStatusTabs';
import ClaimTypeFilter from './_components/ClaimTypeFilter';

export const metadata: Metadata = { title: '교환·환불 관리 | TEAMBUY' };

export default function SellerClaimsPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto pb-space-xl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-space-xl">
                <div>
                    <Heading level={1}>교환·환불 관리</Heading>
                    <Text display="block" color="secondary" className="mt-space-xs">고객이 신청한 교환 및 환불 요청을 확인하고 처리 상태를 관리합니다.</Text>
                </div>
                <div className="flex items-center gap-space-md">
                    {/* 선택한 탭을 URL 쿼리스트링에서 읽는 부분은 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense>
                        <ClaimStatusTabs />
                    </Suspense>
                </div>
            </div>
            {/* API가 지원하는 클레임 유형 필터만 노출한다. */}
            <Card className="mb-space-lg" padding={4}>
                <Suspense>
                    <ClaimTypeFilter />
                </Suspense>
            </Card>
            {/* 탭(tab)과 페이지(page)를 URL 쿼리스트링에서 읽어 BE 의 판매자 교환·환불 목록을 조회한다 */}
            <Suspense>
                <ClaimList />
            </Suspense>
        </div>
    );
}
