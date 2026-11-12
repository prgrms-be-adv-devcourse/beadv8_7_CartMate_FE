'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { useSelectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SalesPostCard, { SalesPostCardSkeleton } from '../../_components/SalesPostCard';
import { toSalesPostCardWithTrust } from '../../_components/SellerTrust';
import { SearchFilters, SearchSortBar } from './SearchFilters';

const PAGE_SIZE = 12;
// 페이지 번호는 현재 페이지 앞뒤로 이만큼만 보여 준다.
const PAGE_WINDOW = 2;

const SEARCH_TIPS = [
    '단어의 철자가 정확한지 확인해 보세요.',
    "보다 일반적인 검색어로 다시 검색해 보세요 (예: '글러브', '보호대').",
    '팀 대량 구매 문의는 고객센터 1:1 견적 요청을 이용하실 수 있습니다.',
];

// URL의 page 는 사람이 보는 1부터, BE 요청은 0부터다.
function readPage(raw: string | null): number {
    const page = Number(raw);
    return Number.isInteger(page) && page >= 1 ? page : 1;
}

function searchHref(keyword: string, page: number): string {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (page > 1) params.set('page', String(page));
    const query = params.toString();
    return query ? `${ROUTES.search}?${query}` : ROUTES.search;
}

// 검색어(q)로 판매글 제목을 검색한다. 종목·카테고리·가격 필터와 정렬은 BE가 지원하지 않아 비활성으로 둔다. (로드맵 SHOP-3)
export default function SearchResults() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q')?.trim() ?? '';
    const page = readPage(searchParams.get('page'));

    const query = useSelectSalesPostAll({ title: keyword || undefined, page: page - 1, size: PAGE_SIZE });
    const result = query.data?.data;
    const cards = (result?.content ?? []).map(toSalesPostCardWithTrust).filter((item) => item !== null);
    const totalPages = result?.totalPages ?? 0;

    return (
        <div className="flex w-full flex-col gap-7">
            <div className="flex flex-wrap items-baseline gap-2 border-b border-outline-variant pb-5">
                <Heading level={1}>
                    {keyword ? <>&quot;{keyword}&quot; 검색 결과</> : '전체 상품'}
                </Heading>
                {result && <Text type="supporting" color="secondary">총 {result.totalElements ?? 0}개 상품</Text>}
            </div>

            <div className="flex flex-col lg:flex-row gap-gutter w-full items-start">
                <SearchFilters />
                <div className="flex-1 w-full flex flex-col gap-space-lg">
                    <SearchSortBar />
                    {query.isPending ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter w-full">
                            {Array.from({ length: PAGE_SIZE }, (_, i) => (
                                <SalesPostCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : query.isError ? (
                        <div className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-8 text-center" role="alert">
                            <Text>{errorMessage(query.error, '검색 결과를 불러오지 못했습니다.')}</Text>
                            <div className="mt-4"><Button label="다시 시도" onClick={() => query.refetch()} /></div>
                        </div>
                    ) : cards.length === 0 && (result?.totalElements ?? 0) > 0 ? (
                        // 상품은 있는데 마지막 페이지를 넘어선 경우 (예: ?page=999)
                        <div className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-8 text-center">
                            <EmptyState title="이 페이지에는 상품이 없습니다" description="첫 페이지에서 검색 결과를 다시 확인해 주세요." actions={<Button label="첫 페이지로" href={searchHref(keyword, 1)} as={Link} variant="primary" />} />
                        </div>
                    ) : cards.length === 0 ? (
                        <EmptyResult keyword={keyword} />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter w-full">
                                {cards.map(({ card, trust }) => (
                                    <SalesPostCard key={card.id} post={card} trust={trust} />
                                ))}
                            </div>
                            {totalPages > 1 && <Pagination keyword={keyword} page={page} totalPages={totalPages} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Pagination({ keyword, page, totalPages }: { keyword: string; page: number; totalPages: number }) {
    const first = Math.max(1, page - PAGE_WINDOW);
    const last = Math.min(totalPages, page + PAGE_WINDOW);
    const pages = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const arrowClass = 'px-2 py-1 border border-outline-variant rounded text-on-surface hover:bg-surface-container';

    return (
        <nav className="flex items-center justify-center gap-1 py-space-md border-t border-outline-variant font-label-sm text-label-sm" aria-label="페이지">
            {page > 1 && (
                <Link className={arrowClass} href={searchHref(keyword, page - 1)} aria-label="이전 페이지">
                    <Icon name="chevron_left" className="text-[16px]" />
                </Link>
            )}
            {pages.map((n) =>
                n === page ? (
                    <span key={n} className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded" aria-current="page">
                        {n}
                    </span>
                ) : (
                    <Link
                        key={n}
                        className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface rounded hover:bg-surface-container"
                        href={searchHref(keyword, n)}
                    >
                        {n}
                    </Link>
                ),
            )}
            {page < totalPages && (
                <Link className={arrowClass} href={searchHref(keyword, page + 1)} aria-label="다음 페이지">
                    <Icon name="chevron_right" className="text-[16px]" />
                </Link>
            )}
        </nav>
    );
}

function EmptyResult({ keyword }: { keyword: string }) {
    return (
        <div className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-8 text-center">
            <EmptyState
                title={keyword ? `“${keyword}”에 대한 검색 결과가 없습니다` : '아직 등록된 판매 상품이 없습니다'}
                description={keyword ? '철자를 확인하거나 더 짧고 일반적인 검색어를 입력해 보세요.' : '새 상품이 등록되면 이곳에서 확인할 수 있어요.'}
                icon={<Icon name="search_off" className="text-[32px]" />}
                actions={keyword ? <Button label="전체 상품 보기" href={ROUTES.search} as={Link} variant="primary" /> : undefined}
            />
            {keyword && (
                    <div className="mx-auto mt-6 flex w-full max-w-[440px] flex-col gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-left font-body-sm text-body-sm text-outline">
                        <div className="font-label-sm text-label-sm text-on-surface flex items-center gap-1 mb-1">
                            <Icon name="lightbulb" className="text-[16px]" />
                            검색 팁
                        </div>
                        {SEARCH_TIPS.map((tip) => (
                            <div key={tip} className="flex items-start gap-1">
                                <span>·</span>
                                <span>{tip}</span>
                            </div>
                        ))}
                    </div>
            )}
        </div>
    );
}
