'use client';

import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';

// 로그인 중 토큰이 만료되어 넘어온 경우(?expired=1) 안내한다.
export default function SessionExpiredNotice() {
    const searchParams = useSearchParams();
    if (searchParams.get('expired') !== '1') return null;

    return (
        <div className="bg-surface-container-low border border-outline-variant/60 rounded p-3 flex items-center gap-2" role="status">
            <Icon name="schedule" className="text-outline text-[18px] shrink-0" />
            <p className="font-body-sm text-body-sm text-on-surface">로그인 시간이 만료되었습니다. 다시 로그인해 주세요.</p>
        </div>
    );
}
