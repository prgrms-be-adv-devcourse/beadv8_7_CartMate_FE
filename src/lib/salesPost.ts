import type { SelectSalesPostResponse } from '@/api/generated/model';

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

// BE 응답에는 이미지 주소가 아니라 저장 키(s3key)만 온다. 주소를 만들 기준 경로가 설정돼 있을 때만 이미지를 보여 준다.
// (로컬 BE는 업로드 파일을 정적으로 제공하지 않아 지금은 비워 둔다 → 자리 표시 이미지)
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

export function imageUrl(s3key: string | undefined): string | null {
    if (!IMAGE_BASE_URL || !s3key) return null;
    return `${IMAGE_BASE_URL.replace(/\/$/, '')}/${s3key.replace(/^\//, '')}`;
}

export function toSalesPostCard(post: SelectSalesPostResponse): SalesPostCardModel | null {
    if (post.id === undefined) return null;
    const products = post.productList ?? [];
    const prices = products.map((p) => p.basePrice).filter((price): price is number => typeof price === 'number');
    const firstImage = products
        .flatMap((p) => p.productImageList ?? [])
        .sort((a, b) => (a.image_seq ?? 0) - (b.image_seq ?? 0))[0];

    return {
        id: post.id,
        title: post.title ?? '',
        productName: products[0]?.name ?? null,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        productCount: products.length,
        imageUrl: imageUrl(firstImage?.s3key),
    };
}

const PRICE_FORMAT = new Intl.NumberFormat('ko-KR');

export function formatPrice(price: number): string {
    return `${PRICE_FORMAT.format(price)}원`;
}
