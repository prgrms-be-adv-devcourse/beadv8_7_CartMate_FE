'use client';

import { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

// 상품 썸네일. BE가 준 이미지 주소가 열리지 않으면(로컬 BE는 업로드 파일을 제공하지 않음) 자리 표시 아이콘을 보여 준다.
export default function Thumb({ src, className }: { src: string | null | undefined; className: string }) {
    const [failed, setFailed] = useState(false);
    return (
        <div className={`relative shrink-0 bg-surface-container-high border border-outline-variant flex items-center justify-center overflow-hidden ${className}`}>
            {src && !failed ? (
                <Image src={src} alt="" fill unoptimized className="object-cover" onError={() => setFailed(true)} />
            ) : (
                <Icon name="image" className="text-outline text-[20px]" />
            )}
        </div>
    );
}
