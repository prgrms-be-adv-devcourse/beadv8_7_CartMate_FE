'use client';

import Link from 'next/link';
import { useGetMyList2 } from '@/api/generated/individual-group-purchase-controller/individual-group-purchase-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { MessageBox, StatusBadge } from './parts';
import { ROUTES } from '@/lib/routes';

// 내가 만든 개인물품 공동구매. BE가 최신순으로 전부 돌려준다(페이지 없음).
export default function MyList() {
    const query = useGetMyList2();
    const items = query.data?.data ?? [];

    if (query.isPending) return <div className="h-48 bg-surface-container-low animate-pulse" aria-hidden />;
    if (query.isError && !query.data) {
        return <MessageBox message={errorMessage(query.error, '공동구매 목록을 불러오지 못했습니다.')} onRetry={() => query.refetch()} />;
    }
    if (items.length === 0) {
        return <MessageBox message="아직 만든 개인물품 공동구매가 없습니다." href={ROUTES.groupPurchaseIndividualNew} linkLabel="공동구매 만들기" />;
    }

    return (
        <ul className="flex flex-col border border-outline-variant bg-surface-container-lowest divide-y divide-outline-variant">
            {items.map((item) =>
                item.id === undefined ? null : (
                    <li key={item.id}>
                        <Link className="px-space-lg py-space-md flex items-center gap-space-md hover:bg-surface-container-low" href={ROUTES.groupPurchaseIndividual(item.id)}>
                            <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-space-sm">
                                    <StatusBadge status={item.status} open={item.open} />
                                    <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{item.title}</span>
                                </div>
                                <span className="font-caption text-caption text-secondary">
                                    상품 {item.productCount ?? 0}개 · 판매 기한 {formatDateTime(item.deadlineAt)}
                                </span>
                            </div>
                            <Icon name="chevron_right" className="text-[20px] text-outline" />
                        </Link>
                    </li>
                ),
            )}
        </ul>
    );
}
