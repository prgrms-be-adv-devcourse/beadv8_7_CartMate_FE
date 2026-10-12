'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import Icon from '@/components/ui/Icon';

type SignupValues = {
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
    phone: string;
    birth: string;
    terms: boolean[];
};

const TERMS = ['[필수] 서비스 이용약관', '[필수] 개인정보 수집 및 이용 동의', '[필수] 공동구매 예치금 거래 약관'];

const INPUT_CLASS =
    'h-[42px] px-3 bg-surface-container-lowest text-on-surface rounded-lg font-body-md text-body-md shadow-sm outline-none focus:bg-surface-container-low transition-colors';
const SUB_BUTTON_CLASS =
    'h-[42px] px-4 bg-surface-container-high text-on-surface font-label-md text-label-md rounded-lg shadow-sm hover:bg-surface-dim transition-colors whitespace-nowrap active:scale-[0.98]';

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="font-caption text-caption text-error">{message}</p>;
}

export default function SignupForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [emailChecked, setEmailChecked] = useState<boolean | null>(null);
    const [codeSent, setCodeSent] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<SignupValues>({
        defaultValues: { terms: TERMS.map(() => false) },
    });

    const password = useWatch({ control, name: 'password' });
    const passwordConfirm = useWatch({ control, name: 'passwordConfirm' });
    const terms = useWatch({ control, name: 'terms' });
    const allAgreed = (terms ?? []).every(Boolean);

    const onSubmit = (values: SignupValues) => {
        console.log('signup', values);
    };

    const handleCheckEmail = () => {
        const email = getValues('email')?.trim();
        setEmailChecked(Boolean(email && email.includes('@')));
    };

    const handleSendCode = () => {
        const phone = getValues('phone')?.trim() ?? '';
        if (phone.length < 10) {
            alert('올바른 휴대폰 번호를 입력해주세요.');
            return;
        }
        setCodeSent(true);
        alert('인증번호 6자리가 발송되었습니다. [가상 Wireframe 알림]');
    };

    const handleAgreeAll = (checked: boolean) => {
        TERMS.forEach((_, i) => setValue(`terms.${i}`, checked, { shouldValidate: true }));
    };

    let emailStatus = { text: '아이디로 사용됩니다', className: 'font-caption text-caption text-on-surface-variant' };
    if (emailChecked === true) {
        emailStatus = { text: '사용 가능한 이메일입니다', className: 'font-caption text-caption text-on-surface font-semibold' };
    } else if (emailChecked === false) {
        emailStatus = { text: '유효한 이메일을 입력하세요', className: 'font-caption text-caption text-error' };
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                        {...register('email', { required: '이메일을 입력해주세요.' })}
                    />
                    <button
                        className={`${SUB_BUTTON_CLASS}${emailChecked ? ' bg-surface-container cursor-default' : ''}`}
                        type="button"
                        onClick={handleCheckEmail}
                    >
                        {emailChecked ? '확인완료' : '중복확인'}
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
                        {...register('password', { required: '비밀번호를 입력해주세요.' })}
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
                    {...register('passwordConfirm', {
                        required: '비밀번호 확인을 입력해주세요.',
                        validate: (value) => value === getValues('password') || '비밀번호가 일치하지 않습니다.',
                    })}
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
                    <span className="font-caption text-caption text-secondary">마킹용 실명 추천</span>
                </label>
                <input
                    className={`w-full ${INPUT_CLASS}`}
                    id="reg-nickname"
                    placeholder="유니폼 마킹에 사용할 이름 또는 닉네임"
                    type="text"
                    {...register('nickname', { required: '닉네임을 입력해주세요.' })}
                />
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
                        {...register('phone', { required: '휴대폰 번호를 입력해주세요.' })}
                    />
                    <button className={SUB_BUTTON_CLASS} type="button" onClick={handleSendCode}>
                        {codeSent ? '재발송' : '인증번호 발송'}
                    </button>
                </div>
                <FieldError message={errors.phone?.message} />
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
                    {...register('birth', {
                        required: '생년월일을 입력해주세요.',
                        pattern: { value: /^\d{8}$/, message: '생년월일 8자리를 입력해주세요.' },
                    })}
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
                                    {...register(`terms.${i}`, { validate: (v) => v || '필수 약관에 동의해주세요.' })}
                                />
                                <span className="font-body-sm text-body-sm text-on-surface">{term}</span>
                            </label>
                            <button className="font-caption text-caption text-on-surface-variant hover:text-on-surface underline" type="button">
                                전문보기
                            </button>
                        </div>
                    ))}
                </div>
                {errors.terms && <FieldError message="필수 약관에 모두 동의해주세요." />}
            </div>
            <button
                className="w-full h-12 mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                type="submit"
            >
                <span>회원가입 완료</span>
                <Icon name="arrow_forward" className="text-[18px]" />
            </button>
        </form>
    );
}
