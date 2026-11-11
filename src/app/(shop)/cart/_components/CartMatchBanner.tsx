'use client';

import Link from 'next/link';
import { useGetCart } from '@/api/generated/cart-controller/cart-controller';
import { useGetMyMatches, getGetMyMatchesQueryKey } from '@/api/generated/cart-match-controller/cart-match-controller';
import type { CartMatchResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

export default function CartMatchBanner() {
    const cart = useGetCart();
    const productIds = [...new Set((cart.data?.data?.items ?? [])
        .map((item) => item.productId)
        .filter((id): id is number => typeof id === 'number'))].sort((a, b) => a - b);
    const matches = useGetMyMatches({
        query: {
            queryKey: [...getGetMyMatchesQueryKey(), productIds],
            staleTime: 0,
            enabled: cart.isSuccess && productIds.length > 0,
        },
    });

    if (!cart.isSuccess || cart.isFetching || productIds.length === 0) return null;
    if (matches.isPending || matches.isFetching) return null;

    if (matches.isError) {
        return (
            <div className="mb-space-lg border border-outline-variant bg-surface-container-lowest rounded p-space-md flex flex-wrap items-center justify-between gap-space-sm" role="alert">
                <p className="font-body-sm text-body-sm text-on-surface-variant">{errorMessage(matches.error, '장바구니 매칭을 불러오지 못했습니다.')}</p>
                <button className="font-label-sm text-label-sm text-primary underline" type="button" onClick={() => void matches.refetch()}>다시 시도</button>
            </div>
        );
    }

    const results = (matches.data?.data ?? []).filter((match): match is CartMatchResponse & { inviteCode: string; deadlineAt: string } =>
        match.individualGroupPurchaseId != null && match.productId != null &&
        Boolean(match.inviteCode && match.deadlineAt && match.title && match.matchType),
    );
    if (results.length === 0) return null;

    return (
        <section className="mb-space-lg border border-primary bg-surface-container-lowest rounded p-space-lg flex flex-col gap-space-md" aria-labelledby="cart-matches-title">
            <div>
                <h2 id="cart-matches-title" className="font-headline-sm text-headline-sm text-on-surface font-bold">내 장바구니와 맞는 공동구매</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">상품을 확인하고 초대 페이지에서 참여할 수 있습니다.</p>
            </div>
            <ul className="flex flex-col gap-space-sm">
                {results.map((match) => (
                    <li key={`${match.individualGroupPurchaseId}-${match.productId}`} className="border border-outline-variant rounded p-space-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                            <div className="flex items-center gap-space-xs">
                                <span className="font-caption text-caption text-primary font-bold">{match.matchType === 'EXACT' ? '같은 상품' : '비슷한 상품'}</span>
                                <span className="font-label-md text-label-md text-on-surface">{match.title}</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                {match.productName ?? `상품 #${match.productId}`} · 마감 {formatDateTime(match.deadlineAt)}
                            </p>
                        </div>
                        <Link
                            className="shrink-0 h-10 px-space-lg bg-primary text-on-primary rounded font-label-md text-label-md inline-flex items-center justify-center"
                            href={ROUTES.groupPurchaseIndividualInvite(match.inviteCode)}
                        >
                            참여 내용 보기
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
