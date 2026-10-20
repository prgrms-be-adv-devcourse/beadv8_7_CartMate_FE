import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';
import ProfileContent from './_components/ProfileContent';

export const metadata: Metadata = {
    title: '회원정보 수정 | TEAMBUY',
};

export default function ProfilePage() {
    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* Breadcrumb */}
                <div className="flex items-center gap-space-xs font-caption text-caption text-outline mb-space-lg uppercase">
                    <Link className="hover:text-on-surface" href={ROUTES.myPage}>
                        마이페이지
                    </Link>
                    <span>/</span>
                    <span className="text-on-surface font-bold">회원정보 수정 및 관리</span>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    {/* Left Sidebar */}
                    <div className="col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                        <div className="bg-surface-container-low border border-outline-variant rounded p-space-md">
                            <div className="font-label-sm text-label-sm text-on-surface font-bold mb-space-xs">고객센터 안내</div>
                            <div className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                                정보 수정 및 탈퇴 관련 문의사항은 고객센터를 이용해주세요.
                            </div>
                            <Link
                                className="inline-flex items-center gap-space-xs font-label-sm text-label-sm text-primary underline"
                                href={ROUTES.inquiries}
                            >
                                <span>1:1 문의 바로가기</span>
                                <Icon name="arrow_outward" className="text-[14px]" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Content: 로그인 회원 데이터가 필요해서 클라이언트 컴포넌트로 */}
                    <ProfileContent />
                </div>
            </div>
        </div>
    );
}