'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@astryxdesign/core/Button';
import { useLoginWithMfa, useResendLoginMfa, useVerifyLoginMfa, type LoginResponse, type MfaChallenge } from '@/api/loginMfa';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { SKIP_AUTH_EXPIRED, reloadTo } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { loginSchema, type LoginValues } from '../../_lib/authSchemas';

const INPUT_CLASS =
    'w-full h-11 px-3 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-primary transition-colors';

// 로그인 후 돌아갈 경로. 외부 주소로 튀지 않도록 사이트 내부 경로만 허용한다.
function nextPath(): string {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next?.startsWith('/')) return ROUTES.home;
    try {
        // `//evil.com`, `/\evil.com`, `/.//evil.com` 같은 우회를 브라우저와 같은 규칙으로 해석한다.
        const url = new URL(next, window.location.origin);
        // 같은 출처의 절대 URL을 유지해야 reloadTo에서 `//host`로 재해석되는 2차 우회를 막을 수 있다.
        return url.origin === window.location.origin ? url.href : ROUTES.home;
    } catch {
        return ROUTES.home;
    }
}

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    // 비밀번호는 맞았고 이메일 인증번호를 기다리는 중이면 채워진다 (이때는 아직 로그인 토큰이 없다)
    const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
    const login = useLoginWithMfa(SKIP_AUTH_EXPIRED);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: true },
    });

    const onSubmit = (values: LoginValues) => {
        login.mutate(values, {
            onSuccess: (res) => {
                if (res.data?.mfaRequired && res.data.mfa) {
                    setChallenge(res.data.mfa);
                    return;
                }
                afterLogin(res.data);
            },
        });
    };

    if (challenge) {
        return <MfaStep challenge={challenge} onBack={() => setChallenge(null)} />;
    }

    return (
        <form className="flex flex-col gap-4.5" method="post" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Input Field */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface font-semibold flex items-center justify-between" htmlFor="user-email">
                    <span>이메일 주소</span>
                    <span className="text-caption font-caption text-outline">아이디 / 계정</span>
                </label>
                <div className="relative flex items-center">
                    <input
                        className={INPUT_CLASS}
                        id="user-email"
                        placeholder="example@email.com"
                        type="email"
                        {...register('email')}
                    />
                </div>
                {errors.email && <p className="font-caption text-caption text-error">{errors.email.message}</p>}
            </div>
            {/* Password Input Field */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="font-body-sm text-body-sm text-on-surface font-semibold" htmlFor="user-password">
                        비밀번호
                    </label>
                    <span className="font-caption text-caption text-outline">영문·숫자·특수문자 조합</span>
                </div>
                <div className="relative flex items-center">
                    <input
                        className={`${INPUT_CLASS} pr-10`}
                        id="user-password"
                        placeholder="비밀번호를 입력하세요"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                    />
                    <button
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        aria-pressed={showPassword}
                        className="absolute right-3 text-outline hover:text-on-surface flex items-center justify-center"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                    </button>
                </div>
                {errors.password && <p className="font-caption text-caption text-error">{errors.password.message}</p>}
            </div>
            {/* Persistent Login Checkbox */}
            <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer accent-on-surface"
                        type="checkbox"
                        {...register('remember')}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">로그인 상태 유지</span>
                </label>
            </div>
            {login.isError && (
                <p className="font-caption text-caption text-error" role="alert">
                    {errorMessage(login.error, '로그인에 실패했습니다.')}
                </p>
            )}
            <Button
                label={login.isPending ? '로그인 중...' : '로그인'}
                variant="primary"
                size="lg"
                width="100%"
                type="submit"
                isLoading={login.isPending}
                isDisabled={login.isPending}
                endContent={<Icon name="arrow_forward" className="text-[16px]" />}
            />
        </form>
    );
}

// 로그인 완료 후 이동: OTP 미등록 관리자는 OTP 등록 화면, 백업 코드로 들어왔으면 남은 개수 안내
function afterLogin(data: LoginResponse | null | undefined) {
    if (data?.otpEnrollmentRequired) {
        reloadTo(ROUTES.otpSetup);
        return;
    }
    if (data?.remainingBackupCodes != null) {
        window.alert(
            `백업 코드로 로그인했습니다. 남은 백업 코드 ${data.remainingBackupCodes}개.\n` +
                '휴대폰을 잃어버렸다면 운영 책임자에게 OTP 재등록을 요청해 주세요.',
        );
    }
    reloadTo(nextPath());
}

const OTP_INPUT = /^(\d{6}|[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}-?[A-Za-z0-9]{4})$/;

