'use client';

import { useEffect, useState } from 'react';

// 남은 시간 표시와 기한 지남 판단에 쓰는 현재 시각. 30초마다 갱신한다.
export function useNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(timer);
    }, []);
    return now;
}
