import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

type FilterLink = { label: string; href: string };

const SPORTS: FilterLink[] = ['전체', '축구', '풋살', '야구', '농구', '러닝'].map((label) => ({
    label,
    href: ROUTES.groupPurchases,
}));

const DEFAULT_CATEGORIES: FilterLink[] = [
    { label: '유니폼', href: ROUTES.groupPurchaseNew },
    { label: '신발', href: ROUTES.groupPurchases },
    { label: '공', href: ROUTES.groupPurchases },
    { label: '보호대/기어', href: ROUTES.groupPurchases },
];

const BASE_LINK = 'px-space-sm py-1 border border-outline-variant transition-colors';
const ACTIVE_LINK = 'text-on-surface font-bold bg-surface-container-highest';
const IDLE_LINK = 'text-on-surface-variant hover:text-on-surface';

type SportCategoryBarProps = {
    activeSport?: string;
    activeCategory?: string;
    categories?: FilterLink[];
};

// 원본 와이어프레임 header 하단의 SPORT / CATEGORY 필터 바를 페이지 상단 서브 내비로 옮긴 것.
export default function SportCategoryBar({ activeSport, activeCategory, categories = DEFAULT_CATEGORIES }: SportCategoryBarProps) {
    return (
        <div className="w-full bg-surface-container-lowest border-b border-outline-variant">
            <div className="h-12 max-w-[1200px] mx-auto px-gutter flex items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                    <span className="font-caption text-caption text-outline uppercase border border-outline-variant px-space-xs py-0.5 bg-surface-container">SPORT</span>
                    <nav className="flex items-center gap-space-xs font-label-sm text-label-sm">
                        {SPORTS.map((item) => {
                            const active = item.label === activeSport;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`${BASE_LINK} ${active ? ACTIVE_LINK : IDLE_LINK}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="w-px h-5 bg-outline-variant" />
                <div className="flex items-center gap-space-sm">
                    <span className="font-caption text-caption text-outline uppercase border border-outline-variant px-space-xs py-0.5 bg-surface-container">CATEGORY</span>
                    <nav className="flex items-center gap-space-xs font-label-sm text-label-sm">
                        {categories.map((item) => {
                            const active = item.label === activeCategory;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`${BASE_LINK} ${active ? ACTIVE_LINK : IDLE_LINK}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
