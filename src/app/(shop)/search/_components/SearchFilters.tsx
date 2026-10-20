import Icon from '@/components/ui/Icon';

// 검색 필터 영역. BE 검색이 제목 조건만 지원해서 화면 구성만 남겨 두고 모두 비활성이다. (로드맵 SHOP-3)
const FILTER_GROUPS = [
    { title: '종목', items: ['축구', '풋살', '야구', '농구', '러닝'] },
    { title: '카테고리', items: ['유니폼 / 의류', '축구화', '축구공', '신가드 / 보호대'] },
];

const PRICE_RANGES = ['3만원 이하', '3만원 ~ 5만원', '5만원 ~ 10만원', '10만원 이상'];

export function SearchFilters() {
    return (
        <aside className="w-full lg:w-[240px] shrink-0 bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-col gap-space-lg" aria-label="검색 필터 (준비 중)">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface">
                    <Icon name="tune" className="text-[18px]" />
                    필터 옵션
                </div>
                <span className="font-caption text-caption text-outline">준비 중</span>
            </div>
            <fieldset disabled className="flex flex-col gap-space-lg opacity-50 cursor-not-allowed">
                {FILTER_GROUPS.map((group) => (
                    <div key={group.title} className="flex flex-col gap-space-xs">
                        <span className="font-label-sm text-label-sm text-on-surface">{group.title}</span>
                        <div className="flex flex-col gap-2 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                            {group.items.map((item) => (
                                <label key={item} className="flex items-center gap-2">
                                    <input className="w-4 h-4 accent-primary" type="checkbox" />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-on-surface">가격대</span>
                    <div className="flex flex-col gap-1.5 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                        {PRICE_RANGES.map((range) => (
                            <label key={range} className="flex items-center gap-2">
                                <input className="accent-primary" name="price_range" type="radio" />
                                <span>{range}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded" type="button">
                    필터 적용
                </button>
            </fieldset>
        </aside>
    );
}

export function SearchSortBar() {
    return (
        <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant px-space-md py-2 rounded">
            <label className="flex items-center gap-space-xs font-body-sm text-body-sm">
                <span className="text-outline">정렬:</span>
                <select
                    className="bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 font-body-sm text-body-sm text-on-surface disabled:opacity-60 disabled:cursor-not-allowed"
                    defaultValue="최신순"
                    disabled
                    title="다른 정렬은 준비 중입니다"
                >
                    <option>최신순</option>
                    <option>공동구매 인기순</option>
                    <option>낮은 가격순</option>
                    <option>높은 가격순</option>
                </select>
            </label>
            <span className="font-caption text-caption text-outline">정렬 변경은 준비 중입니다</span>
        </div>
    );
}
