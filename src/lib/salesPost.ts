import type { SelectSalesPostProduct, SelectSalesPostResponse } from '@/api/generated/model';

// 판매글(SelectSalesPostResponse)을 상품 카드에 필요한 값으로 바꾼다.
export type SalesPostCardModel = {
    id: number;
    title: string;
    productName: string | null;
    // 판매글에 상품이 여러 개면 가장 낮은 기본가를 "~부터" 가격으로 쓴다.
    minPrice: number | null;
    productCount: number;
    imageUrl: string | null;
};

// 로컬 BE는 /images/**로 파일을 제공하고, 다른 저장소는 완성된 URL 또는 저장 키를 돌려줄 수 있다.
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '/images';

export function imageUrl(s3key: string | undefined): string | null {
    if (!s3key) return null;
    if (/^https?:\/\//.test(s3key) || s3key.startsWith('/images/')) return s3key;
    return `${IMAGE_BASE_URL.replace(/\/$/, '')}/${s3key.replace(/^\//, '')}`;
}

export function toSalesPostCard(post: SelectSalesPostResponse): SalesPostCardModel | null {
    if (post.id === undefined) return null;
    const products = post.productList ?? [];
    const prices = products.map((p) => p.basePrice).filter((price): price is number => typeof price === 'number');
    const firstImage = products
        .flatMap((p) => p.productImageList ?? [])
        .sort((a, b) => (a.imageSeq ?? 0) - (b.imageSeq ?? 0))[0];

    return {
        id: post.id,
        title: post.title ?? '',
        productName: products[0]?.name ?? null,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        productCount: products.length,
        imageUrl: imageUrl(firstImage?.s3key),
    };
}

// 상품 상세에서 고를 수 있는 상품 한 줄
export type ProductOption = {
    id: number;
    name: string;
    description: string;
    price: number | null;
    onSale: boolean;
    imageUrls: string[];
};

export function toProductOption(product: SelectSalesPostProduct): ProductOption | null {
    if (product.id === undefined) return null;
    return {
        id: product.id,
        name: product.name ?? '',
        description: product.description ?? '',
        price: typeof product.basePrice === 'number' ? product.basePrice : null,
        onSale: product.status === 'ON_SALE',
        imageUrls: [...(product.productImageList ?? [])]
            .sort((a, b) => (a.imageSeq ?? 0) - (b.imageSeq ?? 0))
            .map((image) => imageUrl(image.s3key))
            .filter((url): url is string => url !== null),
    };
}

const PRICE_FORMAT = new Intl.NumberFormat('ko-KR');

export function formatPrice(price: number): string {
    return `${PRICE_FORMAT.format(price)}원`;
}
