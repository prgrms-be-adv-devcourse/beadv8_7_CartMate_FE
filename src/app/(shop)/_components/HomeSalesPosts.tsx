'use client';

import Link from 'next/link';
import { useSelectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { toSalesPostCard } from '@/lib/salesPost';
import SalesPostCard, { SalesPostCardSkeleton } from './SalesPostCard';

const HOME_PAGE_SIZE = 8;

// BE 목록은 최신 등록순만 지원한다. 나머지 정렬은 자리만 남겨 두고 비활성. (로드맵 SHOP-3)
const SORT_TABS = [
    { label: '최신순', available: true },
    { label: '인기 마감순', available: false },
    { label: '할인율 높은순', available: false },
    { label: '최저가순', available: false },
];

// 홈 "최신 판매 상품" 목록.
export default function HomeSalesPosts() {
    const query = useSelectSalesPostAll({ page: 0, size: HOME_PAGE_SIZE });
    const page = query.data?.data;
    const cards = (page?.content ?? []).map(toSalesPostCard).filter((card) => card !== null);

    return (
        <section className="flex flex-col gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-outline-variant pb-space-sm">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-space-xs">
                        <span className="font-caption text-caption uppercase text-outline tracking-wider bg-surface-container px-space-xs py-0.5 border border-outline-variant">
                            CATALOG
                        </span>
                        {page && <span className="font-caption text-caption text-outline">전체 {page.totalElements ?? 0}개 판매 중</span>}
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">최신 판매 상품</h2>
                </div>
                <div className="flex items-center gap-space-md">
                    <div className="flex items-center gap-1 border border-outline-variant bg-surface-container-lowest p-0.5">
                        {SORT_TABS.map((tab) => (
                            <button
                                key={tab.label}
                                className={
                                    tab.available
                                        ? 'px-space-sm py-1 font-label-sm text-label-sm bg-primary text-on-primary'
                                        : 'px-space-sm py-1 font-label-sm text-label-sm text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-50'
                                }
                                type="button"
                                disabled={!tab.available}
                                aria-pressed={tab.available}
                                title={tab.available ? undefined : '준비 중입니다'}
                            >
                                {tab.label}
                                {!tab.available && <span className="sr-only"> (준비 중)</span>}
                            </button>
                        ))}
                    </div>
                    <Link href={ROUTES.search} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary flex items-center gap-0.5">
                        전체 보기
                        <Icon name="arrow_forward" className="text-[16px]" />
                    </Link>
                </div>
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    {Array.from({ length: HOME_PAGE_SIZE }, (_, i) => (
                        <SalesPostCardSkeleton key={i} />
                    ))}
                </div>
            ) : query.isError ? (
                <div className="border border-outline-variant bg-surface-container-low p-space-lg flex flex-col items-center gap-space-sm text-center" role="alert">
                    <p className="font-body-md text-body-md text-on-surface">{errorMessage(query.error, '상품 목록을 불러오지 못했습니다.')}</p>
                    <button
                        className="h-9 px-space-md border border-outline-variant bg-surface-container-lowest font-label-sm text-label-sm hover:bg-surface-container"
                        type="button"
                        onClick={() => query.refetch()}
                    >
                        다시 시도
                    </button>
                </div>
            ) : cards.length === 0 ? (
                <div className="border border-outline-variant bg-surface-container-low p-space-lg text-center font-body-md text-body-md text-on-surface-variant">
                    아직 등록된 판매 상품이 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                    {cards.map((card) => (
                        <SalesPostCard key={card.id} post={card} />
                    ))}
                </div>
            )}
        </section>
    );
}
