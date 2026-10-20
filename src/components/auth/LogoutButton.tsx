'use client';

import type { ReactNode } from 'react';
import { useLogout } from '@/lib/auth';

export default function LogoutButton({ className, children }: { className?: string; children: ReactNode }) {
    const { logout, isPending } = useLogout();

    return (
        <button className={className} type="button" onClick={logout} disabled={isPending}>
            {children}
        </button>
    );
}
