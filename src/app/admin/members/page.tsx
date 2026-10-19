import type { Metadata } from 'next';
import MembersContent from './_components/MembersContent';

export const metadata: Metadata = {
    title: '회원 목록 | TEAMBUY',
};

export default function AdminMembersPage() {
    return <MembersContent />;
}