import type { ReactNode } from 'react';
import Icon from '@/components/ui/Icon';
import SellerSidebar from '@/components/layout/SellerSidebar';

export default function SellerLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <SellerSidebar />
            <div className="pl-64">
                <header className="fixed top-0 left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-xl">
                    <div className="flex items-center gap-space-md" />
                    <div className="flex items-center gap-space-lg">
                        <Icon name="notifications" className="text-on-surface-variant cursor-pointer" />
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <Icon name="person" className="text-on-primary text-[18px]" />
                        </div>
                    </div>
                </header>
                <main className="relative pt-16 bg-surface min-h-[calc(100vh-4rem)] p-space-xl">{children}</main>
                <footer className="w-full bg-surface-container-low py-space-xl border-t border-surface-variant">
                    <div className="max-w-7xl mx-auto px-space-xl text-center text-on-surface-variant text-body-sm">
                        © 2024 Seller Center. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
