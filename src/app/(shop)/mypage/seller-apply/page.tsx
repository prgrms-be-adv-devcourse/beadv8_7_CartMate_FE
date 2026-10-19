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
                <div className="flex flex-col mb-space-xl">
                    <div className="flex items-center gap-space-xs mb-space-xs font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                        <span>[MY PAGE]</span>
                        <span>/</span>
                        <span>SELLER REGISTRATION</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">판매자 회원 전환 및 등록</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        팀 단체복과 장비를 직접 판매하려면 판매자 정보와 정산 계좌를 등록하세요. 등록 즉시 판매자로 전환됩니다.
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    <MyPageSidebar />
                    {/* 등록 여부 확인, 신청서, 등록 완료 화면을 모두 담당 */}
                    <SellerApplyForm />
                </div>
            </div>
        </div>
    );
}