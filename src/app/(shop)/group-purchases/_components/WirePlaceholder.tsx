import type { ReactNode } from 'react';

type WirePlaceholderProps = {
    className?: string;
    children?: ReactNode;
};

// 와이어프레임용 X 표시 이미지 placeholder 박스
export default function WirePlaceholder({ className = '', children }: WirePlaceholderProps) {
    return (
        <div className={`relative bg-surface-container border border-outline-variant flex items-center justify-center overflow-hidden ${className}`}>
            <svg className="absolute inset-0 w-full h-full text-outline-variant" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line stroke="currentColor" strokeWidth="1" x1="0" x2="100" y1="0" y2="100" />
                <line stroke="currentColor" strokeWidth="1" x1="100" x2="0" y1="0" y2="100" />
            </svg>
            {children}
        </div>
    );
}
