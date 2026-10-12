import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export type NavItem = {
    label: string;
    href: string;
    icon?: string;
};

export type NavItemsProps = {
    items: NavItem[];
    /** 하위 경로까지 활성으로 보지 않고 정확히 일치할 때만 활성 처리할 href (예: 대시보드 루트) */
    exactHref?: string;
    className: string;
    activeClassName: string;
    iconClassName?: string;
};

function isActive(pathname: string, href: string, exactHref?: string) {
    if (href === exactHref) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

// pathname 이 null 이면 활성 표시 없이 렌더링 (Suspense fallback 용)
export default function NavItems({
    items,
    exactHref,
    className,
    activeClassName,
    iconClassName,
    pathname,
}: NavItemsProps & { pathname: string | null }) {
    return items.map((item) => {
        const active = pathname !== null && isActive(pathname, item.href, exactHref);
        return (
            <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={active ? activeClassName : className}
            >
                {item.icon && <Icon name={item.icon} className={iconClassName} />}
                {item.label}
            </Link>
        );
    });
}
