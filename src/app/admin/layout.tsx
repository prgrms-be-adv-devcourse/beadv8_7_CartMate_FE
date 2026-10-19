import type { ReactNode } from 'react';
import LogoutButton from '@/components/auth/LogoutButton';
import Icon from '@/components/ui/Icon';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <AdminSidebar />
            <div className="pl-64">
                <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-space-lg">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="home" className="text-outline text-[18px]" />
                        <span className="text-outline">/</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">관리자 콘솔</span>
                    </div>
                    <div className="flex items-center gap-space-md">
                        <div className="flex items-center gap-space-sm px-space-sm py-space-xs border border-outline-variant rounded bg-surface">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Icon name="person" className="text-on-primary text-[18px]" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="font-label-sm text-label-sm text-primary leading-tight">슈퍼 관리자 (admin_master)</span>
                                <span className="font-caption text-caption text-on-surface-variant leading-tight">최고 권한 관리자</span>
                            </div>
                        </div>
                        <LogoutButton className="flex items-center gap-space-xs px-space-md py-space-sm border border-outline-variant rounded bg-surface-container-lowest font-label-sm text-label-sm text-primary hover:bg-surface-container hover:text-on-surface transition-colors">
                            <Icon name="logout" className="text-[16px]" />
                            <span>로그아웃</span>
                        </LogoutButton>
                    </div>
                </header>
                <main className="relative pt-16 bg-surface min-h-screen">
                    <div className="w-full max-w-[1200px] mx-auto p-space-lg">{children}</div>
                </main>
            </div>
        </>
    );
}