// 로그인 2차 인증: 메일로 받은 6자리 + "이 기기 30일 기억"
function MfaStep({ challenge, onBack }: { challenge: MfaChallenge; onBack: () => void }) {
    const [code, setCode] = useState('');
    const [trustDevice, setTrustDevice] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    const verify = useVerifyLoginMfa(SKIP_AUTH_EXPIRED);
    const resend = useResendLoginMfa();

    const isOtp = challenge.method === 'OTP';
    const valid = isOtp ? OTP_INPUT.test(code.trim()) : /^\d{6}$/.test(code.trim());

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid) return;
        setNotice(null);
        verify.mutate(
            { challengeId: challenge.challengeId, code: code.trim(), trustDevice: isOtp ? false : trustDevice },
            { onSuccess: (res) => afterLogin(res.data) },
        );
    };

    const handleResend = () => {
        setNotice(null);
        resend.mutate(challenge.challengeId, {
            onSuccess: () => {
                setCode('');
                setNotice('인증번호를 다시 보냈습니다. 이전 번호는 더 이상 쓸 수 없습니다.');
            },
        });
    };

    const error = verify.isError ? errorMessage(verify.error) : resend.isError ? errorMessage(resend.error) : null;
    // 시간이 지났거나 시도를 다 쓴 경우: 처음(비밀번호)부터 다시
    const mustRestart = verify.isError && /다시 로그인/.test(errorMessage(verify.error));

    return (
        <form className="flex flex-col gap-4.5" method="post" onSubmit={submit} noValidate>
            <div className="flex flex-col gap-1">
               <p className="font-body-md text-body-md text-on-surface font-semibold">{isOtp ? 'OTP 인증' : '이메일 인증'}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {isOtp
                        ? 'OTP 앱의 6자리 코드를 입력해 주세요. 휴대폰을 잃어버렸다면 백업 코드를 입력하세요.'
                        : `${challenge.maskedEmail}(으)로 보낸 인증번호 6자리를 입력해 주세요.`}
                </p>
            </div>
            <div className="flex flex-col gap-1.5">
                <input
                    className={INPUT_CLASS}
                    id="mfa-code"
                    inputMode={isOtp ? 'text' : 'numeric'}
                    autoComplete="one-time-code"
                    maxLength={isOtp ? 14 : 6}
                    placeholder={isOtp ? 'OTP 6자리 또는 백업 코드' : '인증번호 6자리'}
                    aria-label="로그인 인증번호"
                    value={code}
                    onChange={(e) =>
                        setCode(isOtp ? e.target.value.replace(/[^A-Za-z0-9-]/g, '') : e.target.value.replace(/\D/g, ''))
                    }
                    autoFocus
                />
                <p className="font-caption text-caption text-outline">
                    {isOtp
                        ? `${Math.round(challenge.expiresInSeconds / 60)}분 안에 입력해 주세요. 앱의 코드는 30초마다 바뀝니다.`
                        : `${Math.round(challenge.expiresInSeconds / 60)}분 안에 입력해 주세요. 메일이 오지 않으면 스팸함을 확인하거나 1분 뒤 재발송해 주세요.`}
                </p>
            </div>
            {!isOtp && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer accent-on-surface"
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                />
                <span className="font-body-sm text-body-sm text-on-surface-variant">이 기기 30일 동안 기억하기</span>
                </label>
                )}
            {!isOtp && (
                <p className="font-caption text-caption text-outline -mt-3">PC방 등 여러 사람이 쓰는 기기에서는 체크하지 마세요.</p>
            )}
            {notice && <p className="font-caption text-caption text-on-surface">{notice}</p>}
            {error && (
                <p className="font-caption text-caption text-error" role="alert">
                    {error}
                </p>
            )}
            {mustRestart ? (
                <Button
                    label="다시 로그인"
                    variant="primary"
                    size="lg"
                    width="100%"
                    type="button"
                    onClick={onBack}
                />
            ) : (
                <Button
                    label={verify.isPending ? '확인 중...' : '인증하고 로그인'}
                    variant="primary"
                    size="lg"
                    width="100%"
                    type="submit"
                    isDisabled={verify.isPending || !valid}
                    isLoading={verify.isPending}
                    endContent={<Icon name="arrow_forward" className="text-[16px]" />}
                />
            )}
            <div className="flex items-center justify-between">
                {isOtp ? (
                    <span />
                ) : (
                    <button
                        className="font-label-sm text-label-sm text-outline hover:text-on-surface hover:underline"
                        type="button"
                        onClick={handleResend}
                        disabled={resend.isPending}
                    >
                        {resend.isPending ? '보내는 중...' : '인증번호 재발송'}
                    </button>
                )}
                <button className="font-label-sm text-label-sm text-outline hover:text-on-surface hover:underline" type="button" onClick={onBack}>
                    다른 계정으로 로그인
                </button>
            </div>
        </form>
    );
}
