import type { Metadata } from 'next';
import AdminPostsContent from './_components/AdminPostsContent';

export const metadata: Metadata = { title: '판매글 관리 | TEAMBUY 관리자' };

export default function AdminPostsPage() {
    return <AdminPostsContent />;
}