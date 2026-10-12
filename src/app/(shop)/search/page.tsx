import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SportCategoryBar from '../_components/SportCategoryBar';

export const metadata: Metadata = { title: '검색 결과 | TEAMBUY' };

const BAR_CATEGORIES = [
    { label: '유니폼 커스텀', href: ROUTES.groupPurchaseNew },
    { label: '신발', href: ROUTES.groupPurchases },
    { label: '공', href: ROUTES.groupPurchases },
    { label: '보호대/기어', href: ROUTES.groupPurchases },
];

const APPLIED_FILTERS = ['종목: 축구', '카테고리: 유니폼/의류', '마킹 가능'];

const SPORT_FILTERS = [
    { label: '축구', count: 18, checked: true },
    { label: '풋살', count: 6 },
    { label: '야구', count: 0 },
    { label: '농구', count: 0 },
    { label: '러닝', count: 0 },
];

const CATEGORY_FILTERS = [
    { label: '유니폼 / 의류', count: 24, checked: true },
    { label: '축구화', count: 0 },
    { label: '축구공', count: 0 },
    { label: '신가드 / 보호대', count: 0 },
];

const PRICE_RANGES = [
    { label: '3만원 이하' },
    { label: '3만원 ~ 5만원', checked: true },
    { label: '5만원 ~ 10만원' },
    { label: '10만원 이상' },
];

const PRODUCTS = [
    { id: 1, brand: 'STRIKE WEAR', name: '프로 에어로 유니폼 세트 (상하의)', marking: '엠블럼/등번호 마킹 가능', price: '31,500원', moq: '10벌 이상' },
    { id: 2, brand: 'MATCH GEAR', name: '베이직 팀 저지 커스텀 킷', marking: '전사 마킹 무료 지원', price: '28,500원', moq: '15벌 이상' },
    { id: 3, brand: 'FORWARD ATHLETICS', name: '트레이닝 피치 하프집업 탑', marking: '자수 이니셜 각인', price: '33,000원', moq: '20벌 이상' },
    { id: 4, brand: 'ACTIVE PITCH', name: '클럽 골키퍼 프로텍트 세트', marking: '패딩 부착 및 등번호', price: '49,600원', moq: '5벌 이상' },
];

const SEARCH_TIPS = [
    '단어의 철자가 정확한지 확인해 보세요.',
    "보다 일반적인 검색어로 다시 검색해 보세요 (예: '글러브', '보호대').",
    '팀 대량 구매 문의는 고객센터 1:1 견적 요청을 이용하실 수 있습니다.',
];

type CheckFilter = { label: string; count: number; checked?: boolean };

