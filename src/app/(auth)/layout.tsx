import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <main className="w-full min-h-screen bg-surface-container-lowest flex items-center justify-center p-gutter">{children}</main>
    );
}
