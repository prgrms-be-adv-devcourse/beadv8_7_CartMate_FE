'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { errorMessage } from '@/api/http';
import { startOtpEnrollment, useConfirmOtpEnrollment, type OtpEnrollment } from '@/api/loginMfa';
import { reloadTo } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

const INPUT_CLASS =
    'w-full h-[44px] px-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none';
const PRIMARY_BUTTON =
    'w-full h-[44px] bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 disabled:opacity-60';

type Loaded = { enrollment: OtpEnrollment; qr: string };
type StartState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; data: Loaded };

// 관리자 OTP 등록: QR 스캔 → 첫 코드 확인 → 백업 코드 10개(이 화면에서 한 번만)
export default function OtpSetup() {
    const [start, setStart] = useState<StartState>({ status: 'loading' });
    const [attempt, setAttempt] = useState(0); // "다시 시도"를 누르면 올라가서 등록 시작을 다시 부른다
    const confirm = useConfirmOtpEnrollment();
    const [code, setCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [saved, setSaved] = useState(false);

    // 등록 시작. 개발 모드(StrictMode)에선 두 번 실행되지만 괜찮다:
    // 서버는 등록 중이면 같은 비밀키를 돌려주고(멱등), 여기선 정리된(버려진) 실행의 결과를 무시한다.
    useEffect(() => {
        let ignore = false;
        (async () => {
            try {
                const res = await startOtpEnrollment();
                if (!res.data) throw new Error('등록 정보를 받지 못했습니다.');
                const qr = await QRCode.toDataURL(res.data.otpauthUri, { margin: 1, width: 200 });
                if (!ignore) setStart({ status: 'ready', data: { enrollment: res.data, qr } });
            } catch (error) {
                if (!ignore) setStart({ status: 'error', message: errorMessage(error) });
            }
        })();
        return () => {
            ignore = true;
        };
    }, [attempt]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(code)) return;
        confirm.mutate(code, { onSuccess: (res) => setBackupCodes(res.data?.backupCodes ?? []) });
    };

    if (backupCodes) {
        return (
            <div className="flex flex-col gap-4">
                <p className="font-body-md text-body-md text-on-surface font-semibold">백업 코드</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    휴대폰을 잃어버렸을 때 OTP 대신 쓸 수 있는 코드입니다. 각 코드는 한 번만 쓸 수 있고,
                    <b> 이 화면을 닫으면 다시 볼 수 없습니다.</b> 안전한 곳에 보관해 주세요.
                </p>
                <ul className="grid grid-cols-2 gap-2 font-mono text-body-md bg-surface-container p-4 rounded-lg">
                    {backupCodes.map((c) => (
                        <li key={c}>{c}</li>
                    ))}
                </ul>
                <button
                    className="h-[40px] border border-outline-variant rounded-lg font-label-md text-label-md"
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(backupCodes.join('\n'))}
                >
                    백업 코드 복사
                </button>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">백업 코드를 안전한 곳에 보관했습니다</span>
                </label>
                <button className={PRIMARY_BUTTON} type="button" disabled={!saved} onClick={() => reloadTo(ROUTES.admin)}>
                    관리자 페이지로
                </button>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <div className="flex flex-col gap-1">
                <p className="font-body-md text-body-md text-on-surface font-semibold">관리자 OTP 등록</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    관리자 계정은 OTP가 필요합니다. Google Authenticator 같은 OTP 앱으로 QR 코드를 스캔한 뒤, 앱에 나온 6자리를 입력해 주세요.
                </p>
            </div>

            {start.status === 'loading' && (
                <p className="font-body-sm text-body-sm text-on-surface-variant">QR 코드를 준비하는 중...</p>
            )}

            {start.status === 'error' && (
                <div className="flex flex-col gap-3">
                    <p className="font-caption text-caption text-error" role="alert">
                        {start.message}
                    </p>
                    <button
                        className={PRIMARY_BUTTON}
                        type="button"
                        onClick={() => {
                            setStart({ status: 'loading' }); // 버튼을 누른 순간 로딩으로 (effect 안에서 바꾸지 않는다)
                            setAttempt((n) => n + 1);
                        }}
                    >
                        다시 시도
                    </button>
                </div>
            )}

            {start.status === 'ready' && (
                <>
                    <div className="flex flex-col items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={start.data.qr} alt="OTP 등록 QR 코드" width={200} height={200} />
                        <p className="font-caption text-caption text-outline">QR을 스캔할 수 없으면 앱에 직접 입력하세요</p>
                        <code className="font-mono text-body-sm break-all bg-surface-container px-2 py-1 rounded">
                            {start.data.enrollment.secret}
                        </code>
                    </div>
                    <input
                        className={INPUT_CLASS}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="OTP 앱의 6자리"
                        aria-label="OTP 코드"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    />
                    {confirm.isError && (
                        <p className="font-caption text-caption text-error" role="alert">
                            {errorMessage(confirm.error)}
                        </p>
                    )}
                    <button className={PRIMARY_BUTTON} type="submit" disabled={confirm.isPending || code.length !== 6}>
                        {confirm.isPending ? '확인 중...' : 'OTP 등록'}
                    </button>
                </>
            )}
        </form>
    );
}