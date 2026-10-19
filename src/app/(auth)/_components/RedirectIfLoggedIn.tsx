'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

// 이미 로그인한 사용자가 로그인·회원가입 화면에 오면 홈으로 보낸다.
// proxy(쿠키만 확인)가 아니라 BE /me 결과로 판단한다. 쿠키가 남아 있어도 BE가 거부하는 경우
// (비밀키 변경·탈퇴 등) proxy에서 막으면 로그인 화면에 들어갈 수 없게 되기 때문이다.
export default function RedirectIfLoggedIn() {
    const router = useRouter();
    const { isLoggedIn } = useCurrentUser();

    useEffect(() => {
        if (isLoggedIn) router.replace(ROUTES.home);
    }, [isLoggedIn, router]);

    return null;
}
