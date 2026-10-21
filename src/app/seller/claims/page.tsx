import type { Metadata } from 'next';
import { Suspense } from 'react';
import ClaimsContent from './_components/ClaimsContent';

export const metadata: Metadata = { title: '교환·환불 관리 | TEAMBUY' };

export default function SellerClaimsPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto pb-space-xl">
            <div className="mb-space-md">
                <h1 className="text-headline-lg font-headline-lg text-on-surface">교환·환불 관리</h1>
                <p className="text-body-sm text-on-surface-variant mt-space-xs">
                    고객이 신청한 교환 · 반품을 승인하고 처리 완료로 바꿉니다. 반품(환불)은 승인하는 즉시 구매자 예치금으로 환불됩니다.
                </p>
            </div>
            {/* 쿼리 문자열(탭 · 유형 · 페이지)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
            <Suspense fallback={<p className="p-space-xl text-center text-on-surface-variant">교환 · 환불 관리 화면을 불러오는 중...</p>}>
                <ClaimsContent />
            </Suspense>
        </div>
    );
}
