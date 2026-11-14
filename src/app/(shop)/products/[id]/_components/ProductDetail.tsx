'use client';

import { useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import ProductImage from '@/components/ui/ProductImage';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { SelectSalesPostResponse } from '@/api/generated/model';
import { useSelectSalesPostDetail } from '@/api/generated/sales-post-controller/sales-post-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { toProductOption } from '@/lib/salesPost';
import { SellerTrustPanel, toSellerTrust } from '../../../_components/SellerTrust';
import ProductActions from './ProductActions';
import ProductOptions from './ProductOptions';
import ProductPaybackConditions from './ProductPaybackConditions';

// 상품 상세 = BE 판매글 상세(/api/sales-posts/detail). URL의 id 는 판매글 id 다.
export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const postId = Number(id);
    const validId = Number.isInteger(postId) && postId > 0;

    const query = useSelectSalesPostDetail(postId, { query: { enabled: validId } });
    const post = query.data?.data;

    if (!validId || (query.error instanceof ApiError && query.error.status === 404)) {
        return <NotFound />;
    }
    if (query.isPending) return <DetailSkeleton />;
    if (query.isError || !post) {
        return (
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-8 text-center" role="alert">
                <Text>{errorMessage(query.error, '상품 정보를 불러오지 못했습니다.')}</Text>
                <div className="mt-4"><Button label="다시 시도" onClick={() => query.refetch()} /></div>
            </div>
        );
    }

    // 다른 상품으로 이동하면 선택·수량 상태를 새로 시작하도록 판매글 id 를 key 로 준다.
    return <DetailContent key={post.id} post={post} />;
}

function DetailContent({ post }: { post: SelectSalesPostResponse }) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [imageIndex, setImageIndex] = useState(0);

    const products = (post.productList ?? []).map(toProductOption).filter((p) => p !== null);
    const onSale = post.status === 'ON_SALE';
    // 처음에는 판매 중인 첫 상품을 고른 상태로 보여 준다. 고른 상품이 다시 불러온 뒤 판매 중지가 됐으면 첫 판매 중 상품으로 돌린다.
    const selectable = products.filter((p) => p.onSale);
    const currentId = selectable.find((p) => p.id === selectedId)?.id ?? selectable[0]?.id ?? null;
    const images = products.flatMap((p) => p.imageUrls);
    const mainImage = images[Math.min(imageIndex, images.length - 1)];

    return (
        <div className="flex flex-col w-full">
            <nav className="mb-6 flex items-center gap-2 font-label-sm text-label-sm text-secondary" aria-label="현재 위치">
                <Link className="hover:text-primary hover:underline" href={ROUTES.home}>
                    홈
                </Link>
                <span className="text-outline-variant">/</span>
                <Link className="hover:text-primary hover:underline" href={ROUTES.search}>
                    전체 상품
                </Link>
                <span className="text-outline-variant">/</span>
                <span className="text-primary font-bold line-clamp-1">{post.title}</span>
            </nav>
            <div className="grid grid-cols-1 items-start gap-8 pb-12 lg:grid-cols-2">
                <div className="flex flex-col gap-space-md">
                    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-container-low">
                        <ProductImage src={mainImage} alt={post.title ?? ''} className="object-contain" iconClassName="text-[48px]" />
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-space-sm">
                            {images.map((url, i) => (
                                <button
                                    key={`${i}-${url}`}
                                    className={`relative aspect-square overflow-hidden rounded-md bg-surface-container-low ${i === imageIndex ? 'border-2 border-primary' : 'border border-outline-variant hover:border-outline'}`}
                                    type="button"
                                    aria-label={`이미지 ${i + 1}`}
                                    onClick={() => setImageIndex(i)}
                                >
                                    <ProductImage src={url} alt="" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                        <Badge label={onSale ? '판매 중' : '판매 중지'} variant={onSale ? 'blue' : 'neutral'} />
                        <Text type="supporting" color="secondary">조회 {post.viewCount ?? 0}</Text>
                    </div>
                    <Heading level={1}>{post.title}</Heading>
                    {products.length === 0 ? (
                        <Text color="secondary">등록된 상품이 없습니다.</Text>
                    ) : (
                        <ProductOptions
                            products={products}
                            selectedId={currentId}
                            quantity={quantity}
                            disabled={!onSale}
                            onSelect={setSelectedId}
                            onQuantityChange={setQuantity}
                        />
                    )}
                    {currentId !== null && <ProductPaybackConditions key={currentId} productId={currentId} />}
                    <SellerTrustPanel sellerId={post.sellerId} fallback={toSellerTrust(post.sellerTrustLevel, post.sellerTrustScore)} />
                    <ProductActions postId={post.id ?? 0} productId={currentId} quantity={quantity} onSale={onSale} />
                </div>
            </div>
            <section className="mt-6 flex w-full flex-col gap-5 border-t border-outline-variant pt-10" aria-labelledby="product-information">
                <Heading id="product-information" level={2}>상품 상세 정보</Heading>
                {post.content && <Text className="whitespace-pre-line">{post.content}</Text>}
                {products.length > 0 && (
                    <Card padding={0}>
                    <div className="divide-y divide-outline-variant">
                        {products.map((product) => (
                            <div key={product.id} className="flex flex-col gap-1 p-5">
                                <Text weight="semibold">{product.name}</Text>
                                {product.description && (
                                    <Text type="supporting" color="secondary" className="whitespace-pre-line">{product.description}</Text>
                                )}
                            </div>
                        ))}
                    </div>
                    </Card>
                )}
            </section>
        </div>
    );
}

function NotFound() {
    return (
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-8">
            <EmptyState title="상품을 찾을 수 없습니다" description="삭제되었거나 잘못된 주소일 수 있어요." icon={<Icon name="search_off" />} actions={<Button label="전체 상품 보기" href={ROUTES.search} as={Link} variant="primary" />} />
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl animate-pulse" aria-hidden>
            <div className="w-full aspect-square bg-surface-container-high" />
            <div className="flex flex-col gap-space-md">
                <div className="h-4 w-1/4 bg-surface-container-high rounded" />
                <div className="h-8 w-3/4 bg-surface-container-high rounded" />
                <div className="h-24 w-full bg-surface-container-high rounded" />
                <div className="h-11 w-full bg-surface-container-high rounded" />
            </div>
        </div>
    );
}
