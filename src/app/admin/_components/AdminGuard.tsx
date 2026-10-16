'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export type AdminMember = {
    id: number;
    email: string;
    nickname: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
};

// 관리자 화면 안에서 로그인한 관리자 정보를 꺼내 쓰기 위한 Context
const AdminMemberContext = createContext<AdminMember | null>(null);

// 권한 확인이 끝나기 전에는 null을 돌려준다
export function useAdminMember() {
    return useContext(AdminMemberContext);
}

/**
 * 관리자 화면 보호용 가드.
 * - 하위 페이지는 항상 그리되, 확인이 끝나기 전에는 화면에서 숨긴다
 *   (Next.js의 instant navigation 검사가 하위 페이지를 확인할 수 있도록)
 * - 비로그인: 로그인 페이지로 / 관리자가 아님: 홈으로
 * 실제 보안은 백엔드의 /api/admin/** ADMIN 권한 검사가 담당한다.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [member, setMember] = useState<AdminMember | null>(null);
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await apiFetch<AdminMember>('/api/members/me');
                if (cancelled) return;

                if (res.data?.role === 'ADMIN') {
                    setMember(res.data);
                } else {
                    setDenied(true);
                    alert('관리자만 접근할 수 있는 페이지입니다.');
                    router.replace(ROUTES.home);
                }
            } catch (e) {
                if (cancelled) return;
                setDenied(true);
                if (e instanceof ApiError && e.resultCode.startsWith('401')) {
                    // 브라우저에서만 실행되는 useEffect 안이라 window를 바로 써도 됨
                    const current = window.location.pathname + window.location.search;
                    router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(current)}`);
                } else {
                    router.replace(ROUTES.home);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <AdminMemberContext.Provider value={member}>
            {!member && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-space-sm text-on-surface-variant bg-surface">
                    <Icon name={denied ? 'block' : 'hourglass_top'} className="text-[32px] text-outline" />
                    <span className="font-body-sm text-body-sm">
                        {denied ? '접근 권한이 없습니다. 이동 중입니다...' : '관리자 권한을 확인하고 있습니다...'}
                    </span>
                </div>
            )}
            {/* 확인 전에도 페이지는 그려 두고, 화면에서만 숨김 */}
            <div hidden={!member}>{children}</div>
        </AdminMemberContext.Provider>
    );
}