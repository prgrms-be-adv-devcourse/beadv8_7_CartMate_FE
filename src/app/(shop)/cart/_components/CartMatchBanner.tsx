'use client';

import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
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
            <Card className="mb-6" variant="muted" role="alert">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Text color="secondary">{errorMessage(matches.error, '장바구니 매칭을 불러오지 못했습니다.')}</Text>
                    <Button label="다시 시도" size="sm" variant="ghost" onClick={() => void matches.refetch()} />
                </div>
            </Card>
        );
    }

    const results = (matches.data?.data ?? []).filter((match): match is CartMatchResponse & { inviteCode: string; deadlineAt: string } =>
        match.individualGroupPurchaseId != null && match.productId != null &&
        Boolean(match.inviteCode && match.deadlineAt && match.title && match.matchType),
    );
    if (results.length === 0) return null;

    return (
        <Card className="mb-6" variant="blue">
            <section className="flex flex-col gap-4" aria-labelledby="cart-matches-title">
                <div>
                    <Heading id="cart-matches-title" level={2}>내 장바구니와 맞는 공동구매</Heading>
                    <Text as="p" type="supporting" color="secondary" className="mt-1">상품을 확인하고 초대 페이지에서 참여할 수 있습니다.</Text>
                </div>
                <ul className="flex flex-col gap-space-sm">
                    {results.map((match) => (
                        <li key={`${match.individualGroupPurchaseId}-${match.productId}`} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex flex-col gap-space-xs">
                                <div className="flex items-center gap-space-xs">
                                    <Badge label={match.matchType === 'EXACT' ? '같은 상품' : '비슷한 상품'} variant="blue" />
                                    <Text weight="semibold">{match.title}</Text>
                                </div>
                                <Text as="p" type="supporting" color="secondary">
                                    {match.productName ?? `상품 #${match.productId}`} · 마감 {formatDateTime(match.deadlineAt)}
                                </Text>
                            </div>
                            <Button
                                label="참여 내용 보기"
                                className="shrink-0"
                                href={ROUTES.groupPurchaseIndividualInvite(match.inviteCode)}
                                as={Link}
                                variant="primary"
                            />
                        </li>
                    ))}
                </ul>
            </section>
        </Card>
    );
}
