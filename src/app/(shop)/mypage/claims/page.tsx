import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import MyClaimsContent from './_components/MyClaimsContent';

export const metadata: Metadata = {
    title: '교환 · 환불 내역 | TEAMBUY',
};

export default function MyClaimsPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl w-full">
            <nav className="flex items-center gap-2 text-secondary font-body-sm text-body-sm mb-space-md">
                <Link className="hover:text-primary" href={ROUTES.myPage}>
                    마이페이지
                </Link>
                <Icon name="chevron_right" className="text-[14px] text-outline" />
                <span className="text-on-surface">교환 · 환불 내역</span>
            </nav>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                <div className="lg:col-span-3">
                    <MyPageSidebar />
                </div>
                <section className="lg:col-span-9 flex flex-col gap-space-lg">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">교환 · 환불 내역</h1>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                            신청한 교환 · 반품의 진행 상태를 확인합니다. 반품(환불)은 판매자가 승인하면 예치금으로 바로 환불됩니다.
                        </p>
                    </div>
                    {/* 쿼리 문자열(?created=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense fallback={<div className="h-64 bg-surface-container-low border border-outline-variant rounded animate-pulse" aria-busy="true" />}>
                        <MyClaimsContent />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}
