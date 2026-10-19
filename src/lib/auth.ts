'use client';

import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useLogout as useLogoutMutation } from '@/api/generated/auth-controller/auth-controller';
import { getMeQueryKey, me } from '@/api/generated/member-controller/member-controller';
import type { MemberDto, RsDataMemberDto } from '@/api/generated/model';
import { ApiError } from '@/api/http';
import { ROUTES } from '@/lib/routes';

// 로그인 상태의 기준은 BE의 /api/members/me 하나다.
// 토큰은 BE가 httpOnly 쿠키로 관리하므로 FE는 토큰을 직접 저장하지 않는다.
const ME_KEY = getMeQueryKey();

// 로그인하지 않은 상태(401)는 에러가 아니라 "사용자 없음"으로 본다.
async function fetchMe(): Promise<MemberDto | null> {
    try {
        const res = await me();
        return res.data ?? null;
    } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
    }
}

export function useCurrentUser() {
    const query = useQuery({
        queryKey: ME_KEY,
        queryFn: fetchMe,
        staleTime: 5 * 60 * 1000,
    });
    const user = query.data ?? null;
    return { user, isLoggedIn: user !== null, isLoading: query.isPending };
}

// 로그인·로그아웃 요청의 401은 "토큰 만료"가 아니므로 전역 만료 처리(QueryProvider)에서 제외한다.
export const SKIP_AUTH_EXPIRED = { skipAuthExpired: true };

// 로그인 API 응답으로 바로 상태를 채워 /me 를 다시 부르지 않는다.
// 로그인 전에 시작된 /me(401→null) 응답이 늦게 와서 덮어쓰지 않도록 먼저 취소한다.
export async function setCurrentUser(queryClient: QueryClient, res: RsDataMemberDto) {
    await queryClient.cancelQueries({ queryKey: ME_KEY });
    queryClient.setQueryData<MemberDto | null>(ME_KEY, res.data ?? null);
}

// 사용자별 캐시(장바구니·주문 등)가 다음 사용자에게 보이지 않도록 비우고 "사용자 없음"으로 둔다.
// me 쿼리는 지우지 않고 값만 바꾼다. 지우면 화면의 구독자(헤더 등)가 바뀐 값을 바로 받지 못한다.
export function clearCurrentUser(queryClient: QueryClient) {
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== ME_KEY[0] });
    queryClient.setQueryData<MemberDto | null>(ME_KEY, null);
}

export function hasCurrentUser(queryClient: QueryClient): boolean {
    return Boolean(queryClient.getQueryData<MemberDto | null>(ME_KEY));
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const mutation = useLogoutMutation({
        mutation: {
            meta: SKIP_AUTH_EXPIRED,
            // BE 호출이 실패해도 화면에서는 로그아웃 처리한다. (쿠키는 30분 뒤 만료된다)
            onSettled: () => {
                clearCurrentUser(queryClient);
                router.replace(ROUTES.home);
                router.refresh();
            },
        },
    });
    return { logout: () => mutation.mutate(), isPending: mutation.isPending };
}
