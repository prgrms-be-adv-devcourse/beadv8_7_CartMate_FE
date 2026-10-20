import type { Metadata } from 'next';
import { Suspense } from 'react';
import CreatedGroupPurchase from './_components/CreatedGroupPurchase';

export const metadata: Metadata = {
    title: '공동구매 생성 완료 | TEAMBUY',
};

export default function GroupPurchaseCreatedPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="max-w-[840px] mx-auto w-full flex flex-col items-center">
                {/* 만든 공동구매 id(?id=)를 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={<div className="w-full h-64 bg-surface-container-low animate-pulse" aria-hidden />}>
                    <CreatedGroupPurchase />
                </Suspense>
            </div>
        </div>
    );
}
