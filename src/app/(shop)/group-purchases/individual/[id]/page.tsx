import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ManageView, { ManageSkeleton } from '../_components/ManageView';
import { PageHeader } from '../_components/parts';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '개인물품 공동구매 관리 | TEAMBUY' };

export default function ManageIndividualGroupPurchasePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <PageHeader title="공동구매 관리">
                <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary" href={ROUTES.groupPurchasesIndividual}>
                    내가 만든 공동구매
                </Link>
            </PageHeader>
            {/* 요청마다 달라지는 공동구매 id 를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<ManageSkeleton />}>
                <ManageView />
            </Suspense>
        </div>
    );
}
