import type { ReactNode } from 'react';

type WireframeImageProps = {
    className?: string;
    children?: ReactNode;
};

// 대각선 X 표시가 들어간 와이어프레임 이미지 placeholder
export default function WireframeImage({ className = 'bg-surface-container-low', children }: WireframeImageProps) {
    return (
        <div className={`relative w-full aspect-square border border-outline-variant flex items-center justify-center overflow-hidden ${className}`}>
            <svg className="absolute inset-0 w-full h-full stroke-outline-variant" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line strokeWidth="0.75" x1="0" x2="100" y1="0" y2="100" />
                <line strokeWidth="0.75" x1="100" x2="0" y1="0" y2="100" />
            </svg>
            {children}
        </div>
    );
}
