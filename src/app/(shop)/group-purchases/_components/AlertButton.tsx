'use client';

import type { ReactNode } from 'react';

type AlertButtonProps = {
    message: string;
    className: string;
    title?: string;
    children: ReactNode;
};

// 와이어프레임 시뮬레이션용: 클릭 시 안내 alert 만 띄우는 버튼
export default function AlertButton({ message, className, title, children }: AlertButtonProps) {
    return (
        <button className={className} title={title} type="button" onClick={() => alert(message)}>
            {children}
        </button>
    );
}
