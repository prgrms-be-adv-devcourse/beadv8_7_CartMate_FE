import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductDetail, { DetailSkeleton } from './_components/ProductDetail';

export const metadata: Metadata = { title: '상품 상세 | TEAMBUY' };

// 원단 스펙·사이즈 가이드·FAQ 탭은 상품별 데이터가 BE에 없어 숨겨 두었다. (로드맵 SHOP-3)
export default function ProductDetailPage() {
    return (
        <div className="w-full bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                {/* 요청마다 달라지는 상품 id 를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={<DetailSkeleton />}>
                    <ProductDetail />
                </Suspense>
            </div>
        </div>
    );
}
