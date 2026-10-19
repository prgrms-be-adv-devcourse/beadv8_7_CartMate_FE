import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES } from '@/lib/routes';
import { ACCESS_TOKEN_COOKIE, readSession, type Role } from '@/lib/session';

// 페이지 접근 제어. BE SecurityConfig 의 인증 필요 API와 맞춘다.
// 쿠키만 보고 판단하는 사전 차단이며, 실제 권한 검사는 BE가 API마다 한다.
// 로그인 사용자를 로그인 화면에서 내보내는 처리는 여기서 하지 않는다 (RedirectIfLoggedIn 참고).
// roles 가 있으면 그 권한만 허용하고, 아니면 deniedTo 로 보낸다.
type Rule = { prefix: string; roles?: readonly Role[]; deniedTo?: string };

const RULES: readonly Rule[] = [
    { prefix: ROUTES.admin, roles: ['ADMIN'], deniedTo: ROUTES.home },
    { prefix: ROUTES.seller, roles: ['SELLER', 'ADMIN'], deniedTo: ROUTES.sellerApply },
    { prefix: ROUTES.myPage },
    { prefix: ROUTES.cart },
    { prefix: ROUTES.checkout },
    { prefix: ROUTES.groupPurchases },
    { prefix: ROUTES.inquiries },
];

function matches(pathname: string, prefix: string): boolean {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const session = readSession(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

    const rule = RULES.find((r) => matches(pathname, r.prefix));
    if (!rule) return NextResponse.next();

    if (!session) {
        const loginUrl = new URL(ROUTES.login, request.url);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (rule.roles && !rule.roles.includes(session.role)) {
        return NextResponse.redirect(new URL(rule.deniedTo ?? ROUTES.home, request.url));
    }

    return NextResponse.next();
}

export const config = {
    // API 프록시(/api), Next 내부 파일, 정적 파일은 검사하지 않는다.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)'],
};
