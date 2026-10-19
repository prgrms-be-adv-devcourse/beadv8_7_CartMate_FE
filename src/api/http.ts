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
