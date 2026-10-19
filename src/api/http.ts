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

export async function http<T>(url: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = typeof window === 'undefined' ? SERVER_BASE_URL : '';

    const response = await fetch(`${baseUrl}${url}`, {
        ...options,
        credentials: 'include',
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
        throw new ApiError(
            response.status,
            body?.resultCode,
            body?.msg ?? `요청에 실패했습니다. (${response.status})`,
        );
    }

    return body as T;
}
