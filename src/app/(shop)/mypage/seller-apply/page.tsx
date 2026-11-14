import type { Metadata } from 'next';
import MyPageShell from '@/components/layout/MyPageShell';
import SellerApplyForm from './_components/SellerApplyForm';

export const metadata: Metadata = {
    title: '판매자 회원 전환 및 등록 | TEAMBUY',
};

export default function SellerApplyPage() {
    return (
        <MyPageShell
            title="판매자 등록"
            description="판매자 정보와 정산 계좌를 확인한 뒤 판매 활동을 시작합니다."
        >
            {/* 등록 여부 확인, 신청서, 등록 완료 화면을 모두 담당 */}
            <SellerApplyForm />
        </MyPageShell>
    );
}
