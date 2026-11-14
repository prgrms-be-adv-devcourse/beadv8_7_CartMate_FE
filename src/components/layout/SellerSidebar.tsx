import Link from 'next/link';
import { Button, Text } from '@astryxdesign/core';
import Icon from '@/components/ui/Icon';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '대시보드', icon: 'dashboard', href: ROUTES.seller },
    { label: '판매글 관리', icon: 'inventory_2', href: ROUTES.sellerProducts },
    { label: '배송 관리', icon: 'local_shipping', href: ROUTES.sellerShipping },
    { label: '교환·환불', icon: 'sync_alt', href: ROUTES.sellerClaims },
    { label: '정산', icon: 'payments', href: ROUTES.sellerSettlements },
    { label: '정산 계좌', icon: 'account_balance', href: ROUTES.sellerAccount },
];

export default function SellerSidebar() {
    return (
        <aside className="relative z-50 flex w-full flex-col border-b border-outline-variant/40 bg-surface px-space-md py-space-md md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:border-b-0 md:border-r md:py-space-xl">
            <Link href={ROUTES.seller} className="mb-space-md px-space-md no-underline md:mb-space-xl">
                <Text type="supporting" color="accent">TEAMBUY</Text>
                <Text display="block" weight="semibold" className="mt-1">판매자 센터</Text>
            </Link>
            <nav className="flex gap-space-xs overflow-x-auto pb-space-xs md:block md:flex-1 md:space-y-space-xs md:overflow-visible md:pb-0" aria-label="판매자 메뉴">
                <SidebarNav
                    items={MENU}
                    exactHref={ROUTES.seller}
                    className="flex shrink-0 items-center whitespace-nowrap rounded-xl px-space-md py-space-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                    activeClassName="flex shrink-0 items-center whitespace-nowrap rounded-xl bg-primary-container px-space-md py-space-sm font-label-md text-on-primary-container transition-colors"
                    iconClassName="mr-space-md"
                />
            </nav>
            <div className="mt-space-sm md:mt-0">
                <Button label="쇼핑몰로 돌아가기" href={ROUTES.home} variant="ghost" width="100%" icon={<Icon name="storefront" />} />
            </div>
        </aside>
    );
}
