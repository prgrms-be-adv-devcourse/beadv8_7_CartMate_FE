import type { Metadata } from 'next';
import Link from 'next/link';
import AdminPurchaseDashboard from './_components/AdminPurchaseDashboard';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '수요 공동구매 현황 | TEAMBUY 관리자' };

export default async function AdminIndividualGroupPurchasePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return (
        <div className="flex flex-col gap-space-lg">
            <div>
                <Link className="font-label-sm text-label-sm text-primary underline" href={ROUTES.adminCartDemands}>수요 후보로 돌아가기</Link>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-space-sm">수요 공동구매 현황</h1>
            </div>
            <AdminPurchaseDashboard id={id} />
        </div>
    );
}
