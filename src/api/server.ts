import { cookies } from 'next/headers';

// 서버 컴포넌트·Server Function에서 BE를 호출할 때 사용자의 쿠키(인증 토큰)를 함께 넘긴다.
// 서버의 fetch는 브라우저 쿠키를 자동으로 싣지 않기 때문이다.
// 사용: await me(await withRequestCookies())
export async function withRequestCookies(init: RequestInit = {}): Promise<RequestInit> {
    const cookieHeader = (await cookies()).toString();
    if (!cookieHeader) return init;

    const headers = new Headers(init.headers);
    headers.set('cookie', cookieHeader);
    return { ...init, headers };
}
