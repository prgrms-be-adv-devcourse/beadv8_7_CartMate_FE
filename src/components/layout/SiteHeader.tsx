import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import Icon from '@/components/ui/Icon';
import { CartCountBadge, DepositAmount } from '@/components/layout/HeaderUserBadges';
import HeaderUtilNav from '@/components/layout/HeaderUtilNav';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const NAV_ITEMS = [
    { label: '스포츠 종목', href: ROUTES.home },
    { label: '공동구매', href: ROUTES.groupPurchases },
    { label: '로스터 제작', href: ROUTES.groupPurchaseNew },
    { label: 'MOQ 특가', href: ROUTES.search },
];

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur">
            <div className="border-b border-outline-variant">
                <div className="mx-auto flex min-h-9 max-w-[1200px] items-center justify-end px-4 sm:px-6">
                    <HeaderUtilNav />
                </div>
            </div>
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
                    <div className="ml-auto flex items-center gap-2 md:ml-0">
                        <div className="hidden sm:block">
                            <Button label="예치금" href={ROUTES.deposit} variant="ghost" size="sm">
                                예치금 <DepositAmount />
                            </Button>
                        </div>
                        <div className="relative sm:hidden">
                            <Button label="장바구니" href={ROUTES.cart} variant="ghost" size="sm" icon={<Icon name="shopping_bag" />} isIconOnly />
                            <CartCountBadge />
                        </div>
                        <div className="relative hidden sm:block">
                            <Button label="장바구니" href={ROUTES.cart} variant="ghost" size="sm" icon={<Icon name="shopping_bag" />} />
                            <CartCountBadge />
                        </div>
                        <div className="sm:hidden"><Button label="마이페이지" href={ROUTES.myPage} variant="ghost" size="sm" icon={<Icon name="account_circle" />} isIconOnly /></div>
                        <div className="hidden sm:block"><Button label="마이페이지" href={ROUTES.myPage} variant="ghost" size="sm" icon={<Icon name="account_circle" />} /></div>
                    </div>
                </div>
                <div className="mt-3 flex flex-col gap-3 border-t border-outline-variant pt-3 md:flex-row md:items-center">
                    <nav className="flex w-full items-center gap-1 overflow-x-auto md:w-auto">
                        <SidebarNav
                            items={NAV_ITEMS}
                            exactHref={ROUTES.home}
                            className="flex h-9 items-center whitespace-nowrap rounded-md px-3 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                            activeClassName="flex h-9 items-center whitespace-nowrap rounded-md bg-surface-container-high px-3 font-label-sm text-label-sm text-primary"
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
