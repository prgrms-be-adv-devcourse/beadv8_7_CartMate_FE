'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

type SignupValues = {
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
    phone: string;
    birth: string;
    terms: boolean[];
};

// 서버 공통 응답 형식. apiFetch가 data만 돌려준다면 아래 호출부의 res.data 를 res 로 바꿔 주세요.
type RsData<T> = {
    resultCode: string;
    msg: string;
    data: T;
};

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const TERMS = ['[필수] 서비스 이용약관', '[필수] 개인정보 수집 및 이용 동의', '[필수] 공동구매 예치금 거래 약관'];

// 서버 MemberPolicy 와 같은 규칙
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
const PHONE_REGEX = /^010-\d{4}-\d{4}$/;

const INPUT_CLASS =
    'h-[42px] px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-low transition-colors';
const SUB_BUTTON_CLASS =
    'h-[42px] px-4 bg-surface-container-high text-on-surface font-label-md text-label-md rounded-lg shadow-sm hover:bg-surface-dim transition-colors whitespace-nowrap active:scale-[0.98] disabled:opacity-60 disabled:cursor-default';

const CAPTION = 'font-caption text-caption';

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className={`${CAPTION} text-error`}>{message}</p>;
}

// 숫자만 남겨 010-1234-5678 형태로 맞춤
function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function errorMessage(e: unknown, fallback: string) {
    return e instanceof ApiError ? e.message : fallback;
}

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [emailCheck, setEmailCheck] = useState<CheckState>('idle');
    const [nicknameCheck, setNicknameCheck] = useState<CheckState>('idle');
    const [codeSent, setCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [code, setCode] = useState('');
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<SignupValues>({
        defaultValues: { terms: TERMS.map(() => false) },
    });

    const password = useWatch({ control, name: 'password' });
    const passwordConfirm = useWatch({ control, name: 'passwordConfirm' });
    const terms = useWatch({ control, name: 'terms' });
    const allAgreed = (terms ?? []).every(Boolean);

    // 이메일 중복확인
    const handleCheckEmail = async () => {
        const email = getValues('email')?.trim() ?? '';
        if (!EMAIL_REGEX.test(email)) {
            setEmailCheck('invalid');
            return;
        }
        setEmailCheck('checking');
        try {
            const res = (await apiFetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)) as RsData<{ available: boolean }>;
            setEmailCheck(res.data.available ? 'available' : 'taken');
        } catch (e) {
            setEmailCheck('idle');
            alert(errorMessage(e, '이메일 확인 중 오류가 발생했습니다.'));
        }
    };

    // 닉네임 중복확인
    const handleCheckNickname = async () => {
        const nickname = getValues('nickname')?.trim() ?? '';
        if (!NICKNAME_REGEX.test(nickname)) {
            setNicknameCheck('invalid');
            return;
        }
        setNicknameCheck('checking');
        try {
            const res = (await apiFetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`)) as RsData<{ available: boolean }>;
            setNicknameCheck(res.data.available ? 'available' : 'taken');
        } catch (e) {
            setNicknameCheck('idle');
            alert(errorMessage(e, '닉네임 확인 중 오류가 발생했습니다.'));
        }
    };

    // 인증번호 발송 (개발 중에는 서버 로그에서 번호 확인)
    const handleSendCode = async () => {
        const phone = getValues('phone')?.trim() ?? '';
        if (!PHONE_REGEX.test(phone)) {
            alert('휴대폰 번호를 010-0000-0000 형식으로 입력해주세요.');
            return;
        }
        setSendingCode(true);
        try {
            await apiFetch('/api/auth/phone/send', {
                method: 'POST',
                body: JSON.stringify({ phone }),
            });
            setCodeSent(true);
            setPhoneVerified(false);
            setCode('');
            alert('인증번호가 발송되었습니다.');
        } catch (e) {
            alert(errorMessage(e, '인증번호 발송에 실패했습니다.'));
        } finally {
            setSendingCode(false);
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        setVerifyingCode(true);
        try {
            await apiFetch('/api/auth/phone/verify', {
                method: 'POST',
                body: JSON.stringify({ phone: getValues('phone').trim(), code }),
            });
            setPhoneVerified(true);
        } catch (e) {
            alert(errorMessage(e, '인증에 실패했습니다.'));
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleAgreeAll = (checked: boolean) => {
        TERMS.forEach((_, i) => setValue(`terms.${i}`, checked, { shouldValidate: true }));
    };

    const onSubmit = async (values: SignupValues) => {
        setSubmitError(null);

        if (emailCheck !== 'available') {
            setSubmitError('이메일 중복확인을 해주세요.');
            return;
        }
        if (nicknameCheck !== 'available') {
            setSubmitError('닉네임 중복확인을 해주세요.');
            return;
        }
        if (!phoneVerified) {
            setSubmitError('휴대폰 인증을 완료해주세요.');
            return;
        }

        const b = values.birth; // "19950524"

        try {
            await apiFetch('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({
                    email: values.email.trim(),
                    password: values.password,
                    nickname: values.nickname.trim(),
                    phone: values.phone.trim(),
                    birthDate: `${b.slice(0, 4)}-${b.slice(4, 6)}-${b.slice(6, 8)}`, // "1995-05-24"
                }),
            });
            alert('회원가입이 완료되었습니다.');
            router.push(ROUTES.login);
        } catch (e) {
            setSubmitError(errorMessage(e, '알 수 없는 오류가 발생했습니다.'));
        }
    };

    const emailStatus = {
        idle: { text: '아이디로 사용됩니다', className: `${CAPTION} text-on-surface-variant` },
        checking: { text: '확인 중...', className: `${CAPTION} text-on-surface-variant` },
        available: { text: '사용 가능한 이메일입니다', className: `${CAPTION} text-on-surface font-semibold` },
        taken: { text: '이미 사용 중인 이메일입니다', className: `${CAPTION} text-error` },
        invalid: { text: '이메일 형식을 확인해주세요', className: `${CAPTION} text-error` },
    }[emailCheck];

    const nicknameStatus = {
        idle: null,
        checking: { text: '확인 중...', className: `${CAPTION} text-on-surface-variant` },
        available: { text: '사용 가능한 닉네임입니다', className: `${CAPTION} text-on-surface font-semibold` },
        taken: { text: '이미 사용 중인 닉네임입니다', className: `${CAPTION} text-error` },
        invalid: { text: '닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다', className: `${CAPTION} text-error` },
    }[nicknameCheck];

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* 이메일 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="reg-email">
                    <span>
                        이메일 <span className="text-error">*</span>
                    </span>
                    <span className={emailStatus.className}>{emailStatus.text}</span>
                </label>
                <div className="flex gap-2">
                    <input
                        className={`flex-1 ${INPUT_CLASS}`}
                        id="reg-email"
                        placeholder="example@sportsgroup.co.kr"
                        type="email"
                        autoComplete="email"
                        {...register('email', {
                            required: '이메일을 입력해주세요.',
                            pattern: { value: EMAIL_REGEX, message: '이메일 형식이 올바르지 않습니다.' },
                            onChange: () => setEmailCheck('idle'),
                        })}
                    />
                    <button
                        className={SUB_BUTTON_CLASS}
                        type="button"
                        onClick={handleCheckEmail}
                        disabled={emailCheck === 'checking' || emailCheck === 'available'}
                    >
                        {emailCheck === 'available' ? '확인완료' : '중복확인'}
                    </button>
                </div>
                <FieldError message={errors.email?.message} />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-password">
                    비밀번호 <span className="text-error">*</span>
                </label>
                <div className="relative">
                    <input
                        className={`w-full pr-10 ${INPUT_CLASS}`}
                        id="reg-password"
                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        {...register('password', {
                            required: '비밀번호를 입력해주세요.',
                            pattern: {
                                value: PASSWORD_REGEX,
                                message: '비밀번호는 8~20자, 영문·숫자·특수문자를 모두 포함해야 합니다.',
                            },
                        })}
                    />
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        type="button"
                        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                    </button>
                </div>
                <p className={`${CAPTION} text-on-surface-variant`}>8~20자, 영문·숫자·특수문자(!@#$%^&amp;* 등)를 모두 포함해 주세요.</p>
                <FieldError message={errors.password?.message} />
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-password-confirm">
                    비밀번호 확인 <span className="text-error">*</span>
                </label>
                <input
                    className={`w-full ${INPUT_CLASS}`}
                    id="reg-password-confirm"
                    placeholder="비밀번호를 다시 입력해주세요"
                    type="password"
                    autoComplete="new-password"
                    {...register('passwordConfirm', {
                        required: '비밀번호 확인을 입력해주세요.',
                        validate: (value) => value === getValues('password') || '비밀번호가 일치하지 않습니다.',
                    })}
                />
                <div className="flex items-center gap-1.5 pt-0.5">
                    {!passwordConfirm ? (
                        <>
                            <Icon name="help_outline" className="text-[15px] text-outline" />
                            <span className={`${CAPTION} text-on-surface-variant`}>비밀번호 일치 여부를 검사합니다.</span>
                        </>
                    ) : password === passwordConfirm ? (
                        <>
                            <Icon name="check_circle" className="text-[15px] text-on-surface" />
                            <span className={`${CAPTION} text-on-surface font-semibold`}>비밀번호가 일치합니다.</span>
                        </>
                    ) : (
                        <>
                            <Icon name="cancel" className="text-[15px] text-error" />
                            <span className={`${CAPTION} text-error font-semibold`}>비밀번호가 일치하지 않습니다.</span>
                        </>
                    )}
                </div>
                {!passwordConfirm && <FieldError message={errors.passwordConfirm?.message} />}
            </div>

            {/* 닉네임 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="reg-nickname">
                    <span>
                        닉네임 (팀 내 표시 이름) <span className="text-error">*</span>
                    </span>
                    <span className={`${CAPTION} text-secondary`}>마킹용 실명 추천</span>
                </label>
                <div className="flex gap-2">
                    <input
                        className={`flex-1 ${INPUT_CLASS}`}
                        id="reg-nickname"
                        placeholder="유니폼 마킹에 사용할 이름 또는 닉네임"
                        type="text"
                        autoComplete="nickname"
                        {...register('nickname', {
                            required: '닉네임을 입력해주세요.',
                            pattern: { value: NICKNAME_REGEX, message: '닉네임은 2~10자의 한글, 영문, 숫자만 가능합니다.' },
                            onChange: () => setNicknameCheck('idle'),
                        })}
                    />
                    <button
                        className={SUB_BUTTON_CLASS}
                        type="button"
                        onClick={handleCheckNickname}
                        disabled={nicknameCheck === 'checking' || nicknameCheck === 'available'}
                    >
                        {nicknameCheck === 'available' ? '확인완료' : '중복확인'}
                    </button>
                </div>
                {nicknameStatus ? (
                    <p className={nicknameStatus.className}>{nicknameStatus.text}</p>
                ) : (
                    <p className={`${CAPTION} text-on-surface-variant`}>선수단 오더 시트와 로스터 명단에 기본 적용됩니다.</p>
                )}
                <FieldError message={errors.nickname?.message} />
            </div>

            {/* 휴대폰 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-phone">
                    휴대폰 번호 <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                    <input
                        className={`flex-1 ${INPUT_CLASS}`}
                        id="reg-phone"
                        placeholder="010-0000-0000"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        {...register('phone', {
                            required: '휴대폰 번호를 입력해주세요.',
                            pattern: { value: PHONE_REGEX, message: '휴대폰 번호는 010-0000-0000 형식이어야 합니다.' },
                            onChange: (e) => {
                                setValue('phone', formatPhone(e.target.value));
                                setCodeSent(false);
                                setPhoneVerified(false);
                                setCode('');
                            },
                        })}
                    />
                    <button
                        className={SUB_BUTTON_CLASS}
                        type="button"
                        onClick={handleSendCode}
                        disabled={sendingCode || phoneVerified}
                    >
                        {phoneVerified ? '인증완료' : codeSent ? '재발송' : '인증번호 발송'}
                    </button>
                </div>

                {codeSent && !phoneVerified && (
                    <div className="flex gap-2">
                        <input
                            className={`flex-1 ${INPUT_CLASS}`}
                            placeholder="인증번호 6자리"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                            className={SUB_BUTTON_CLASS}
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={code.length !== 6 || verifyingCode}
                        >
                            확인
                        </button>
                    </div>
                )}

                {phoneVerified && <p className={`${CAPTION} text-on-surface font-semibold`}>휴대폰 인증이 완료되었습니다.</p>}
                <FieldError message={errors.phone?.message} />
            </div>

            {/* 생년월일 */}
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-birth">
                    생년월일 (8자리) <span className="text-error">*</span>
                </label>
                <input
                    className={`w-full ${INPUT_CLASS}`}
                    id="reg-birth"
                    maxLength={8}
                    inputMode="numeric"
                    placeholder="YYYYMMDD (예: 19950524)"
                    type="text"
                    {...register('birth', {
                        required: '생년월일을 입력해주세요.',
                        pattern: { value: /^\d{8}$/, message: '생년월일 8자리를 입력해주세요.' },
                    })}
                />
                <FieldError message={errors.birth?.message} />
            </div>

            {/* 약관 */}
            <div className="mt-2 p-4 bg-surface-container rounded-xl flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-black"
                        id="agree-all"
                        type="checkbox"
                        checked={allAgreed}
                        onChange={(e) => handleAgreeAll(e.target.checked)}
                    />
                    <span className="font-label-md text-label-md text-on-surface">모든 약관에 전체 동의합니다</span>
                </label>
                <div className="flex flex-col gap-2 pt-2 bg-surface-container-lowest p-3 rounded-lg shadow-sm">
                    {TERMS.map((term, i) => (
                        <div key={term} className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    className="w-3.5 h-3.5 rounded text-primary focus:ring-0 cursor-pointer accent-black"
                                    type="checkbox"
                                    {...register(`terms.${i}`, { validate: (v) => v || '필수 약관에 동의해주세요.' })}
                                />
                                <span className="font-body-sm text-body-sm text-on-surface">{term}</span>
                            </label>
                            <button className={`${CAPTION} text-on-surface-variant hover:text-on-surface underline`} type="button">
                                전문보기
                            </button>
                        </div>
                    ))}
                </div>
                {errors.terms && <FieldError message="필수 약관에 모두 동의해주세요." />}
            </div>

            <FieldError message={submitError ?? undefined} />
            <button
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
            >
                <span>{isSubmitting ? '가입 처리 중...' : '회원가입 완료'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
            </button>
        </form>
    );
}