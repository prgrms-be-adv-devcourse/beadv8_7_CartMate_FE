import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { formatPrice, type SalesPostCardModel } from '@/lib/salesPost';

export default function SalesPostCard({ post }: { post: SalesPostCardModel }) {
    return (
        <article className="border border-outline-variant rounded bg-surface-container-lowest hover:border-primary transition-colors">
            <Link href={ROUTES.product(post.id)} className="flex flex-col h-full p-space-sm">
                <div className="relative w-full aspect-square bg-surface-container-high border border-outline-variant rounded-sm flex items-center justify-center overflow-hidden mb-space-sm">
                    {post.imageUrl ? (
                        <Image src={post.imageUrl} alt={post.title} fill unoptimized className="object-cover" />
                    ) : (
                        <Icon name="image" className="text-outline text-[32px]" />
                    )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    {post.productName && <span className="font-caption text-caption text-outline line-clamp-1">{post.productName}</span>}
                    <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">{post.title}</h3>
                    <div className="mt-auto pt-space-xs border-t border-outline-variant flex items-baseline justify-between">
                        <span className="font-caption text-caption text-outline">
                            {post.productCount > 1 ? `상품 ${post.productCount}종` : '판매가'}
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {post.minPrice === null ? '가격 문의' : `${formatPrice(post.minPrice)}${post.productCount > 1 ? '~' : ''}`}
                        </span>
                    </div>
                </div>
            </Link>
        </article>
    );
}

// 목록을 불러오는 동안 카드 자리를 채운다.
export function SalesPostCardSkeleton() {
    return (
        <div className="border border-outline-variant rounded bg-surface-container-lowest p-space-sm flex flex-col gap-space-sm animate-pulse" aria-hidden>
            <div className="w-full aspect-square bg-surface-container-high rounded-sm" />
            <div className="h-3 w-1/2 bg-surface-container-high rounded" />
            <div className="h-4 w-full bg-surface-container-high rounded" />
            <div className="h-4 w-1/3 bg-surface-container-high rounded self-end" />
        </div>
    );
}
