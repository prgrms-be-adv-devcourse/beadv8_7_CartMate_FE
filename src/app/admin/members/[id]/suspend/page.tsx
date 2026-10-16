import type { Metadata } from 'next';
import { ROUTES } from '@/lib/routes';
import MemberDetailContent from '../_components/MemberDetailContent';
import SuspendModal from './_components/SuspendModal';

export const metadata: Metadata = {
    title: '회원 정지 처리 | TEAMBUY',
};

export default async function AdminMemberSuspendPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="flex flex-col w-full relative">
            <div className="select-none opacity-40 pointer-events-none blur-[0.5px]" aria-hidden="true">
                <MemberDetailContent memberId={id} />
            </div>
            <SuspendModal memberId={id} backHref={ROUTES.adminMember(id)} />
        </div>
    );
}