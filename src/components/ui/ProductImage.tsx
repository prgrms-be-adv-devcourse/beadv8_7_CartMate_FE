'use client';

import { useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';

type Props = {
    src: string | null | undefined;
    alt: string;
    className: string;
    iconClassName?: string;
};

export default function ProductImage({ src, alt, className, iconClassName = 'text-[32px]' }: Props) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    if (!src || failedSrc === src) {
        return <Icon name="image" className={`text-outline ${iconClassName}`} />;
    }

    return <Image src={src} alt={alt} fill unoptimized className={className} onError={() => setFailedSrc(src)} />;
}
