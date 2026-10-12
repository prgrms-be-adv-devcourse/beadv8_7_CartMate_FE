'use client';

import { usePathname } from 'next/navigation';
import NavItems, { type NavItemsProps } from '@/components/layout/NavItems';

export default function ActiveNavItems(props: NavItemsProps) {
    const pathname = usePathname();
    return <NavItems {...props} pathname={pathname} />;
}
