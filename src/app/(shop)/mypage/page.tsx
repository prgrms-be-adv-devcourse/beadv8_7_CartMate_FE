import type { Metadata } from 'next';
import MyPageContent from './_components/MyPageContent';

export const metadata: Metadata = {
    title: '마이페이지 | TEAMBUY',
};

// metadata는 서버 컴포넌트에서만 쓸 수 있어서, 로그인 확인이 필요한 본문은 클라이언트 컴포넌트로 분리
export default function MyPage() {
    return <MyPageContent />;
}