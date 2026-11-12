import type { ReactNode } from 'react';
import ListHeader from './_components/ListHeader';

// 공동물품·개인물품 목록은 이 틀을 함께 쓴다. 탭을 옮겨도 머리말은 다시 그려지지 않고 아래 목록만 바뀐다.
export default function GroupPurchaseListLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-8 sm:py-12 flex flex-col gap-space-lg">
                <ListHeader />
                {children}
            </div>
        </div>
    );
}
