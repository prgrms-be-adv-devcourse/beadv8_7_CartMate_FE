import Icon from '@/components/ui/Icon';
import { Card, Heading, Text } from '@astryxdesign/core';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '대시보드', icon: 'dashboard', href: ROUTES.admin },
    { label: '회원 관리', icon: 'group', href: ROUTES.adminMembers },
    { label: '판매글 관리', icon: 'inventory_2', href: ROUTES.adminPosts },
    { label: '장바구니 수요', icon: 'shopping_cart', href: ROUTES.adminCartDemands },
    { label: '공지사항 관리', icon: 'campaign', href: ROUTES.adminNotices },
];

export default function AdminSidebar() {
    return (
        <aside className="relative z-50 w-full border-b border-outline-variant bg-surface-container-lowest md:fixed md:left-0 md:top-0 md:h-full md:w-64 md:border-b-0 md:border-r">
            <Card className="flex h-auto flex-col justify-between md:h-full" padding={0}>
            <div className="flex flex-col">
                <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-outline-variant">
                    <Icon name="admin_panel_settings" className="text-primary text-[20px]" />
                    <Heading level={2}>관리자 센터</Heading>
                </div>
                <div className="hidden px-space-md py-space-sm md:block">
                    <Text className="px-space-sm py-space-xs" color="secondary">메뉴 관리</Text>
                </div>
                <nav className="flex gap-space-xs overflow-x-auto px-space-md py-space-sm md:flex-col md:overflow-visible md:py-0" aria-label="관리자 메뉴">
                    <SidebarNav
                        items={MENU}
                        exactHref={ROUTES.admin}
                        className="flex shrink-0 items-center gap-space-sm whitespace-nowrap px-space-md py-space-sm rounded font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        activeClassName="flex shrink-0 items-center gap-space-sm whitespace-nowrap px-space-md py-space-sm rounded transition-colors bg-primary text-on-primary font-label-md text-label-md"
                        iconClassName="text-[18px]"
                    />
                </nav>
            </div>
            <div className="hidden border-t border-outline-variant p-space-md md:block">
                <Text color="secondary">관리자 메뉴</Text>
            </div>
            </Card>
        </aside>
    );
}
