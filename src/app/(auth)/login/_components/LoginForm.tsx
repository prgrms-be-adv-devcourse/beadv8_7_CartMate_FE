'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';

type LoginValues = {
    email: string;
    password: string;
    remember: boolean;
};

const INPUT_CLASS =
    'w-full h-[42px] px-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-on-surface transition-colors';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({ defaultValues: { remember: true } });

    const onSubmit = async (values: LoginValues) => {
        setSubmitError(null);
        try {
            await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: values.email.trim(),
                    password: values.password,
                    remember: values.remember,
                }),
            });
            router.push('/');
            router.refresh();
        } catch (e) {
            setSubmitError(e instanceof ApiError ? e.message : '로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <form className="flex flex-col gap-4.5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                        {...register('email', { required: '이메일 주소를 입력해주세요.' })}
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
                    <a className="font-label-sm text-label-sm text-outline hover:text-on-surface hover:underline transition-colors" href="#">
                        비밀번호 찾기
                    </a>
                </div>
                <div className="relative flex items-center">
                    <input
                        className={`${INPUT_CLASS} pr-10`}
                        id="user-password"
                        placeholder="비밀번호를 입력하세요"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', { required: '비밀번호를 입력해주세요.' })}
                    />
                    <button
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
                <span className="text-caption font-caption text-outline">보안 30일 보관</span>
            </div>
            {/* Main Action CTA Button */}
            {submitError && <p className="font-caption text-caption text-error">{submitError}</p>}
            <button
                disabled={isSubmitting}
                className="w-full h-[44px] mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
                type="submit"
            >
                <span>{isSubmitting ? '로그인 중...' : '로그인'}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
            </button>
        </form>
    );
}