function CheckboxGroup({ title, items }: { title: string; items: CheckFilter[] }) {
    return (
        <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-on-surface">{title}</span>
            <div className="flex flex-col gap-2 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                {items.map((item) => (
                    <label
                        key={item.label}
                        className={`flex items-center gap-2 cursor-pointer${item.checked ? ' text-on-surface font-semibold' : ''}`}
                    >
                        <input defaultChecked={item.checked} className="w-4 h-4 accent-primary" type="checkbox" />
                        <span>{item.label}</span>
                        <span className="ml-auto font-caption text-caption text-outline">({item.count})</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="w-full bg-surface-container-lowest">
            <SportCategoryBar activeSport="축구" activeCategory="유니폼 커스텀" categories={BAR_CATEGORIES} />
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                <div className="flex flex-col w-full">
                    <section className="flex flex-col gap-space-lg mb-space-xl">
                        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md border-b border-outline-variant">
                            <div className="flex items-baseline gap-space-sm">
                                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">&quot;축구 유니폼&quot; 검색 결과</h1>
                                <span className="font-label-md text-label-md text-on-surface-variant">(총 24개 상품)</span>
                            </div>
                            <div className="flex items-center gap-space-xs p-1 bg-surface-container rounded">
                                <button className="px-space-md py-1.5 font-label-sm text-label-sm bg-surface-container-lowest text-on-surface shadow-sm rounded-sm font-bold" type="button">
                                    전체 상품 (24)
                                </button>
                                <button className="px-space-md py-1.5 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface rounded-sm" type="button">
                                    공동구매 전용 상품 (18)
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-space-xs flex-wrap font-caption text-caption text-on-surface-variant">
                            <span className="font-label-sm text-label-sm text-on-surface">적용된 필터:</span>
                            {APPLIED_FILTERS.map((filter) => (
                                <span key={filter} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container-high rounded text-on-surface">
                                    {filter}{' '}
                                    <button className="material-symbols-outlined text-[14px]" type="button">
                                        close
                                    </button>
                                </span>
                            ))}
                            <button className="underline ml-space-xs text-outline hover:text-on-surface" type="button">
                                초기화
                            </button>
                        </div>
                    </section>
                    <div className="flex flex-col lg:flex-row gap-gutter w-full items-start">
                        <aside className="w-full lg:w-[260px] shrink-0 bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-col gap-space-lg">
                            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                                <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface">
                                    <Icon name="tune" className="text-[18px]" />
                                    필터 옵션
                                </div>
                                <button className="font-caption text-caption text-outline hover:text-on-surface flex items-center gap-0.5" type="button">
                                    <Icon name="refresh" className="text-[14px]" />
                                    초기화
                                </button>
                            </div>
                            <CheckboxGroup title="종목" items={SPORT_FILTERS} />
                            <CheckboxGroup title="카테고리" items={CATEGORY_FILTERS} />
                            <div className="w-full h-px bg-surface-container-highest" />
                            <div className="flex flex-col gap-space-sm">
                                <span className="font-label-sm text-label-sm text-on-surface">가격대</span>
                                <div className="flex items-center gap-1 font-body-sm text-body-sm">
                                    <input
                                        className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm text-right bg-surface-container-lowest"
                                        type="text"
                                        defaultValue="30,000"
                                    />
                                    <span className="text-outline">~</span>
                                    <input
                                        className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm text-right bg-surface-container-lowest"
                                        type="text"
                                        defaultValue="100,000"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                                    {PRICE_RANGES.map((range) => (
                                        <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                                            <input defaultChecked={range.checked} className="accent-primary" name="price_range" type="radio" />
                                            <span>{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full h-px bg-surface-container-highest" />
                            <button className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center" type="button">
                                필터 적용
                            </button>
                        </aside>
                        <div className="flex-1 w-full flex flex-col gap-space-lg">
                            <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant px-space-md py-2 rounded">
                                <div className="flex items-center gap-space-xs font-body-sm text-body-sm">
                                    <span className="text-outline">정렬:</span>
                                    <select
                                        className="bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-body-sm text-body-sm text-on-surface"
                                        defaultValue="최신순"
                                    >
                                        <option>최신순</option>
                                        <option>공동구매 인기순</option>
                                        <option>낮은 가격순</option>
                                        <option>높은 가격순</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                    <button className="p-1 border border-outline bg-surface-container-lowest text-on-surface rounded" type="button">
                                        <Icon name="grid_view" className="text-[18px]" />
                                    </button>
                                    <button className="p-1 border border-outline-variant bg-surface-container-lowest text-outline hover:text-on-surface rounded" type="button">
                                        <Icon name="view_list" className="text-[18px]" />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter w-full">
                                {PRODUCTS.map((product) => (
                                    <article key={product.id} className="border border-outline-variant rounded bg-surface-container-lowest hover:border-outline transition-colors">
                                        <Link href={ROUTES.product(product.id)} className="flex flex-col h-full p-space-sm">
                                            <div className="relative w-full aspect-square bg-surface-container-high border border-outline-variant rounded-sm flex items-center justify-center overflow-hidden mb-space-sm">
                                                <span className="relative font-caption text-caption text-outline bg-surface-container-lowest/80 px-1 py-0.5 rounded border border-outline-variant">
                                                    [ IMAGE: 250 x 250 ]
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 flex-1">
                                                <span className="font-caption text-caption text-outline">{product.brand}</span>
                                                <h2 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{product.name}</h2>
                                                <div className="flex items-center gap-1 font-caption text-caption text-outline">
                                                    <Icon name="edit_note" className="text-[14px]" />
                                                    {product.marking}
                                                </div>
                                                <div className="mt-space-sm pt-space-xs border-t border-outline-variant flex flex-col gap-0.5">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="font-caption text-caption font-bold text-on-surface">주문 단가</span>
                                                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{product.price}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between font-caption text-caption text-outline bg-surface-container-low p-1.5 rounded">
                                                    <span>최소수량(MOQ)</span>
                                                    <span className="font-bold text-on-surface">{product.moq}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                ))}
                            </div>
                            <div className="flex items-center justify-center gap-1 py-space-md border-t border-outline-variant font-label-sm text-label-sm mt-space-md">
                                <button className="px-2 py-1 border border-outline-variant rounded text-outline hover:text-on-surface" type="button">
                                    <Icon name="chevron_left" className="text-[16px]" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded" type="button">
                                    1
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface rounded hover:bg-surface-container" type="button">
                                    2
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant text-on-surface rounded hover:bg-surface-container" type="button">
                                    3
                                </button>
                                <button className="px-2 py-1 border border-outline-variant rounded text-on-surface hover:bg-surface-container" type="button">
                                    <Icon name="chevron_right" className="text-[16px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <section className="mt-space-xl pt-space-xl border-t-2 border-dashed border-outline-variant flex flex-col gap-space-md">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-surface-container-high border border-outline font-caption text-caption uppercase text-on-surface">WIREFRAME STATE VARIANT</span>
                            <span className="font-label-md text-label-md text-on-surface font-bold">검색 결과 없음 (Empty State) 예시</span>
                        </div>
                        <div className="w-full bg-surface-container-low border border-outline-variant rounded p-space-xl flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-surface-container-highest border border-outline-variant rounded flex items-center justify-center mb-space-md text-outline">
                                <Icon name="search_off" className="text-[32px]" />
                            </div>
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-xs">&quot;핸드볼 글러브&quot;에 대한 검색 결과가 없습니다.</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[480px] mb-space-lg">
                                입력하신 단어가 정확한지 다시 확인해 주시거나, 필터 옵션을 완화하여 다시 시도해 보세요.
                            </p>
                            <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded text-left max-w-[440px] w-full mb-space-lg flex flex-col gap-1.5 font-body-sm text-body-sm text-outline">
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
                            <div className="flex items-center gap-space-sm">
                                <button
                                    className="h-10 px-space-lg bg-surface-container-lowest border border-outline-variant font-label-md text-label-md text-on-surface rounded hover:bg-surface-container"
                                    type="button"
                                >
                                    초기 필터로 재설정
                                </button>
                                <Link
                                    className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 flex items-center gap-1"
                                    href={ROUTES.search}
                                >
                                    전체 상품 보기
                                    <Icon name="arrow_forward" className="text-[16px]" />
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
