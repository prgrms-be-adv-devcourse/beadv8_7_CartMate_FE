'use client';

import { useGetSellerTrust } from '@/api/generated/seller-trust-controller/seller-trust-controller';
import type { SelectSalesPostResponse } from '@/api/generated/model';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import { toSalesPostCard, type SalesPostCardModel } from '@/lib/salesPost';

// 판매자 신뢰도. BE 등급 규칙(TrustScorePolicy):
// 구매확정 5건 미만이면 점수 없이 NEW, 이상이면 점수 = 100 - 귀책 클레임 비율 x 200 → 90 이상 HIGH, 70 이상 NORMAL, 나머지 LOW
export type SellerTrustLevel = 'NEW' | 'LOW' | 'NORMAL' | 'HIGH';

export type SellerTrust = {
    level: SellerTrustLevel;
    // NEW 등급이면 null
    score: number | null;
};

const LEVELS: readonly SellerTrustLevel[] = ['NEW', 'LOW', 'NORMAL', 'HIGH'];

// 모르는 등급 문자열이면 null — 등급을 추측해서 보여 주지 않는다.
export function toSellerTrust(level: string | undefined, score: number | null | undefined): SellerTrust | null {
    if (!level || !LEVELS.includes(level as SellerTrustLevel)) return null;
    const trustLevel = level as SellerTrustLevel;
    const validScore = trustLevel !== 'NEW' && typeof score === 'number' && Number.isFinite(score);
    return { level: trustLevel, score: validScore ? Math.round(Math.min(100, Math.max(0, score))) : null };
}

// 판매글 목록 응답을 상품 카드 값과 신뢰도로 바꾼다.
export function toSalesPostCardWithTrust(post: SelectSalesPostResponse): { card: SalesPostCardModel; trust: SellerTrust | null } | null {
    const card = toSalesPostCard(post);
    return card ? { card, trust: toSellerTrust(post.sellerTrustLevel, post.sellerTrustScore) } : null;
}

const STYLE: Record<SellerTrustLevel, { label: string; icon: string; variant: 'blue' | 'neutral' | 'warning' | 'info'; description: string }> = {
    HIGH: {
        label: '신뢰 높음',
        icon: 'verified',
        variant: 'blue',
        description: '판매자 귀책 클레임이 거의 없는 판매자입니다.',
    },
    NORMAL: {
        label: '신뢰 보통',
        icon: 'shield',
        variant: 'info',
        description: '판매자 귀책 클레임이 일부 있었던 판매자입니다.',
    },
    LOW: {
        label: '신뢰 낮음',
        icon: 'warning',
        variant: 'warning',
        description: '판매자 귀책 클레임(상품 불량 · 오배송) 비율이 높은 판매자입니다.',
    },
    NEW: {
        label: '신규 판매자',
        icon: 'fiber_new',
        variant: 'neutral',
        description: '구매확정 거래가 5건 미만이라 아직 신뢰도를 매기지 않았습니다.',
    },
};

// 상품 카드용 작은 배지
export function SellerTrustBadge({ trust }: { trust: SellerTrust }) {
    const style = STYLE[trust.level];
    return (
        <span title={style.description}>
            <Badge variant={style.variant} icon={<Icon name={style.icon} />} label={`${style.label}${trust.score !== null ? ` · ${trust.score}점` : ''}`} />
        </span>
    );
}

// 상품 상세의 판매자 신뢰도 영역. 판매자 신뢰도 API로 최신 값을 읽고,
// 불러오는 중이거나 실패하면 판매글 응답에 함께 온 값(fallback)을 보여 준다.
export function SellerTrustPanel({ sellerId, fallback }: { sellerId: number | undefined; fallback: SellerTrust | null }) {
    const validId = typeof sellerId === 'number' && sellerId > 0;
    // sellerId 가 없으면 enabled: false 로 요청을 보내지 않는다(0 은 쿼리 키 자리만 채움).
    const query = useGetSellerTrust(sellerId ?? 0, { query: { enabled: validId } });
    const fresh = query.data?.data;
    // 최신 응답이 있으면 그 값만 쓴다(모르는 등급이면 표시 안 함). 응답이 없을 때(불러오는 중·실패)만 판매글 값으로 대체.
    const trust = fresh ? toSellerTrust(fresh.level, fresh.score) : fallback;
    if (!trust) return null;

    const style = STYLE[trust.level];
    return (
        <section aria-label="판매자 신뢰도">
            <Card padding={4}>
            <div className="flex items-center justify-between gap-3">
                <Text weight="semibold">판매자 신뢰도</Text>
                <SellerTrustBadge trust={trust} />
            </div>
            {trust.score !== null && (
                <div
                    className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={trust.score}
                    aria-label={`신뢰도 점수 ${trust.score}점`}
                >
                    <div className="h-full bg-primary" style={{ width: `${trust.score}%` }} />
                </div>
            )}
            <Text type="supporting" color="secondary" className="mt-2">{style.description}</Text>
            </Card>
        </section>
    );
}
