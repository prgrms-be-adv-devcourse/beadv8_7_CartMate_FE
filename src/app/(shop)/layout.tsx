import { Suspense, type ReactNode } from 'react';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default function ShopLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Suspense fallback={<div className="h-32" />}>
                <SiteHeader />
            </Suspense>
            <main className="w-full pt-32 bg-surface min-h-[calc(100vh-280px)]">{children}</main>
            <SiteFooter />
        </>
    );
}