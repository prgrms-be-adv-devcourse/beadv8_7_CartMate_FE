import type { Metadata } from 'next';
import AdminDashboard from './_components/AdminDashboard';


export const metadata: Metadata = { title: '관리자 대시보드 | TEAMBUY' };

export default function AdminIndexPage() {
    return <AdminDashboard />;
}