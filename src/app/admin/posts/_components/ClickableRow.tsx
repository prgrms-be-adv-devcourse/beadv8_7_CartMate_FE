'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 행 전체 클릭 시 상세 화면으로 이동하는 테이블 행
export default function ClickableRow({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
    const router = useRouter();

    return (
        <tr className={className} onClick={() => router.push(href)}>
            {children}
        </tr>
    );
}
