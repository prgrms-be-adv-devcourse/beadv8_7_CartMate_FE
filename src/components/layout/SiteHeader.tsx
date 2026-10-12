import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const NAV_ITEMS = [
    { label: '스포츠 종목', href: ROUTES.home },
    { label: '공동구매', href: ROUTES.groupPurchases },
    { label: '로스터 제작', href: ROUTES.groupPurchaseNew },
    { label: 'MOQ 특가', href: ROUTES.search },
];

export default function SiteHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
            <div className="max-w-[1200px] mx-auto px-gutter">
                <div className="h-12 border-b border-surface-container flex items-center justify-between text-on-surface-variant">
                    <div className="flex items-center gap-space-lg">
                        <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider">
                            [WIRE-FRAME DESKTOP VER. 1.0]
                        </span>
                        <div className="h-3 w-px bg-outline-variant" />
                        <span className="font-caption text-caption text-on-surface-variant">
                            스포츠 단체복 · 장비 커스텀 공동구매 플랫폼
                        </span>
                    </div>
                    <div className="flex items-center gap-space-lg">
                        <Link href={ROUTES.deposit} className="flex items-center gap-space-xs font-caption text-caption">
                            <span className="text-on-surface-variant">팀 예치금:</span>
                            <span className="font-label-sm text-label-sm text-primary font-bold">₩ 2,450,000</span>
                        </Link>
                        <div className="h-3 w-px bg-outline-variant" />
                        <Link href={ROUTES.login} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            로그인
                        </Link>
                        <Link href={ROUTES.signup} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            회원가입
                        </Link>
                        <Link href={ROUTES.notices} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            고객센터
                        </Link>
                        <Link href={ROUTES.seller} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">
                            판매자 센터
                        </Link>
                    </div>
                </div>
                <div className="h-20 flex items-center justify-between gap-space-xl">
                    <div className="flex items-center gap-space-xl">
                        <Link href={ROUTES.home} className="flex items-center gap-space-xs">
                            <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">TEAMBUY</span>
                            <span className="font-caption text-caption px-space-xs py-0.5 border border-primary text-primary">B2B</span>
                        </Link>
                        <form action={ROUTES.search} className="w-72 h-10 border border-outline-variant bg-surface-container-lowest flex items-center px-space-md focus-within:border-primary">
                            <Icon name="search" className="text-outline text-[18px] mr-space-sm" />
                            <input
                                name="q"
                                className="w-full bg-transparent border-none outline-none font-body-sm text-body-sm placeholder:text-outline text-on-surface"
                                placeholder="[ 유니폼, 장비명, 품번 검색 ]"
                                type="text"
                            />
                            <button className="font-label-sm text-label-sm text-outline hover:text-on-surface shrink-0" type="submit">
                                검색
                            </button>
                        </form>
                    </div>
                    <nav className="flex items-center gap-space-lg">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="h-20 flex items-center whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-space-md">
                        <Link href={ROUTES.cart} className="h-10 px-space-md border border-outline-variant flex items-center gap-space-xs whitespace-nowrap hover:border-primary transition-colors text-on-surface-variant hover:text-on-surface">
                            <Icon name="shopping_bag" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm">장바구니</span>
                            <span className="font-label-sm text-label-sm px-1.5 bg-primary text-on-primary">3</span>
                        </Link>
                        <Link href={ROUTES.myPage} className="h-10 px-space-md border border-outline-variant flex items-center gap-space-xs whitespace-nowrap hover:border-primary transition-colors text-on-surface-variant hover:text-on-surface">
                            <Icon name="account_balance_wallet" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm">마이페이지</span>
                        </Link>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-primary flex items-center justify-center">
                            <Icon name="person" className="text-on-primary text-[18px]" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
