import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

type FilterLink = { label: string; href: string; icon?: string };

const SPORTS: FilterLink[] = [
    { label: '전체', icon: 'apps' },
    { label: '축구', icon: 'sports_soccer' },
    { label: '풋살', icon: 'sports_handball' },
    { label: '야구', icon: 'sports_baseball' },
    { label: '농구', icon: 'sports_basketball' },
    { label: '러닝', icon: 'directions_run' },
].map((item) => ({ ...item, href: ROUTES.groupPurchases }));

const DEFAULT_CATEGORIES: FilterLink[] = [
    { label: '유니폼', icon: 'checkroom', href: ROUTES.groupPurchaseNew },
    { label: '신발', icon: 'steps', href: ROUTES.groupPurchases },
    { label: '공', icon: 'sports_volleyball', href: ROUTES.groupPurchases },
    { label: '보호대/기어', icon: 'shield', href: ROUTES.groupPurchases },
];

const BASE_CHIP =
    'h-8 px-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap font-label-sm text-label-sm transition-all duration-200';
const ACTIVE_CHIP = 'bg-primary text-on-primary';
const IDLE_CHIP = 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface hover:shadow-sm';

type SportCategoryBarProps = {
    activeSport?: string;
    activeCategory?: string;
    categories?: FilterLink[];
};

function ChipGroup({ label, items, active }: { label: string; items: FilterLink[]; active?: string }) {
    return (
        <div className="flex items-center gap-space-sm min-w-0">
            <span className="pl-space-sm font-caption text-caption text-outline uppercase tracking-[0.12em] shrink-0">{label}</span>
            <nav className="flex items-center gap-1 overflow-x-auto">
                {items.map((item) => {
                    const isActive = item.label === active;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`${BASE_CHIP} ${isActive ? ACTIVE_CHIP : IDLE_CHIP}`}
                        >
                            {item.icon && <Icon name={item.icon} className="text-[16px]" />}
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

// 종목 / 카테고리 필터를 떠 있는 유리 알약 바 형태로 보여주는 서브 내비
export default function SportCategoryBar({ activeSport, activeCategory, categories = DEFAULT_CATEGORIES }: SportCategoryBarProps) {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-gutter pt-space-lg">
            <div className="glass-pill rounded-full p-1.5 flex items-center justify-between gap-space-md">
                <ChipGroup label="Sport" items={SPORTS} active={activeSport} />
                <div className="w-px h-5 bg-outline-variant shrink-0" />
                <ChipGroup label="Category" items={categories} active={activeCategory} />
            </div>
        </div>
    );
}
