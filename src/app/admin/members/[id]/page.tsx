import type { Metadata } from 'next';
import MemberDetailContent from './_components/MemberDetailContent';

export const metadata: Metadata = {
    title: '회원 상세 정보 | TEAMBUY',
};

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <MemberDetailContent memberId={id} />;
}