// 백엔드 공통 응답 형식 (Spring의 RsData와 동일)
export type RsData<T> = {
    resultCode: string;
    msg: string;
    data: T | null;
};

// 백엔드가 실패 응답을 보냈을 때 던지는 에러
export class ApiError extends Error {
    constructor(
        public resultCode: string,
        message: string,
    ) {
        super(message);
    }
}

// 모든 API 호출에 공통으로 사용하는 함수
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<RsData<T>> {
    const res = await fetch(path, {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
    });

    // 응답이 JSON이 아닐 때(서버가 꺼져 있는 경우 등) 대비
    const body = (await res.json().catch(() => null)) as RsData<T> | null;

    if (!res.ok || !body) {
        throw new ApiError(body?.resultCode ?? String(res.status), body?.msg ?? '서버와 통신에 실패했습니다.');
    }
    return body;
}