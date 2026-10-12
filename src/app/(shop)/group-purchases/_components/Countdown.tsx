'use client';

import { useEffect, useState } from 'react';

type CountdownProps = {
    hours: number;
    minutes: number;
    seconds: number;
    className?: string;
    // colon: 43:16:41 / korean: 43시간 16분 41초
    format?: 'colon' | 'korean';
};

const pad = (n: number) => String(n).padStart(2, '0');

// 1초마다 감소하는 HH:MM:SS 카운트다운 (와이어프레임 시각 효과용)
export default function Countdown({ hours, minutes, seconds, className, format = 'colon' }: CountdownProps) {
    const [left, setLeft] = useState(hours * 3600 + minutes * 60 + seconds);

    useEffect(() => {
        const timer = setInterval(() => setLeft((prev) => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    const h = Math.floor(left / 3600);
    const m = Math.floor((left % 3600) / 60);
    const s = left % 60;

    const text = format === 'korean' ? `${h}시간 ${m}분 ${pad(s)}초` : `${pad(h)}:${pad(m)}:${pad(s)}`;

    return <span className={className}>{text}</span>;
}
