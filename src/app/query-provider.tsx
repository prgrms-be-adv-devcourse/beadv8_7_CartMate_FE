'use client';

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/api/http';
import { clearCurrentUser, hasCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

export default function QueryProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    // 요청마다 새 클라이언트가 생기지 않도록 컴포넌트 수명 동안 하나만 만든다.
    const [queryClient] = useState(() => {
        // 로그인 상태에서 401이 오면 토큰(30분)이 만료된 것이다. BE에 갱신 API가 없으므로 다시 로그인시킨다.
        const handleError = (error: Error, meta?: Record<string, unknown>) => {
            if (meta?.skipAuthExpired) return;
            if (!(error instanceof ApiError) || error.status !== 401 || !hasCurrentUser(client)) return;
            clearCurrentUser(client);
            const next = `${window.location.pathname}${window.location.search}`;
            router.replace(`${ROUTES.login}?expired=1&next=${encodeURIComponent(next)}`);
        };

        const client: QueryClient = new QueryClient({
            queryCache: new QueryCache({ onError: (error, query) => handleError(error, query.meta) }),
            mutationCache: new MutationCache({
                onError: (error, _variables, _context, mutation) => handleError(error, mutation.meta),
            }),
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    // 4xx(인증·권한·검증 오류)는 다시 보내도 결과가 같으므로 재시도하지 않는다.
                    retry: (failureCount, error) => {
                        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                            return false;
                        }
                        return failureCount < 1;
                    },
                },
            },
        });
        return client;
    });

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
