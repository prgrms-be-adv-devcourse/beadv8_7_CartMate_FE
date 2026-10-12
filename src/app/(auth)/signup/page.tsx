import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SignupForm from './_components/SignupForm';

export const metadata: Metadata = { title: '회원가입 | TEAMBUY' };

export default function SignupPage() {
    return (
        <div className="flex flex-col w-full items-center justify-center py-12 px-4">
            <div className="w-full max-w-[480px] bg-surface-container-lowest shadow-md rounded-xl p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5 pb-4 bg-surface-container-low -mx-8 -mt-8 p-8 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <span className="font-caption text-caption text-secondary uppercase tracking-wider">MEMBER REGISTRATION</span>
                        <span className="inline-flex items-center gap-1 font-caption text-caption text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                            <Icon name="shield" className="text-[13px]" /> 본인인증 기반
                        </span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">회원가입</h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">팀원들과 함께하는 스마트 공동구매</p>
                </div>
                <SignupForm />
                <div className="flex items-center justify-center gap-1.5 pt-2 text-center">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">이미 계정이 있으신가요?</span>
                    <Link className="font-label-md text-label-md text-on-surface underline hover:opacity-80 transition-opacity" href={ROUTES.login}>
                        로그인
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-4 pt-1 font-caption text-caption text-secondary">
                    <span>팀 관리자 계정 생성 가이드</span>
                    <span>·</span>
                    <span>MOQ 단체할인 안내</span>
                </div>
            </div>
        </div>
    );
}
