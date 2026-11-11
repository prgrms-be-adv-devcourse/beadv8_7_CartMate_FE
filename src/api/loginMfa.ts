// 로그인 + 로그인 2차 인증 API (회원 서비스 /api/auth/login, /api/auth/mfa/*).
// 로그인 응답 모양이 바뀌어(mfaRequired) 생성 훅 대신 손으로 둔다. OpenAPI 스냅샷을 서비스별로 받게 되면 생성 훅으로 바꾼다.
import { useMutation } from '@tanstack/react-query';
import { http, type RsData } from './http';
import type { MemberDto } from './generated/model';

export type MfaChallenge = {
    challengeId: string;
    maskedEmail: string; // bu***@cartmate.com
    expiresInSeconds: number;
};

// mfaRequired=false면 member(로그인 완료), true면 mfa(인증번호 입력 단계, 토큰 없음)
export type LoginResponse = {
    mfaRequired: boolean;
    member: MemberDto | null;
    mfa: MfaChallenge | null;
};

const postJson = <T>(url: string, body: unknown) =>
    http<RsData<T>>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

export type LoginInput = { email: string; password: string; remember: boolean };
export type MfaVerifyInput = { challengeId: string; code: string; trustDevice: boolean };

export const login = (input: LoginInput) => postJson<LoginResponse>('/api/auth/login', input);
export const verifyLoginMfa = (input: MfaVerifyInput) => postJson<LoginResponse>('/api/auth/mfa/verify', input);
export const resendLoginMfa = (challengeId: string) =>
    postJson<{ expiresInSeconds: number }>('/api/auth/mfa/resend', { challengeId });

export const useLoginWithMfa = (meta?: Record<string, unknown>) => useMutation({ mutationFn: login, meta });
export const useVerifyLoginMfa = (meta?: Record<string, unknown>) => useMutation({ mutationFn: verifyLoginMfa, meta });
export const useResendLoginMfa = () => useMutation({ mutationFn: resendLoginMfa });