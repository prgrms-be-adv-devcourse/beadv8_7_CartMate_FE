import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import LoginForm from './_components/LoginForm';

export const metadata: Metadata = { title: '로그인 | TEAMBUY' };

const SOCIAL_LOGINS = ['카카오', '네이버', '구글'];

export default function LoginPage() {
    return (
        <div className="flex flex-col w-full items-center justify-center py-12">
            {/* System Architecture Breadcrumb / Wireframe Tracker */}
            <div className="w-full max-w-[480px] mb-4 flex items-center justify-between text-on-surface-variant font-caption text-caption">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-outline" />
                    <span>WIREFRAME ID: SCR-AUTH-01</span>
                </div>
                <span className="bg-surface-container px-2 py-0.5 rounded text-outline font-label-sm text-label-sm">480px FORM SPEC</span>
            </div>
            {/* Main 480px Centered Wireframe Form Container */}
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col gap-1 pb-4 border-b border-surface-container-high">
                    <div className="flex items-center justify-between">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">로그인</h1>
                        <Icon name="lock" className="text-outline text-xl" />
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">동호회·팀 유니폼 및 장비 공동구매 서비스</p>
                </div>
                <LoginForm />
                {/* Sign-up Redirect Link */}
                <div className="flex items-center justify-center gap-2 py-1 text-center font-body-sm text-body-sm text-on-surface-variant border-t border-surface-container-high pt-4">
                    <span>아직 회원이 아니신가요?</span>
                    <Link
                        className="font-label-md text-label-md text-on-surface underline decoration-1 underline-offset-4 hover:text-outline transition-colors"
                        href={ROUTES.signup}
                    >
                        회원가입하기
                    </Link>
                </div>
                {/* Social / Simple Login Area */}
                <div className="flex flex-col gap-3">
                    <div className="relative flex items-center justify-center">
                        <div className="w-full border-t border-outline-variant" />
                        <span className="absolute bg-surface-container-lowest px-3 font-caption text-caption text-outline uppercase tracking-wider">간편 로그인</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        {SOCIAL_LOGINS.map((name) => (
                            <button
                                key={name}
                                className="h-[40px] border border-outline-variant rounded bg-surface hover:bg-surface-container flex items-center justify-center gap-1.5 transition-colors group"
                                type="button"
                            >
                                <span className="w-2.5 h-2.5 rounded-full bg-outline group-hover:bg-on-surface" />
                                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">{name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Team Escrow & Bulk Order Security Notice Box */}
                <div className="bg-surface-container-low border border-outline-variant/60 rounded p-3.5 flex items-start gap-2.5">
                    <Icon name="verified_user" className="text-outline text-[18px] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold">팀 예치금 및 단체 정산 보안 안내</span>
                        <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
                            스포츠 동호회 및 클럽 단체 주문 시, MOQ 달성 전까지 결제 대금은 전용 에스크로 안전 계좌에 보호되며 납품 확정 시 일괄 정산됩니다.
                        </p>
                    </div>
                </div>
            </div>
            {/* Blueprint Layout Footer Spec */}
            <div className="w-full max-w-[480px] mt-6 flex items-center justify-between text-outline font-caption text-caption px-1">
                <span>AUTH FLOW: v1.0.4</span>
                <span>LAYOUT: 480PX FIXED DESKTOP CARD</span>
                <span>STATUS: ACTIVE BLUEPRINT</span>
            </div>
        </div>
    );
}
