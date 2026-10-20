'use client';

import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useSelectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatPrice, toProductOption } from '@/lib/salesPost';
import ItemThumb from '../../../_components/ItemThumb';

const PAGE_SIZE = 5;

// 담을 상품. 공동물품은 inventoryId로 담는데, BE는 지금 상품 id를 그대로 inventoryId로 쓴다.
export type PickedProduct = { inventoryId: number; name: string; postTitle: string; price: number | null; imageUrl: string | null };

type PickerProps = {
    selectedId: number | null;
    // 이미 공동 장바구니에 있는 상품(다시 담으면 BE가 수량을 더한다)
    inCartIds: ReadonlySet<number>;
    onSelect: (product: PickedProduct) => void;
};

// 판매글 목록을 페이지로 넘기며 판매글 안의 상품을 하나 고른다.
export default function SalesProductPicker({ selectedId, inCartIds, onSelect }: PickerProps) {
    const [page, setPage] = useState(0);
    const query = useSelectSalesPostAll({ page, size: PAGE_SIZE }, { query: { placeholderData: keepPreviousData } });
    const data = query.data?.data;
    // 상품이 없는 판매글(심사 중 등)은 고를 것이 없어 뺀다.
    const posts = (data?.content ?? []).filter((post) => (post.productList ?? []).length > 0);
    const totalPages = data?.totalPages ?? 0;

    if (query.isPending) return <div className="h-64 bg-surface-container-low animate-pulse rounded" aria-hidden />;
    if (query.isError && !query.data) {
        return (
            <div className="bg-surface-container-low p-space-lg flex flex-col items-center gap-space-sm text-center rounded" role="alert">
                <p className="font-body-sm text-body-sm text-on-surface">{errorMessage(query.error, '판매 상품을 불러오지 못했습니다.')}</p>
                <button
                    className="h-9 px-space-md border border-outline-variant bg-surface-container-lowest font-label-sm text-label-sm hover:bg-surface-container"
                    type="button"
                    onClick={() => void query.refetch()}
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-space-md ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
            {posts.length === 0 && (
                <p className="p-space-lg bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant rounded">고를 수 있는 판매 상품이 없습니다.</p>
            )}
            <ul className="flex flex-col gap-space-sm">
                {posts.map((post) => {
                    const postOnSale = post.status === 'ON_SALE';
                    const products = (post.productList ?? []).map(toProductOption).filter((p) => p !== null);
                    return (
                        <li key={post.id} className="border border-outline-variant bg-surface-container-lowest rounded overflow-hidden">
                            <div className="px-space-md py-space-xs bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant truncate">{post.title}</div>
                            <ul className="divide-y divide-surface-container">
                                {products.map((product) => {
                                    const sellable = postOnSale && product.onSale;
                                    const selected = selectedId === product.id;
                                    const inCart = inCartIds.has(product.id);
                                    return (
                                        <li key={product.id} className="px-space-md py-space-sm flex items-center gap-space-md">
                                            <ItemThumb src={product.imageUrls[0]} className="w-12 h-12" />
                                            <div className="min-w-0 flex-1">
                                                <div className="font-body-md text-body-md text-on-surface truncate">{product.name}</div>
                                                <div className="font-caption text-caption text-secondary">
                                                    {product.price === null ? '가격 문의' : formatPrice(product.price)}
                                                    {inCart && ' · 이미 담김'}
                                                </div>
                                            </div>
                                            <button
                                                className={`h-9 px-space-md shrink-0 font-label-sm text-label-sm flex items-center gap-1 border rounded disabled:cursor-not-allowed ${
                                                    selected
                                                        ? 'bg-primary text-on-primary border-primary'
                                                        : 'bg-surface-container-lowest text-on-surface border-outline-variant hover:border-primary disabled:opacity-50'
                                                }`}
                                                type="button"
                                                aria-pressed={selected}
                                                disabled={!sellable}
                                                onClick={() =>
                                                    onSelect({
                                                        inventoryId: product.id,
                                                        name: product.name,
                                                        postTitle: post.title ?? '',
                                                        price: product.price,
                                                        imageUrl: product.imageUrls[0] ?? null,
                                                    })
                                                }
                                            >
                                                {selected && <Icon name="check" className="text-[16px]" />}
                                                {!sellable ? '판매 중지' : selected ? '선택됨' : '선택'}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-space-md font-label-sm text-label-sm">
                    <button
                        className="h-8 w-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container disabled:opacity-40"
                        type="button"
                        aria-label="이전 페이지"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        <Icon name="chevron_left" className="text-[18px]" />
                    </button>
                    <span className="text-on-surface-variant">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        className="h-8 w-8 border border-outline-variant flex items-center justify-center hover:bg-surface-container disabled:opacity-40"
                        type="button"
                        aria-label="다음 페이지"
                        disabled={page + 1 >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <Icon name="chevron_right" className="text-[18px]" />
                    </button>
                </div>
            )}
        </div>
    );
}
