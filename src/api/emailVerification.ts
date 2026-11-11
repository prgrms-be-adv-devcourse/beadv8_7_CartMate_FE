// 가입 이메일 인증 API (회원 서비스 /api/auth/email/*).
// 서비스가 나뉘어 OpenAPI 스냅샷(openapi/cartmate.json)을 아직 서비스별로 받지 못해서 손으로 둔다.
// 스냅샷을 서비스별로 받게 되면 orval 생성 훅으로 바꾼다.
import { useMutation } from '@tanstack/react-query';
import { http, type RsData } from './http';

export type EmailSendResponse = { expiresInSeconds: number };

export const sendEmailCode = (email: string) =>
    http<RsData<EmailSendResponse>>('/api/auth/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

export const verifyEmailCode = (email: string, code: string) =>
    http<RsData<null>>('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
    });

export const useSendEmailCode = () => useMutation({ mutationFn: (email: string) => sendEmailCode(email) });

export const useVerifyEmailCode = () =>
    useMutation({ mutationFn: ({ email, code }: { email: string; code: string }) => verifyEmailCode(email, code) });