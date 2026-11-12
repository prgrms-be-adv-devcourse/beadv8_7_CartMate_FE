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
        <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-outline-variant/40 bg-surface px-space-md py-space-xl">
            <Link href={ROUTES.seller} className="mb-space-xl px-space-md no-underline">
                <Text type="supporting" color="accent">TEAMBUY</Text>
                <Text weight="semibold" className="mt-1">판매자 센터</Text>
            </Link>
            <nav className="flex-1 space-y-space-xs" aria-label="판매자 메뉴">
                <SidebarNav
                    items={MENU}
                    exactHref={ROUTES.seller}
                    className="flex items-center rounded-xl px-space-md py-space-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                    activeClassName="flex items-center rounded-xl bg-primary-container px-space-md py-space-sm font-label-md text-on-primary-container transition-colors"
                    iconClassName="mr-space-md"
                />
            </nav>
            <Button label="쇼핑몰로 돌아가기" href={ROUTES.home} variant="ghost" width="100%" icon={<Icon name="storefront" />} />
        </aside>
    );
}
