import type { ReactNode } from 'react';

// 관리자 OTP 등록: 로그인된(등록 전용 세션) 관리자만 오는 화면이라 (auth) 그룹 밖에 둔다.
// (auth) 레이아웃은 로그인한 사용자를 홈으로 보내기 때문이다.
export default function OtpSetupLayout({ children }: { children: ReactNode }) {
    return (
        <main className="w-full min-h-screen bg-surface-container-lowest flex items-center justify-center p-gutter">
            {children}
        </main>
    );
}