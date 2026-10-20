'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

type ShareLinkPanelProps = { url: string; inviteCode: string };

// 초대 링크 입력창 + 링크·코드 복사 버튼 + 복사 완료 토스트
export default function ShareLinkPanel({ url, inviteCode }: ShareLinkPanelProps) {
    const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    // 토스트는 복사 결과가 나온 뒤에 띄우고, 연달아 누르면 이전 타이머를 지워 새 토스트가 일찍 사라지지 않게 한다.
    const show = (message: string, ok: boolean) => {
        if (timer.current) clearTimeout(timer.current);
        setToast({ message, ok });
        timer.current = setTimeout(() => setToast(null), 2500);
    };

    const copy = (text: string, done: string) => {
        const fail = () => {
            // 클립보드를 못 쓰면(비 HTTPS·권한 거부) 직접 복사할 수 있게 링크를 선택해 둔다.
            inputRef.current?.select();
            show('복사하지 못했습니다. 선택된 링크를 직접 복사해주세요.', false);
        };
        if (!navigator.clipboard) {
            fail();
            return;
        }
        navigator.clipboard.writeText(text).then(() => show(done, true), fail);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row items-stretch gap-space-sm mb-space-sm">
                <input
                    ref={inputRef}
                    className="flex-1 h-11 bg-surface-container-lowest text-primary font-mono text-body-sm px-space-md rounded focus:outline-none"
                    readOnly
                    aria-label="초대 링크"
                    type="text"
                    value={url}
                    onFocus={(e) => e.target.select()}
                />
                <button
                    className="h-11 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-[0.98]"
                    type="button"
                    onClick={() => copy(url, '초대 링크가 복사되었습니다.')}
                >
                    <Icon name="content_copy" className="text-[18px]" />
                    <span>링크 복사</span>
                </button>
                <button
                    className="h-11 px-space-md bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled
                    title="준비 중"
                >
                    <Icon name="chat" className="text-[20px]" />
                    <span>카카오톡 공유 (준비 중)</span>
                </button>
            </div>
            <div className="flex items-center gap-space-sm mb-space-md font-body-sm text-body-sm text-secondary">
                <span>초대 코드</span>
                <span className="font-mono font-bold text-primary tracking-wider">{inviteCode}</span>
                <button
                    className="h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm rounded flex items-center gap-1 hover:bg-surface-container"
                    type="button"
                    onClick={() => copy(inviteCode, '초대 코드가 복사되었습니다.')}
                >
                    <Icon name="content_copy" className="text-[14px]" />
                    코드 복사
                </button>
            </div>
            <div
                className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded shadow-xl transition-all duration-300 flex items-center gap-2 z-50 ${
                    toast ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
                }`}
                role="status"
            >
                <Icon name={toast?.ok === false ? 'error' : 'check_circle'} className="text-[18px]" />
                <span className="font-label-md text-label-md">{toast?.message}</span>
            </div>
        </>
    );
}
