// BE가 내려주는 accessToken(JWT) 쿠키에서 화면 분기에 필요한 정보만 읽는다.
// 서명은 검증하지 않는다(BE 비밀키를 FE에 두지 않기 위해). 위조된 토큰으로 페이지 틀은 볼 수 있어도
// 데이터 API는 BE가 막으므로, 여기서는 "미리 걸러 내는" 용도로만 쓴다.
export const ACCESS_TOKEN_COOKIE = 'accessToken';

export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export type Session = {
    memberId: string;
    role: Role;
};

const ROLES: readonly Role[] = ['BUYER', 'SELLER', 'ADMIN'];

export function readSession(token: string | undefined, now = Date.now()): Session | null {
    if (!token) return null;
    try {
        const payload = JSON.parse(decodeBase64Url(token.split('.')[1] ?? ''));
        if (typeof payload.exp !== 'number' || payload.exp * 1000 <= now) return null;
        if (!ROLES.includes(payload.role)) return null;
        return { memberId: String(payload.sub), role: payload.role };
    } catch {
        return null;
    }
}

function decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}
