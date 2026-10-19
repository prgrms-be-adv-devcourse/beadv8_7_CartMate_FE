'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/api/http';

export default function QueryProvider({ children }: { children: ReactNode }) {
    // 요청마다 새 클라이언트가 생기지 않도록 컴포넌트 수명 동안 하나만 만든다.
    const [queryClient] = useState(
        () =>
            new QueryClient({
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
            }),
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
