import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import MyPageShell from '@/components/layout/MyPageShell';
import { ROUTES } from '@/lib/routes';
import ProfileContent from './_components/ProfileContent';

export const metadata: Metadata = {
    title: '회원정보 수정 | TEAMBUY',
};

export default function ProfilePage() {
    return (
        <MyPageShell
            title="회원정보 수정"
            description="닉네임, 휴대폰 번호와 비밀번호를 안전하게 관리합니다."
            headerActions={<Button label="1:1 문의" variant="secondary" href={ROUTES.inquiries} as={Link} />}
        >
            {/* 로그인 회원 데이터가 필요해서 클라이언트 컴포넌트로 */}
            <ProfileContent />
        </MyPageShell>
    );
}
