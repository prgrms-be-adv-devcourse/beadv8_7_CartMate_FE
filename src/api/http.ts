// orval이 생성한 API 함수가 공통으로 쓰는 fetch 래퍼.
// 브라우저에서는 상대 경로(/api/...)로 호출하고 next.config의 rewrites가 BE로 넘긴다.
// 서버(RSC)에서는 rewrites를 거치지 않으므로 BE 주소를 직접 붙인다.
const SERVER_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8985';

export type RsData<T> = {
    resultCode: string;
    msg: string;
    data: T;
};

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly resultCode: string | undefined,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// ===== 액세스 토큰 자동 재발급 =====
// 여러 요청이 동시에 401을 받아도 /api/auth/refresh 는 한 번만 보낸다.
// lib/api.ts(apiFetch)도 이 함수를 같이 써서, 두 방식이 섞인 화면에서도 한 번만 재발급한다.
let refreshing: Promise<boolean> | null = null;

export function refreshOnce(): Promise<boolean> {
    if (!refreshing) {
        refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
            .then((res) => res.ok)
            .catch(() => false)
            .finally(() => {
                // 같은 순간에 기다리던 요청들이 결과를 받은 뒤 비운다
                setTimeout(() => {
                    refreshing = null;
                }, 0);
            });
    }
    return refreshing;
}

// 로그인·재발급·로그아웃 요청은 401이어도 재발급하지 않는다 (무한 반복 방지)
export const isAuthPath = (url: string) => url.startsWith('/api/auth/');

export async function http<T>(url: string, options: RequestInit = {}, retried = false): Promise<T> {
    const isBrowser = typeof window !== 'undefined';
    const baseUrl = isBrowser ? '' : SERVER_BASE_URL;

    let response: Response;
    try {
        response = await fetch(`${baseUrl}${url}`, {
            ...options,
            credentials: 'include',
        });
    } catch {
        // 네트워크 단절 등으로 응답 자체를 받지 못한 경우
        throw new ApiError(0, undefined, '서버에 연결할 수 없습니다.');
    }

    // 액세스 토큰 만료 → 재발급 후 한 번만 재시도
    // 서버(RSC)에서는 응답 쿠키를 브라우저에 심을 수 없어서 재발급하지 않는다.
    if (response.status === 401 && isBrowser && !retried && !isAuthPath(url)) {
        if (await refreshOnce()) {
            return http<T>(url, options, true);
        }
        // 재발급 실패면 아래에서 원래 401을 그대로 던진다 → 화면이 로그인으로 보냄
    }

    const body = parseBody(await response.text());

    if (!response.ok) {
        // BE가 꺼져 있으면 프록시가 JSON이 아닌 에러 페이지를 돌려줄 수 있다.
        const rsData = isRsData(body) ? body : undefined;
        throw new ApiError(
            response.status,
            rsData?.resultCode,
            rsData?.msg ?? `요청에 실패했습니다. (${response.status})`,
        );
    }

    return body as T;
}

// 화면에 보여 줄 에러 메시지. BE가 보낸 msg가 있으면 그대로 쓴다.
export function errorMessage(error: unknown, fallback = '요청 처리 중 문제가 발생했습니다.'): string {
    return error instanceof ApiError ? error.message : fallback;
}

function parseBody(text: string): unknown {
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function isRsData(value: unknown): value is RsData<unknown> {
    return typeof value === 'object' && value !== null && 'resultCode' in value;
}