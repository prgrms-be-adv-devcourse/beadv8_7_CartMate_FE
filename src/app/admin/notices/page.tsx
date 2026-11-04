import type { Metadata } from 'next';
import AdminNoticeManager from './_components/AdminNoticeManager';

export const metadata: Metadata = { title: '공지사항 관리 | TEAMBUY 관리자' };

export default function AdminNoticesPage() {
    return <AdminNoticeManager />;
}