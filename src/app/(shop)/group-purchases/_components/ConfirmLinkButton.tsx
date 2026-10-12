'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type ConfirmLinkButtonProps = {
    href: string;
    confirmMessage: string;
    doneMessage?: string;
    className: string;
    children: ReactNode;
};

// confirm 승인 시(선택적으로 완료 alert 후) 지정 경로로 이동하는 버튼
export default function ConfirmLinkButton({ href, confirmMessage, doneMessage, className, children }: ConfirmLinkButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (!confirm(confirmMessage)) return;
        if (doneMessage) alert(doneMessage);
        router.push(href);
    };

    return (
        <button className={className} type="button" onClick={handleClick}>
            {children}
        </button>
    );
}
