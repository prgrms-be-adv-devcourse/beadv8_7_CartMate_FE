import type { Metadata } from 'next';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import ShippingContent from './_components/ShippingContent';

export const metadata: Metadata = { title: '배송 관리 | TEAMBUY' };

export default function SellerShippingPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Section / Title & Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">배송 관리</h1>
                    <p className="font-body-md text-on-surface-variant mt-space-xs">
                        배송 요청 건에 송장을 등록해 배송 준비로 옮기고, 준비된 건을 발송 처리합니다.
                    </p>
                </div>
                {/* BE가 엑셀 내보내기 · 일괄 송장 등록을 지원하지 않아 비활성으로 둔다. */}
                <div className="flex items-center gap-space-sm">
                    <button
                        type="button"
                        disabled
                        title="준비 중인 기능입니다"
                        className="bg-surface-container-high text-on-surface px-space-md py-space-sm rounded-lg font-label-md flex items-center gap-space-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Icon name="download" className="text-[18px]" />
                        배송 Excel 다운로드 (준비 중)
                    </button>
                    <button
                        type="button"
                        disabled
                        title="준비 중인 기능입니다"
                        className="bg-primary text-on-primary px-space-md py-space-sm rounded-lg font-label-md flex items-center gap-space-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <Icon name="local_shipping" className="text-[18px]" />
                        일괄 송장 등록 (준비 중)
                    </button>
                </div>
            </div>
            <Suspense fallback={<p className="p-space-xl text-center text-on-surface-variant">배송 관리 화면을 불러오는 중...</p>}>
                <ShippingContent />
            </Suspense>
        </div>
    );
}
