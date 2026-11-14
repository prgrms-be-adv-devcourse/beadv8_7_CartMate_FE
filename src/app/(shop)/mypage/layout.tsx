import type { ReactNode } from 'react';
import MyPageSidebar from '@/components/layout/MyPageSidebar';

// 마이페이지 공통 틀. 왼쪽 메뉴와 폭·여백은 여기서 한 번만 그리고,
// 메뉴를 옮겨 다닐 때는 오른쪽 내용만 바뀌게 한다(메뉴는 다시 그려지지 않는다).
export default function MyPageLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-[1200px] px-gutter py-8 sm:py-12">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <MyPageSidebar />
                <div className="min-w-0">{children}</div>
            </div>
        </div>
    );
}
