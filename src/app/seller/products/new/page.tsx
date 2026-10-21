import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import SalesPostRegisterForm from './_components/SalesPostRegisterForm';

export const metadata: Metadata = { title: '판매글 등록 및 수정 | TEAMBUY' };

export default function SellerProductNewPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-space-xl py-space-xl space-y-space-xl">
            <div className="flex items-center justify-between">
                <div className="flex flex-col space-y-space-xs">
                    <div className="text-caption text-on-surface-variant uppercase tracking-wider">SELLER CENTER / PRODUCT MANAGEMENT</div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">판매글 등록 및 수정</h1>
                </div>
                <div className="flex items-center gap-space-md">
                    <button className="h-11 px-space-lg rounded bg-surface-container-high text-on-surface font-label-md hover:bg-surface-variant transition-colors flex items-center gap-space-sm" type="button" disabled>
                        <Icon name="visibility" className="text-[18px]" />
                        미리보기
                    </button>
                    <button className="h-11 px-space-lg rounded bg-primary text-on-primary font-label-md hover:opacity-90 transition-opacity flex items-center gap-space-sm" type="button" disabled>
                        <Icon name="save" className="text-[18px]" />
                        임시저장
                    </button>
                </div>
            </div>
            <SalesPostRegisterForm />
        </div>
    );
}
