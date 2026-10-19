'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLogin } from '@/api/generated/auth-controller/auth-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { SKIP_AUTH_EXPIRED, setCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { loginSchema, type LoginValues } from '../../_lib/authSchemas';

const INPUT_CLASS =
    'w-full h-[42px] px-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:border-on-surface transition-colors';

// 로그인 후 돌아갈 경로. 외부 주소로 튀지 않도록 사이트 내부 경로만 허용한다.
function nextPath(): string {
    const next = new URLSearchParams(window.location.search).get('next');
    if (!next?.startsWith('/')) return ROUTES.home;
    // `//evil.com`, `/\evil.com` 같은 우회를 막기 위해 브라우저와 같은 규칙으로 해석해 출처를 비교한다.
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : ROUTES.home;
}

export default function LoginForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const login = useLogin({ mutation: { meta: SKIP_AUTH_EXPIRED } });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: true },
    });

    const onSubmit = (values: LoginValues) => {
        login.mutate(
            { data: values },
            {
                onSuccess: async (res) => {
                    await setCurrentUser(queryClient, res);
                    router.replace(nextPath());
                    router.refresh();
                },
            },
        );
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
                        {...register('password')}
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
            {login.isError && (
                <p className="font-caption text-caption text-error" role="alert">
                    {errorMessage(login.error, '로그인에 실패했습니다.')}
                </p>
            )}
            {/* Main Action CTA Button */}
            <button
                className="w-full h-[44px] mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
                type="submit"
                disabled={login.isPending}
            >
                <span>{login.isPending ? '로그인 중...' : '로그인'}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
            </button>
        </form>
    );
}
