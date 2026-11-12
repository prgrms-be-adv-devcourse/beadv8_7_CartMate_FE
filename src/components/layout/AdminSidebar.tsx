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
        <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-outline-variant bg-surface-container-lowest">
            <Card className="flex h-full flex-col justify-between" padding={0}>
            <div className="flex flex-col">
                <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-outline-variant">
                    <Icon name="admin_panel_settings" className="text-primary text-[20px]" />
                    <Heading level={2}>관리자 센터</Heading>
                </div>
                <div className="px-space-md py-space-sm">
                    <Text className="px-space-sm py-space-xs" color="secondary">메뉴 관리</Text>
                </div>
                <nav className="flex flex-col gap-space-xs px-space-md">
                    <SidebarNav
                        items={MENU}
                        exactHref={ROUTES.admin}
                        className="flex items-center gap-space-sm px-space-md py-space-sm rounded font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        activeClassName="flex items-center gap-space-sm px-space-md py-space-sm rounded transition-colors bg-primary text-on-primary font-label-md text-label-md"
                        iconClassName="text-[18px]"
                    />
                </nav>
            </div>
            <div className="border-t border-outline-variant p-space-md">
                <Text color="secondary">관리자 메뉴</Text>
            </div>
            </Card>
        </aside>
    );
}
