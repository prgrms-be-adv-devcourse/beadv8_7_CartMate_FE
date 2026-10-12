import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '대시보드', icon: 'dashboard', href: ROUTES.seller },
    { label: '판매글 관리', icon: 'inventory_2', href: ROUTES.sellerProducts },
    { label: '배송 관리', icon: 'local_shipping', href: ROUTES.sellerShipping },
    { label: '교환·환불', icon: 'sync_alt', href: ROUTES.sellerClaims },
    { label: '정산', icon: 'payments', href: ROUTES.sellerSettlements },
    { label: '판매자 공지', icon: 'campaign', href: ROUTES.sellerNoticeNew },
    { label: '정산 계좌', icon: 'account_balance', href: ROUTES.sellerAccount },
];

export default function SellerSidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col pt-space-xl pb-space-xl">
            <Link href={ROUTES.seller} className="px-space-xl mb-space-xl text-headline-sm font-headline-sm text-primary">
                판매자 센터
            </Link>
            <nav className="flex-1 px-space-md space-y-space-xs">
                <SidebarNav
                    items={MENU}
                    exactHref={ROUTES.seller}
                    className="flex items-center px-space-md py-space-sm rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
                    activeClassName="flex items-center px-space-md py-space-sm rounded-xl transition-all bg-primary-container text-on-primary-container font-label-md"
                    iconClassName="mr-space-md"
                />
            </nav>
            <Link href={ROUTES.home} className="mx-space-md px-space-md py-space-sm flex items-center text-body-sm text-on-surface-variant hover:text-on-surface">
                <Icon name="storefront" className="mr-space-md text-[18px]" />
                쇼핑몰로 돌아가기
            </Link>
        </aside>
    );
}
