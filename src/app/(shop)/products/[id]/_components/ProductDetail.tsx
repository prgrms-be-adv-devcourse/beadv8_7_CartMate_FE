'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { SelectSalesPostResponse } from '@/api/generated/model';
import { useSelectSalesPostDetail } from '@/api/generated/sales-post-controller/sales-post-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { toProductOption } from '@/lib/salesPost';
import ProductActions from './ProductActions';
import ProductOptions from './ProductOptions';

// 상품 상세 = BE 판매글 상세(/api/sales-posts/detail). URL의 id 는 판매글 id 다.
export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const postId = Number(id);
    const validId = Number.isInteger(postId) && postId > 0;

    const query = useSelectSalesPostDetail({ postId }, { query: { enabled: validId } });
    const post = query.data?.data;

    if (!validId || (query.error instanceof ApiError && query.error.status === 404)) {
        return <NotFound />;
    }
    if (query.isPending) return <DetailSkeleton />;
    if (query.isError || !post) {
        return (
            <div className="border border-outline-variant bg-surface-container-low p-space-xl flex flex-col items-center gap-space-sm text-center" role="alert">
                <p className="font-body-md text-body-md text-on-surface">{errorMessage(query.error, '상품 정보를 불러오지 못했습니다.')}</p>
                <button
                    className="h-10 px-space-lg border border-outline-variant bg-surface-container-lowest font-label-md text-label-md hover:bg-surface-container"
                    type="button"
                    onClick={() => query.refetch()}
                >
                    다시 시도
                </button>
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
            <div className="flex items-center gap-space-sm mb-space-md text-secondary font-label-sm text-label-sm">
                <Link className="hover:text-primary hover:underline" href={ROUTES.home}>
                    홈
                </Link>
                <span className="text-outline-variant">/</span>
                <Link className="hover:text-primary hover:underline" href={ROUTES.search}>
                    전체 상품
                </Link>
                <span className="text-outline-variant">/</span>
                <span className="text-primary font-bold line-clamp-1">{post.title}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-start pb-space-xl">
                <div className="flex flex-col gap-space-md">
                    <div className="relative w-full aspect-square bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
                        {mainImage ? (
                            <Image src={mainImage} alt={post.title ?? ''} fill unoptimized className="object-contain" />
                        ) : (
                            <Icon name="image" className="text-outline text-[48px]" />
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-space-sm">
                            {images.map((url, i) => (
                                <button
                                    key={`${i}-${url}`}
                                    className={`relative aspect-square bg-surface-container-low overflow-hidden ${i === imageIndex ? 'border-2 border-primary' : 'border border-outline-variant hover:border-outline'}`}
                                    type="button"
                                    aria-label={`이미지 ${i + 1}`}
                                    onClick={() => setImageIndex(i)}
                                >
                                    <Image src={url} alt="" fill unoptimized className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-space-md bg-surface-container-lowest">
                    <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-highest font-caption text-caption text-secondary">
                        <span>{onSale ? '판매 중' : '현재 판매하지 않는 상품입니다'}</span>
                        <span>조회 {post.viewCount ?? 0}</span>
                    </div>
                    <h1 className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">{post.title}</h1>
                    {products.length === 0 ? (
                        <p className="font-body-md text-body-md text-secondary">등록된 상품이 없습니다.</p>
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
                    <ProductActions postId={post.id ?? 0} productId={currentId} quantity={quantity} onSale={onSale} />
                </div>
            </div>
            <section className="w-full mt-space-lg pt-space-md border-t-2 border-primary flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold border-l-4 border-primary pl-space-sm">상품 상세 정보</h2>
                {post.content && <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{post.content}</p>}
                {products.length > 0 && (
                    <div className="border border-outline-variant divide-y divide-outline-variant">
                        {products.map((product) => (
                            <div key={product.id} className="p-space-md flex flex-col gap-1">
                                <span className="font-label-md text-label-md text-on-surface font-bold">{product.name}</span>
                                {product.description && (
                                    <p className="font-body-sm text-body-sm text-secondary whitespace-pre-line">{product.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function NotFound() {
    return (
        <div className="border border-outline-variant bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
            <Icon name="search_off" className="text-outline text-[32px]" />
            <p className="font-headline-sm text-headline-sm text-on-surface">상품을 찾을 수 없습니다.</p>
            <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded flex items-center" href={ROUTES.search}>
                전체 상품 보기
            </Link>
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
