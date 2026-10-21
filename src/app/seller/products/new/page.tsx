import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import SalesPostForm from './_components/SalesPostForm';

export const metadata: Metadata = { title: '판매글 등록 | TEAMBUY' };

export default function SellerProductNewPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-space-xl py-space-xl space-y-space-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex flex-col space-y-space-xs">
                    <div className="text-caption text-on-surface-variant uppercase tracking-wider">SELLER CENTER / PRODUCT MANAGEMENT</div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">판매글 등록</h1>
                </div>
                {/* BE가 미리보기 · 임시저장을 지원하지 않아 비활성으로 둔다. */}
                <div className="flex items-center gap-space-md">
                    <button
                        className="h-11 px-space-lg rounded bg-surface-container-high text-on-surface font-label-md flex items-center gap-space-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                        disabled
                        title="준비 중인 기능입니다"
                    >
                        <Icon name="visibility" className="text-[18px]" />
                        미리보기 (준비 중)
                    </button>
                    <button
                        className="h-11 px-space-lg rounded bg-surface-container-high text-on-surface font-label-md flex items-center gap-space-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        type="button"
                        disabled
                        title="준비 중인 기능입니다"
                    >
                        <Icon name="save" className="text-[18px]" />
                        임시저장 (준비 중)
                    </button>
                </div>
            </div>
            <SalesPostForm />
        </div>
    );
}
