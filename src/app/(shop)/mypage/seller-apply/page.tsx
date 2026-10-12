import type { Metadata } from 'next';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import SellerApplyForm from './_components/SellerApplyForm';

export const metadata: Metadata = {
    title: '판매자 회원 전환 및 등록 | TEAMBUY',
};

export default function SellerApplyPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl w-full">
                {/* Page Header */}
                <div className="flex flex-col mb-space-xl">
                    <div className="flex items-center gap-space-xs mb-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                        <span>[MY PAGE]</span>
                        <span>/</span>
                        <span>SELLER REGISTRATION</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">판매자 회원 전환 및 등록</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        팀 단체복 및 장비 B2C/B2B 커머스 입점을 위한 판매자 정보를 입력하고 승인을 요청하세요.
                    </p>
                </div>

                {/* Main Grid Layout: Sidebar + Form */}
                <div className="grid grid-cols-12 gap-gutter items-start">
                    <MyPageSidebar />

                    {/* Right Content Area (9 Columns): Seller Registration Form */}
                    <section className="col-span-9 bg-surface-container-lowest rounded-lg p-space-xl border border-outline-variant">
                        <div className="flex items-center justify-between pb-space-lg mb-space-lg border-b border-outline-variant">
                            <div>
                                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">판매자 파트너 신청서</h2>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    사업자 정보 및 정산 계좌를 정확히 입력해 주세요. 승인 후 상품 등록이 가능합니다.
                                </p>
                            </div>
                            <div className="px-space-sm py-1 bg-surface-container text-on-surface font-caption text-caption rounded border border-outline-variant">
                                상태: <span className="font-bold text-primary">미등록 (심사 전)</span>
                            </div>
                        </div>
                        <SellerApplyForm />
                    </section>
                </div>
            </div>
        </div>
    );
}
