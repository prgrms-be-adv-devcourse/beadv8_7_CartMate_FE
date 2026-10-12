'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

const SHARE_URL = 'https://teambuy.internal/group/join?code=ACE-2024-9982';

// 초대 링크 입력창 + 복사/카카오톡 공유 버튼 + 복사 완료 토스트
export default function ShareLinkPanel() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard
            ?.writeText(SHARE_URL)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            })
            .catch(() => alert(`링크 복사에 실패했습니다. 수동으로 복사해주세요: ${SHARE_URL}`));
    };

    const handleKakaoShare = () => {
        alert(`[와이어프레임 알림]\n카카오톡 공유 API가 실행됩니다.\n\n공유 링크: ${SHARE_URL}`);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row items-stretch gap-space-sm mb-space-md">
                <div className="relative flex-1">
                    <input
                        className="w-full h-11 bg-surface-container-lowest text-primary font-mono text-body-sm px-space-md rounded focus:outline-none select-all"
                        readOnly
                        type="text"
                        value={SHARE_URL}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
                <button
                    className="h-11 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-[0.98]"
                    type="button"
                    onClick={handleCopy}
                >
                    <Icon name="content_copy" className="text-[18px]" />
                    <span>{copied ? '복사됨!' : '링크 복사'}</span>
                </button>
                <button
                    className="h-11 px-space-md bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-2 transition hover:bg-surface-container shadow-sm active:scale-[0.98]"
                    type="button"
                    onClick={handleKakaoShare}
                >
                    <Icon name="chat" className="text-[20px]" />
                    <span>카카오톡 공유</span>
                </button>
            </div>
            {/* Notification Toast Popup */}
            <div
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded shadow-xl transition-all duration-300 flex items-center gap-2 z-50 ${
                    copied ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
                }`}
            >
                <Icon name="check_circle" className="text-[18px]" />
                <span className="font-label-md text-label-md">초대 링크가 클립보드에 복사되었습니다!</span>
            </div>
        </>
    );
}
