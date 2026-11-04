import type { Metadata } from 'next';
import AdminPostDetail from './_components/AdminPostDetail';

export const metadata: Metadata = { title: '판매글 상세 | TEAMBUY 관리자' };

export default async function AdminPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <AdminPostDetail postId={Number(id)} />;
}