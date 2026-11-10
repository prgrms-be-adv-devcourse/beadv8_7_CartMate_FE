import type { Metadata } from 'next';
import DemandCandidates from './_components/DemandCandidates';

export const metadata: Metadata = { title: '장바구니 수요 | TEAMBUY 관리자' };

export default function AdminCartDemandsPage() {
    return <DemandCandidates />;
}
