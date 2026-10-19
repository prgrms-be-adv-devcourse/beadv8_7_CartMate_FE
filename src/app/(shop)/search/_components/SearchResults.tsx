'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { toSalesPostCard } from '@/lib/salesPost';
import SalesPostCard, { SalesPostCardSkeleton } from '../../_components/SalesPostCard';

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

// 검색어(q)로 판매글 제목을 검색한다. 종목·카테고리·가격 필터와 정렬은 BE가 지원하지 않아 숨겨 두었다. (로드맵 SHOP-3)
export default function SearchResults() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('q')?.trim() ?? '';
    const page = readPage(searchParams.get('page'));

    const query = useSelectSalesPostAll({ title: keyword || undefined, page: page - 1, size: PAGE_SIZE });
    const result = query.data?.data;
    const cards = (result?.content ?? []).map(toSalesPostCard).filter((card) => card !== null);
    const totalPages = result?.totalPages ?? 0;

    return (
        <div className="flex flex-col w-full gap-space-lg">
            <div className="flex flex-wrap items-baseline gap-space-sm pb-space-md border-b border-outline-variant">
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    {keyword ? <>&quot;{keyword}&quot; 검색 결과</> : '전체 상품'}
                </h1>
                {result && <span className="font-label-md text-label-md text-on-surface-variant">(총 {result.totalElements ?? 0}개 상품)</span>}
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter w-full">
                    {Array.from({ length: PAGE_SIZE }, (_, i) => (
                        <SalesPostCardSkeleton key={i} />
                    ))}
                </div>
            ) : query.isError ? (
                <div className="w-full bg-surface-container-low border border-outline-variant rounded p-space-xl flex flex-col items-center gap-space-sm text-center" role="alert">
                    <p className="font-body-md text-body-md text-on-surface">{errorMessage(query.error, '검색 결과를 불러오지 못했습니다.')}</p>
                    <button
                        className="h-10 px-space-lg bg-surface-container-lowest border border-outline-variant font-label-md text-label-md text-on-surface rounded hover:bg-surface-container"
                        type="button"
                        onClick={() => query.refetch()}
                    >
                        다시 시도
                    </button>
                </div>
            ) : cards.length === 0 && (result?.totalElements ?? 0) > 0 ? (
                // 상품은 있는데 마지막 페이지를 넘어선 경우 (예: ?page=999)
                <div className="w-full bg-surface-container-low border border-outline-variant rounded p-space-xl flex flex-col items-center gap-space-md text-center">
                    <p className="font-body-md text-body-md text-on-surface">이 페이지에는 상품이 없습니다.</p>
                    <Link
                        className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 flex items-center"
                        href={searchHref(keyword, 1)}
                    >
                        첫 페이지로
                    </Link>
                </div>
            ) : cards.length === 0 ? (
                <EmptyResult keyword={keyword} />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter w-full">
                        {cards.map((card) => (
                            <SalesPostCard key={card.id} post={card} />
                        ))}
                    </div>
                    {totalPages > 1 && <Pagination keyword={keyword} page={page} totalPages={totalPages} />}
                </>
            )}
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
        <div className="w-full bg-surface-container-low border border-outline-variant rounded p-space-xl flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-surface-container-highest border border-outline-variant rounded flex items-center justify-center mb-space-md text-outline">
                <Icon name="search_off" className="text-[32px]" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">
                {keyword ? <>&quot;{keyword}&quot;에 대한 검색 결과가 없습니다.</> : '아직 등록된 판매 상품이 없습니다.'}
            </h2>
            {keyword && (
                <>
                    <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded text-left max-w-[440px] w-full my-space-lg flex flex-col gap-1.5 font-body-sm text-body-sm text-outline">
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
                    <Link
                        className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 flex items-center gap-1"
                        href={ROUTES.search}
                    >
                        전체 상품 보기
                        <Icon name="arrow_forward" className="text-[16px]" />
                    </Link>
                </>
            )}
        </div>
    );
}
