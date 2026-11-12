import type { Metadata } from 'next';
import { Button, Heading } from '@astryxdesign/core';
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
            <div className="flex flex-col items-start gap-space-sm">
                <Button label="수요 후보로 돌아가기" href={ROUTES.adminCartDemands} variant="ghost" size="sm" />
                <Heading level={1}>수요 공동구매 현황</Heading>
            </div>
            <AdminPurchaseDashboard id={id} />
        </div>
    );
}
