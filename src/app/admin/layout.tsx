import type { ReactNode } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminGuard from './_components/AdminGuard';
import AdminHeader from './_components/AdminHeader';

// 레이아웃 전체를 AdminGuard로 감싸서, 관리자 확인 전에는 사이드바·헤더·본문 모두 그리지 않는다
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminGuard>
            <AdminSidebar />
            <div className="pl-64">
                <AdminHeader />
                <main className="relative pt-16 bg-surface min-h-screen">
                    <div className="w-full max-w-[1200px] mx-auto p-space-lg">{children}</div>
                </main>
            </div>
        </AdminGuard>
    );
}