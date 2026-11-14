import type { ReactNode } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default function ShopLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-on-background">
            <SiteHeader />
            <main className="w-full min-h-[calc(100vh-320px)]">{children}</main>
            <SiteFooter />
        </div>
    );
}
