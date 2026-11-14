import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import LoginForm from './_components/LoginForm';
import SessionExpiredNotice from './_components/SessionExpiredNotice';

export const metadata: Metadata = { title: '로그인 | TEAMBUY' };

export default function LoginPage() {
    return (
        <div className="flex w-full max-w-[520px] flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <Text type="supporting" color="accent">TEAMBUY ACCOUNT</Text>
                <Badge label="안전한 로그인" variant="success" icon={<Icon name="verified_user" className="text-[14px]" />} />
            </div>
            <Card padding={6} elevation="low" className="w-full">
                <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-b border-outline-variant pb-5">
                    <div className="flex items-center justify-between">
                        <Heading level={1}>로그인</Heading>
                        <Icon name="lock" className="text-outline text-xl" />
                    </div>
                    <Text color="secondary">공동구매 현황과 주문을 한 계정에서 관리하세요.</Text>
                </div>
                {/* 쿼리스트링을 읽는 부분만 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                <Suspense fallback={null}>
                    <SessionExpiredNotice />
                </Suspense>
                <LoginForm />
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-outline-variant pt-5 text-center">
                    <Text color="secondary">아직 회원이 아니신가요?</Text>
                    <Link
                        className="font-label-md text-label-md text-primary underline decoration-1 underline-offset-4 hover:opacity-70"
                        href={ROUTES.signup}
                    >
                        회원가입
                    </Link>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4">
                    <Icon name="verified_user" className="text-outline text-[18px] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                        <Text weight="semibold">예치금 보안 안내</Text>
                        <Text type="supporting" color="secondary">비밀번호와 인증번호를 다른 사람에게 공유하지 마세요.</Text>
                    </div>
                </div>
                </div>
            </Card>
        </div>
    );
}
