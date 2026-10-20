import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SharedDetailView from '../_components/SharedDetailView';
import { DetailSkeleton } from '../_components/SharedStatusParts';

export const metadata: Metadata = {
    title: '공동구매 상세 | TEAMBUY',
};

export default function GroupPurchaseDetailPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <nav className="flex items-center gap-2 text-secondary font-body-sm text-body-sm mb-space-md">
                <Link className="hover:text-primary" href={ROUTES.groupPurchases}>
                    내 공동구매
                </Link>
                <Icon name="chevron_right" className="text-[14px] text-outline" />
                <span className="text-on-surface">상세</span>
            </nav>
            {/* 요청마다 달라지는 공동구매 id를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<DetailSkeleton />}>
                <SharedDetailView />
            </Suspense>
        </div>
    );
}
