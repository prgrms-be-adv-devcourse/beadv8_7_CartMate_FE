'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
    checkEmail,
    checkNickname,
    useSendPhoneCode,
    useSignup,
    useVerifyPhoneCode,
} from '@/api/generated/auth-controller/auth-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { signupFields, signupSchema, type SignupInput, type SignupOutput } from '../../_lib/authSchemas';

const TERMS = ['[필수] 서비스 이용약관', '[필수] 개인정보 수집 및 이용 동의', '[필수] 공동구매 예치금 거래 약관'];

const DEFAULT_VALUES: SignupInput = {
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    phone: '',
    code: '',
    birth: '',
    terms: TERMS.map(() => false),
    verifiedEmail: '',
    verifiedNickname: '',
    verifiedPhone: '',
};

const INPUT_CLASS =
    'h-[42px] px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-low transition-colors';
const SUB_BUTTON_CLASS =
    'h-[42px] px-4 bg-surface-container-high text-on-surface font-label-md text-label-md rounded-lg shadow-sm hover:bg-surface-dim transition-colors whitespace-nowrap active:scale-[0.98]';

// 01012345678 → 010-1234-5678
function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="font-caption text-caption text-error">{message}</p>;
}

export default function SignupForm() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        setError,
        clearErrors,
        trigger,
        formState: { errors },
    } = useForm<SignupInput, unknown, SignupOutput>({
        resolver: zodResolver(signupSchema),
        defaultValues: DEFAULT_VALUES,
    });

    const emailCheck = useMutation({ mutationFn: (email: string) => checkEmail({ email }) });
    const nicknameCheck = useMutation({ mutationFn: (nickname: string) => checkNickname({ nickname }) });
    const sendCode = useSendPhoneCode();
    const verifyCode = useVerifyPhoneCode();
    const signup = useSignup();

    const [email, nickname, phone, password, passwordConfirm, terms, verifiedEmail, verifiedNickname, verifiedPhone] =
        useWatch({
            control,
            name: ['email', 'nickname', 'phone', 'password', 'passwordConfirm', 'terms', 'verifiedEmail', 'verifiedNickname', 'verifiedPhone'],
        });

    const emailVerified = verifiedEmail !== '' && verifiedEmail === email.trim();
    const nicknameVerified = verifiedNickname !== '' && verifiedNickname === nickname.trim();
    const phoneVerified = verifiedPhone !== '' && verifiedPhone === phone;
    const codeSent = sendCode.isSuccess && sendCode.variables.data.phone === phone;
    const allAgreed = terms.every(Boolean);

    // 버튼으로 필드 하나만 검사할 때 쓴다. 통과하면 정리된(trim) 값을 돌려준다.
    const parseField = (name: 'email' | 'nickname' | 'phone'): string | null => {
        const result = signupFields[name].safeParse(getValues(name));
        if (!result.success) {
            setError(name, { message: result.error.issues[0].message });
            return null;
        }
        return result.data;
    };

    const handleCheck = (
        name: 'email' | 'nickname',
        mutation: typeof emailCheck,
        verifiedName: 'verifiedEmail' | 'verifiedNickname',
        duplicateMessage: string,
    ) => {
        const value = parseField(name);
        if (value === null) return;
        // 응답이 오기 전에 입력을 바꿨다면 지난 값에 대한 결과이므로 화면에 반영하지 않는다.
        const isStale = () => getValues(name).trim() !== value;
        mutation.mutate(value, {
            onSuccess: (res) => {
                if (isStale()) return;
                if (res.data?.available === true) {
                    setValue(verifiedName, value);
                    clearErrors(name);
                } else if (res.data?.available === false) {
                    setError(name, { message: duplicateMessage });
                } else {
                    setError(name, { message: '중복확인 중 문제가 발생했습니다.' });
                }
            },
            onError: (error) => {
                if (!isStale()) setError(name, { message: errorMessage(error) });
            },
        });
    };

    const handleSendCode = () => {
        const value = parseField('phone');
        if (value === null) return;
        sendCode.mutate(
            { data: { phone: value } },
            {
                onSuccess: () => {
                    setValue('code', '');
                    clearErrors(['phone', 'code']);
                },
                onError: (error) => setError('phone', { message: errorMessage(error) }),
            },
        );
    };

    const handleVerifyCode = () => {
        const code = getValues('code').trim();
        if (!code) {
            setError('code', { message: '인증번호를 입력해주세요.' });
            return;
        }
        verifyCode.mutate(
            { data: { phone, code } },
            {
                onSuccess: () => {
                    setValue('verifiedPhone', phone);
                    clearErrors(['phone', 'code']);
                },
                onError: (error) => setError('code', { message: errorMessage(error) }),
            },
        );
    };

    // 형식·중복확인·인증·약관 검사는 스키마가 끝낸 상태로 들어온다.
    const onSubmit = (values: SignupOutput) => {
        signup.mutate(
            {
                data: {
                    email: values.email,
                    password: values.password,
                    nickname: values.nickname,
                    phone: values.phone,
                    birthDate: values.birth,
                },
            },
            {
                onSuccess: () => {
                    alert('회원가입이 완료되었습니다. 로그인해 주세요.');
                    router.replace(ROUTES.login);
                },
            },
        );
    };

    const handleAgreeAll = (checked: boolean) => {
        TERMS.forEach((_, i) => setValue(`terms.${i}`, checked));
        // 약관 에러는 terms.root 에 있어서 항목별 검사로는 지워지지 않는다. 배열 전체를 다시 검사한다.
        if (errors.terms) void trigger('terms');
    };

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="reg-email">
                    <span>
                        이메일 <span className="text-error">*</span>
                    </span>
                    {emailVerified ? (
                        <span className="font-caption text-caption text-on-surface font-semibold">사용 가능한 이메일입니다</span>
                    ) : (
                        <span className="font-caption text-caption text-on-surface-variant">아이디로 사용됩니다</span>
                    )}
                </label>
                <div className="flex gap-2">
                    <input
                        className={`flex-1 ${INPUT_CLASS}`}
                        id="reg-email"
                        placeholder="example@sportsgroup.co.kr"
                        type="email"
                        {...register('email')}
                    />
                    <button
                        className={`${SUB_BUTTON_CLASS}${emailVerified ? ' bg-surface-container cursor-default' : ''}`}
                        type="button"
                        onClick={() => handleCheck('email', emailCheck, 'verifiedEmail', '이미 사용 중인 이메일입니다.')}
                        disabled={emailVerified || emailCheck.isPending}
                    >
                        {emailVerified ? '확인완료' : emailCheck.isPending ? '확인 중...' : '중복확인'}
                    </button>
                </div>
                <FieldError message={errors.email?.message} />
            </div>
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
                        {...register('password')}
                    />
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                    </button>
                </div>
                <p className="font-caption text-caption text-on-surface-variant">8~20자 이내 특수문자(!@#$%^&amp;*)를 포함해 주세요.</p>
                <FieldError message={errors.password?.message} />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-password-confirm">
                    비밀번호 확인 <span className="text-error">*</span>
                </label>
                <input
                    className={`w-full ${INPUT_CLASS}`}
                    id="reg-password-confirm"
                    placeholder="비밀번호를 다시 입력해주세요"
                    type="password"
                    {...register('passwordConfirm')}
                />
                <div className="flex items-center gap-1.5 pt-0.5">
                    {!passwordConfirm ? (
                        <>
                            <Icon name="help_outline" className="text-[15px] text-outline" />
                            <span className="font-caption text-caption text-on-surface-variant">비밀번호 일치 여부를 검사합니다.</span>
                        </>
                    ) : password === passwordConfirm ? (
                        <>
                            <Icon name="check_circle" className="text-[15px] text-on-surface" />
                            <span className="font-caption text-caption text-on-surface font-semibold">비밀번호가 일치합니다.</span>
                        </>
                    ) : (
                        <>
                            <Icon name="cancel" className="text-[15px] text-error" />
                            <span className="font-caption text-caption text-error font-semibold">비밀번호가 일치하지 않습니다.</span>
                        </>
                    )}
                </div>
                {!passwordConfirm && <FieldError message={errors.passwordConfirm?.message} />}
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface flex items-center justify-between" htmlFor="reg-nickname">
                    <span>
                        닉네임 (팀 내 표시 이름) <span className="text-error">*</span>
                    </span>
                    {nicknameVerified ? (
                        <span className="font-caption text-caption text-on-surface font-semibold">사용 가능한 닉네임입니다</span>
                    ) : (
                        <span className="font-caption text-caption text-secondary">마킹용 실명 추천</span>
                    )}
                </label>
                <div className="flex gap-2">
                    <input
                        className={`flex-1 ${INPUT_CLASS}`}
                        id="reg-nickname"
                        placeholder="유니폼 마킹에 사용할 이름 또는 닉네임"
                        type="text"
                        {...register('nickname')}
                    />
                    <button
                        className={`${SUB_BUTTON_CLASS}${nicknameVerified ? ' bg-surface-container cursor-default' : ''}`}
                        type="button"
                        onClick={() => handleCheck('nickname', nicknameCheck, 'verifiedNickname', '이미 사용 중인 닉네임입니다.')}
                        disabled={nicknameVerified || nicknameCheck.isPending}
                    >
                        {nicknameVerified ? '확인완료' : nicknameCheck.isPending ? '확인 중...' : '중복확인'}
                    </button>
                </div>
                <p className="font-caption text-caption text-on-surface-variant">선수단 오더 시트와 로스터 명단에 기본 적용됩니다.</p>
                <FieldError message={errors.nickname?.message} />
            </div>
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
                        {...register('phone', { onChange: (e) => setValue('phone', formatPhone(e.target.value)) })}
                    />
                    <button
                        className={SUB_BUTTON_CLASS}
                        type="button"
                        onClick={handleSendCode}
                        disabled={phoneVerified || sendCode.isPending}
                    >
                        {phoneVerified ? '인증완료' : sendCode.isPending ? '발송 중...' : codeSent ? '재발송' : '인증번호 발송'}
                    </button>
                </div>
                <FieldError message={errors.phone?.message} />
                {codeSent && !phoneVerified && (
                    <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex gap-2">
                            <input
                                className={`flex-1 ${INPUT_CLASS}`}
                                id="reg-phone-code"
                                inputMode="numeric"
                                placeholder="인증번호 입력"
                                type="text"
                                aria-label="휴대폰 인증번호"
                                {...register('code')}
                            />
                            <button
                                className={SUB_BUTTON_CLASS}
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={verifyCode.isPending}
                            >
                                {verifyCode.isPending ? '확인 중...' : '인증확인'}
                            </button>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant">인증번호는 3분간 유효합니다.</p>
                        <FieldError message={errors.code?.message} />
                    </div>
                )}
                {phoneVerified && (
                    <p className="font-caption text-caption text-on-surface font-semibold">휴대폰 인증이 완료되었습니다.</p>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="font-body-sm text-body-sm text-on-surface" htmlFor="reg-birth">
                    생년월일 (8자리) <span className="text-error">*</span>
                </label>
                <input
                    className={`w-full ${INPUT_CLASS}`}
                    id="reg-birth"
                    maxLength={8}
                    placeholder="YYYYMMDD (예: 19950524)"
                    type="text"
                    {...register('birth')}
                />
                <FieldError message={errors.birth?.message} />
            </div>
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
                                    {...register(`terms.${i}`)}
                                />
                                <span className="font-body-sm text-body-sm text-on-surface">{term}</span>
                            </label>
                            <button className="font-caption text-caption text-on-surface-variant hover:text-on-surface underline" type="button">
                                전문보기
                            </button>
                        </div>
                    ))}
                </div>
                {/* 배열 필드 전체에 대한 에러는 root에 담긴다 */}
                <FieldError message={errors.terms?.root?.message} />
            </div>
            {signup.isError && (
                <p className="font-caption text-caption text-error" role="alert">
                    {errorMessage(signup.error, '회원가입에 실패했습니다.')}
                </p>
            )}
            <button
                className="w-full h-12 mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                type="submit"
                disabled={signup.isPending}
            >
                <span>{signup.isPending ? '가입 처리 중...' : '회원가입 완료'}</span>
                <Icon name="arrow_forward" className="text-[18px]" />
            </button>
        </form>
    );
}
