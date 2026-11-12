'use client';

import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { useSelectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SalesPostCard, { SalesPostCardSkeleton } from './SalesPostCard';
import { toSalesPostCardWithTrust } from './SellerTrust';

const HOME_PAGE_SIZE = 8;

// BE 목록은 최신 등록순만 지원한다. 나머지 정렬은 자리만 남겨 두고 비활성. (로드맵 SHOP-3)
// 홈 "최신 판매 상품" 목록.
export default function HomeSalesPosts() {
    const query = useSelectSalesPostAll({ page: 0, size: HOME_PAGE_SIZE });
    const page = query.data?.data;
    const cards = (page?.content ?? []).map(toSalesPostCardWithTrust).filter((item) => item !== null);

    return (
        <section className="flex flex-col gap-7" aria-labelledby="latest-products">
            <div className="flex flex-col gap-3 border-b border-outline-variant pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <Text type="supporting" color="accent">CATALOG</Text>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <Heading id="latest-products" level={2}>새로 등록된 상품</Heading>
                        {page && <Text type="supporting" color="secondary">전체 {page.totalElements ?? 0}개</Text>}
                    </div>
                </div>
                <Button label="전체 상품 보기" href={ROUTES.search} as={Link} variant="ghost" size="sm" endContent={<Icon name="arrow_forward" />} />
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    {Array.from({ length: HOME_PAGE_SIZE }, (_, i) => (
                        <SalesPostCardSkeleton key={i} />
                    ))}
                </div>
            ) : query.isError ? (
                <div className="rounded-lg border border-outline-variant bg-surface-container-low p-8 text-center" role="alert">
                    <Text>{errorMessage(query.error, '상품 목록을 불러오지 못했습니다.')}</Text>
                    <div className="mt-4"><Button label="다시 시도" onClick={() => query.refetch()} /></div>
                </div>
            ) : cards.length === 0 ? (
                <EmptyState title="아직 등록된 판매 상품이 없습니다" description="새 상품이 등록되면 이곳에서 바로 확인할 수 있어요." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    {cards.map(({ card, trust }) => (
                        <SalesPostCard key={card.id} post={card} trust={trust} />
                    ))}
                </div>
            )}
        </section>
    );
}
