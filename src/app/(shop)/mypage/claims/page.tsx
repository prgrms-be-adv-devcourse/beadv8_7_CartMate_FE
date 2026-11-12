import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card } from '@astryxdesign/core/Card';
import MyPageShell from '@/components/layout/MyPageShell';
import MyClaimsContent from './_components/MyClaimsContent';

export const metadata: Metadata = {
    title: '교환 · 환불 내역 | TEAMBUY',
};

export default function MyClaimsPage() {
    return (
        <MyPageShell title="교환 · 환불 내역" description="신청한 교환·반품의 진행 상태와 예치금 환불을 확인합니다.">
                    {/* 쿼리 문자열(?created=)을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense fallback={<Card minHeight={256} variant="muted" className="animate-pulse" aria-busy="true" />}>
                        <MyClaimsContent />
                    </Suspense>
        </MyPageShell>
    );
}
