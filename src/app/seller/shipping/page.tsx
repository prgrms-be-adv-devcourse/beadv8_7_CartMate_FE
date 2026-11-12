import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, Heading, Text } from '@astryxdesign/core';
import ShippingList from './_components/ShippingList';
import ShippingStatusTabs from './_components/ShippingStatusTabs';

export const metadata: Metadata = { title: '배송 관리 | TEAMBUY' };

export default function SellerShippingPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Section / Title & Overview */}
            <div className="mb-space-xl">
                <div>
                    <Heading level={1}>배송 관리</Heading>
                    <Text color="secondary" className="mt-space-xs">주문된 상품의 배송 상태를 확인하고 운송장 번호를 등록·관리합니다.</Text>
                </div>
            </div>
            {/* API가 지원하는 배송 상태 필터만 노출한다. */}
            <Card className="mb-space-xl" padding={4}>
                <Suspense>
                    <ShippingStatusTabs />
                </Suspense>
            </Card>
            {/* 상태(status)와 페이지(page)를 URL 쿼리스트링에서 읽어 BE 의 판매자 배송 목록을 조회한다 */}
            <Suspense>
                <ShippingList />
            </Suspense>
        </div>
    );
}
