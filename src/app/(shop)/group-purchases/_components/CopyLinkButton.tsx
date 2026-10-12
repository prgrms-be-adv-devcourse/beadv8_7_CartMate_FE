'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

type CopyLinkButtonProps = {
    url: string;
    label: string;
    copiedLabel?: string;
    icon?: string;
    className: string;
    copiedClassName?: string;
    iconClassName?: string;
};

// 클릭 시 링크를 클립보드에 복사하고 2초간 완료 상태를 표시하는 버튼
export default function CopyLinkButton({
    url,
    label,
    copiedLabel = '복사 완료!',
    icon = 'share',
    className,
    copiedClassName = 'bg-surface-container-highest',
    iconClassName = 'text-[18px]',
}: CopyLinkButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleClick = () => {
        navigator.clipboard?.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button className={`${className}${copied ? ` ${copiedClassName}` : ''}`} type="button" onClick={handleClick}>
            <Icon name={copied ? 'check' : icon} className={iconClassName} />
            <span>{copied ? copiedLabel : label}</span>
        </button>
    );
}
