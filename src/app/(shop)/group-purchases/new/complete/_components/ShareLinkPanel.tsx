'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import Icon from '@/components/ui/Icon';

type ShareLinkPanelProps = { url: string; inviteCode: string };

// 초대 링크·코드 복사 버튼 + 복사 완료 토스트.
// 링크 원문은 사용자가 읽을 일이 없어서 보여 주지 않고, 복사가 안 될 때만 직접 복사할 수 있게 펼쳐 준다.
export default function ShareLinkPanel({ url, inviteCode }: ShareLinkPanelProps) {
    const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
    const [fallback, setFallback] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            // 클립보드를 못 쓰면(비 HTTPS·권한 거부) 원문을 펼쳐서 직접 복사하게 한다.
            setFallback(text);
            show('복사하지 못했습니다. 아래 내용을 직접 복사해주세요.', false);
        };
        if (!navigator.clipboard) {
            fail();
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            setFallback(null);
            show(done, true);
        }, fail);
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-space-sm">
                <Button
                    variant="primary"
                    size="lg"
                    type="button"
                    onClick={() => copy(url, '초대 링크가 복사되었습니다.')}
                    icon={<Icon name="link" />}
                    label="초대 링크 복사"
                />
                <Button
                    variant="secondary"
                    size="lg"
                    type="button"
                    onClick={() => copy(inviteCode, '초대 코드가 복사되었습니다.')}
                    icon={<Icon name="content_copy" />}
                    label={`초대 코드 복사 · ${inviteCode}`}
                />
                {/* 카카오톡 공유는 BE·SDK 준비 전이라 비활성으로만 보여 준다 */}
                <Button variant="secondary" size="lg" type="button" isDisabled icon={<Icon name="chat" />} label="카카오톡 공유 (준비 중)" />
            </div>
            {fallback && (
                <input
                    className="mt-space-sm w-full h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-space-md font-mono text-body-sm text-on-surface focus:outline-none focus:border-primary"
                    readOnly
                    aria-label="복사할 내용"
                    value={fallback}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                />
            )}
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
