import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SignupForm from './_components/SignupForm';

export const metadata: Metadata = { title: '회원가입 | TEAMBUY' };

export default function SignupPage() {
    return (
        <div className="flex w-full max-w-[560px] flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <Text type="supporting" color="accent">TEAMBUY ACCOUNT</Text>
                <Badge label="본인 인증" variant="success" icon={<Icon name="shield" className="text-[13px]" />} />
            </div>
            <Card padding={6} elevation="low" className="w-full">
                <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-b border-outline-variant pb-5">
                    <div className="flex items-center justify-between">
                        <Heading level={1}>회원가입</Heading>
                        <Icon name="person_add" className="text-xl text-outline" />
                    </div>
                    <Text color="secondary">계정을 만들고 팀 공동구매에 참여하세요.</Text>
                </div>
                <SignupForm />
                <div className="flex items-center justify-center gap-1.5 pt-2 text-center">
                    <Text color="secondary">이미 계정이 있으신가요?</Text>
                    <Link className="font-label-md text-label-md text-primary underline hover:opacity-70" href={ROUTES.login}>
                        로그인
                    </Link>
                </div>
                </div>
            </Card>
        </div>
    );
}
