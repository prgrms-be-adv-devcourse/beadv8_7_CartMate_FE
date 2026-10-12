import type { ReactNode } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default function ShopLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <SiteHeader />
            <main className="w-full pt-32 bg-surface min-h-[calc(100vh-280px)]">{children}</main>
            <SiteFooter />
        </>
    );
}
