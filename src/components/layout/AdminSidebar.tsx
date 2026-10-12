import Icon from '@/components/ui/Icon';
import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '회원 관리', icon: 'group', href: ROUTES.adminMembers },
    { label: '판매글 관리', icon: 'inventory_2', href: ROUTES.adminPosts },
    { label: '공지사항 관리', icon: 'campaign', href: ROUTES.adminNotices },
];

export default function AdminSidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-50 flex flex-col justify-between">
            <div className="flex flex-col">
                <div className="h-16 px-space-lg flex items-center gap-space-sm border-b border-outline-variant">
                    <Icon name="admin_panel_settings" className="text-primary text-[20px]" />
                    <span className="font-headline-sm text-headline-sm text-primary tracking-tight">관리자 센터</span>
                </div>
                <div className="px-space-md py-space-sm">
                    <div className="px-space-sm py-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                        메뉴 관리
                    </div>
                </div>
                <nav className="flex flex-col gap-space-xs px-space-md">
                    <SidebarNav
                        items={MENU}
                        className="flex items-center gap-space-sm px-space-md py-space-sm rounded font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        activeClassName="flex items-center gap-space-sm px-space-md py-space-sm rounded transition-colors bg-primary text-on-primary font-label-md text-label-md"
                        iconClassName="text-[18px]"
                    />
                </nav>
            </div>
            <div className="p-space-md border-t border-outline-variant bg-surface-container-low">
                <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                    <span>SYSTEM v1.0.0</span>
                    <span className="text-outline">WIREFRAME</span>
                </div>
            </div>
        </aside>
    );
}
