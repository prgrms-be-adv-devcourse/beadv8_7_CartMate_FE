'use client';

import type { ReactNode } from 'react';

type AlertButtonProps = {
    message: string;
    className?: string;
    children: ReactNode;
};

// 와이어프레임의 onclick="alert(...)" 동작을 그대로 옮긴 버튼
export default function AlertButton({ message, className, children }: AlertButtonProps) {
    return (
        <button className={className} type="button" onClick={() => alert(message)}>
            {children}
        </button>
    );
}
