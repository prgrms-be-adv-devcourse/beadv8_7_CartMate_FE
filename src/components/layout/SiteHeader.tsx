import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import HeaderAccountNav from '@/components/layout/HeaderAccountNav';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const NAV_ITEMS = [
    { label: '스포츠 종목', href: ROUTES.home },
    { label: '공동구매', href: ROUTES.groupPurchases },
    { label: 'MOQ 특가', href: ROUTES.search },
];

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur">
            <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <Link href={ROUTES.home} className="flex shrink-0 items-center gap-2" aria-label="TEAMBUY 홈">
                        <span className="font-headline-md text-headline-md font-extrabold tracking-[-0.04em] text-on-surface">TEAMBUY</span>
                        <span className="rounded-full bg-primary px-2 py-0.5 font-caption text-caption text-on-primary">TEAM STORE</span>
                    </Link>
                    <form action={ROUTES.search} className="ml-auto hidden min-w-0 max-w-md flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-low px-3 focus-within:border-primary md:flex">
                        <Icon name="search" className="mr-2 text-[18px] text-outline" />
                        <label className="sr-only" htmlFor="site-search">상품 검색</label>
                        <input id="site-search" name="q" className="h-10 min-w-0 flex-1 bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline" placeholder="상품명으로 검색" type="search" />
                    </form>
                    <HeaderAccountNav />
                </div>
            </div>
            {/* 구분선은 아래 테두리처럼 화면 끝까지 긋고, 내용만 1200px 안에 둔다. 메뉴 밑줄은 헤더 아래 테두리에 닿는다. */}
            <div className="border-t border-outline-variant">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 pb-3 sm:px-6 md:flex-row md:items-center md:pb-0">
                    <nav className="flex w-full items-center gap-1 overflow-x-auto md:w-auto">
                        <SidebarNav
                            items={NAV_ITEMS}
                            exactHref={ROUTES.home}
                            className="relative flex h-11 items-center whitespace-nowrap px-3 font-label-sm text-label-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 text-on-surface-variant hover:text-on-surface"
                            activeClassName="relative flex h-11 items-center whitespace-nowrap px-3 font-label-sm text-label-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 font-semibold text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                        />
                    </nav>
                    <form action={ROUTES.search} className="flex w-full min-w-0 items-center rounded-lg border border-outline-variant bg-surface-container-low px-3 md:hidden">
                        <Icon name="search" className="mr-2 text-[18px] text-outline" />
                        <label className="sr-only" htmlFor="mobile-site-search">상품 검색</label>
                        <input id="mobile-site-search" name="q" className="h-9 min-w-0 flex-1 bg-transparent font-body-sm text-body-sm outline-none" placeholder="상품 검색" type="search" />
                    </form>
                </div>
            </div>
        </header>
    );
}
