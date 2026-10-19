import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import HeaderUtilNav from '@/components/layout/HeaderUtilNav';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const NAV_ITEMS = [
    { label: '스포츠 종목', href: ROUTES.home },
    { label: '공동구매', href: ROUTES.groupPurchases },
    { label: '로스터 제작', href: ROUTES.groupPurchaseNew },
    { label: 'MOQ 특가', href: ROUTES.search },
];

const ICON_BUTTON =
    'relative h-10 pl-3 pr-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant bg-surface-container-lowest/70 ring-1 ring-white/80 shadow-sm hover:text-on-surface hover:bg-surface-container-lowest hover:shadow-md transition-all';

export default function SiteHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b">
            <div className="max-w-[1200px] mx-auto px-gutter">
                <div className="h-12 flex items-center justify-between text-on-surface-variant">
                    <span className="font-caption text-caption text-outline">
                        스포츠 단체복 · 장비 커스텀 공동구매 플랫폼
                    </span>
                    <div className="flex items-center gap-space-md">
                        <Link
                            href={ROUTES.deposit}
                            className="h-7 pl-2 pr-3 rounded-full flex items-center gap-1.5 font-caption text-caption bg-primary-fixed/70 ring-1 ring-white/70 hover:bg-primary-fixed transition-colors"
                        >
                            <Icon name="account_balance_wallet" className="text-[15px] text-primary" />
                            <span className="text-on-surface-variant">팀 예치금</span>
                            <span className="font-label-sm text-label-sm text-primary">₩ 2,450,000</span>
                        </Link>
                        <HeaderUtilNav />
                    </div>
                </div>
                <div className="h-20 flex items-center justify-between gap-space-lg">
                    <div className="flex items-center gap-space-lg">
                        <Link href={ROUTES.home} className="flex items-center gap-1.5 shrink-0">
                            <span className="brand-gradient-text font-headline-lg text-headline-lg font-extrabold tracking-tight">TEAMBUY</span>
                            <span className="bg-primary text-on-primary font-caption text-caption px-1.5 py-0.5 rounded-full">B2B</span>
                        </Link>
                        <form
                            action={ROUTES.search}
                            className="w-72 h-10 pl-4 pr-1 rounded-full flex items-center bg-surface-container-lowest/70 ring-1 ring-white/80 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-surface-container-lowest transition-all"
                        >
                            <Icon name="search" className="text-outline text-[18px] mr-2" />
                            <input
                                name="q"
                                className="w-full bg-transparent border-none outline-none focus-visible:outline-none font-body-sm text-body-sm placeholder:text-outline text-on-surface"
                                placeholder="유니폼, 장비명, 품번 검색"
                                type="text"
                            />
                            <button
                                className="w-8 h-8 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                type="submit"
                                aria-label="검색"
                            >
                                <Icon name="arrow_forward" className="text-[16px]" />
                            </button>
                        </form>
                    </div>
                    <nav className="flex items-center gap-0.5 p-1 rounded-full bg-surface-container-lowest/50 ring-1 ring-white/70">
                        <SidebarNav
                            items={NAV_ITEMS}
                            exactHref={ROUTES.home}
                            className="h-9 px-4 rounded-full flex items-center whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/80 transition-all"
                            activeClassName="h-9 px-4 rounded-full flex items-center whitespace-nowrap font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm"
                        />
                    </nav>
                    <div className="flex items-center gap-space-sm">
                        <Link href={ROUTES.cart} className={ICON_BUTTON}>
                            <Icon name="shopping_bag" className="text-[18px]" />
                            장바구니
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-on-primary font-caption text-caption flex items-center justify-center ring-2 ring-white">
                                3
                            </span>
                        </Link>
                        <Link href={ROUTES.myPage} className={ICON_BUTTON}>
                            <Icon name="account_circle" className="text-[18px]" />
                            마이페이지
                        </Link>
                        <div className="w-9 h-9 shrink-0 rounded-full p-[2px] bg-primary">
                            <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center">
                                <Icon name="person" className="text-primary text-[18px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
