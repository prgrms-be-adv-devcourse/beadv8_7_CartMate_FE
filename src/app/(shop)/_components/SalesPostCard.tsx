import Link from 'next/link';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import ProductImage from '@/components/ui/ProductImage';
import { ROUTES } from '@/lib/routes';
import { formatPrice, type SalesPostCardModel } from '@/lib/salesPost';
import { SellerTrustBadge, type SellerTrust } from './SellerTrust';

export default function SalesPostCard({ post, trust }: { post: SalesPostCardModel; trust?: SellerTrust | null }) {
    return (
        <article className="h-full transition-transform duration-200 hover:-translate-y-1">
            <Card padding={2} elevation="low" height="100%">
            <Link href={ROUTES.product(post.id)} className="flex h-full flex-col rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-surface-container-high">
                    <ProductImage src={post.imageUrl} alt={post.title} className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1 px-1 pb-1">
                    {post.productName && <Text type="supporting" color="secondary" maxLines={1}>{post.productName}</Text>}
                    <Heading level={3} maxLines={2}>{post.title}</Heading>
                    {trust && (
                        <div className="pt-0.5">
                            <SellerTrustBadge trust={trust} />
                        </div>
                    )}
                    <div className="mt-auto flex items-baseline justify-between border-t border-outline-variant pt-3">
                        <Text type="supporting" color="secondary">
                            {post.productCount > 1 ? `상품 ${post.productCount}종` : '판매가'}
                        </Text>
                        <Text weight="bold" hasTabularNumbers>
                            {post.minPrice === null ? '가격 문의' : `${formatPrice(post.minPrice)}${post.productCount > 1 ? '~' : ''}`}
                        </Text>
                    </div>
                </div>
            </Link>
            </Card>
        </article>
    );
}

// 목록을 불러오는 동안 카드 자리를 채운다.
export function SalesPostCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 animate-pulse" aria-hidden>
            <div className="w-full aspect-square bg-surface-container-high rounded-md" />
            <div className="h-3 w-1/2 bg-surface-container-high rounded" />
            <div className="h-4 w-full bg-surface-container-high rounded" />
            <div className="h-4 w-1/3 bg-surface-container-high rounded self-end" />
        </div>
    );
}
