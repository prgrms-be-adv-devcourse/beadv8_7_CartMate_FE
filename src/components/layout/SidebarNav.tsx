import { Suspense } from 'react';
import ActiveNavItems from '@/components/layout/ActiveNavItems';
import NavItems, { type NavItemsProps } from '@/components/layout/NavItems';

// usePathname() 은 동적 라우트에서 런타임 값이라 Suspense 로 감싸야 프리렌더링이 막히지 않는다 (cacheComponents).
// 프리렌더 시에는 활성 표시 없는 메뉴를 먼저 보여주고, 하이드레이션 후 활성 메뉴가 표시된다.
export default function SidebarNav(props: NavItemsProps) {
    return (
        <Suspense fallback={<NavItems {...props} pathname={null} />}>
            <ActiveNavItems {...props} />
        </Suspense>
    );
}
