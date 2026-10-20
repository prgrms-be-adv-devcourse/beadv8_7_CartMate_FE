'use client';

import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { useAdminMember } from './AdminGuard';

export default function AdminHeader() {
    const member = useAdminMember();

    // 관리자 확인 전에는 헤더를 그리지 않음
    if (!member) return null;

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant z-40 flex items-center justify-between px-space-lg">
            <div className="flex items-center gap-space-sm">
                <Link href={ROUTES.home} aria-label="사이트 홈으로">
                    <Icon name="home" className="text-outline text-[18px] hover:text-on-surface" />
                </Link>
                <span className="text-outline">/</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">관리자 콘솔</span>
            </div>
            <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-sm px-space-sm py-space-xs border border-outline-variant rounded bg-surface">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="font-label-sm text-label-sm text-on-primary">{member.nickname.slice(0, 1)}</span>
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="font-label-sm text-label-sm text-primary leading-tight">{member.nickname}</span>
                        <span className="font-caption text-caption text-on-surface-variant leading-tight">{member.email}</span>
                    </div>
                </div>
                {/* 공용 로그아웃: 로그인 상태 캐시를 비우고 전체 새로고침으로 로그인 화면에 간다 */}
                <LogoutButton
                    className="flex items-center gap-space-xs px-space-md py-space-sm border border-outline-variant rounded bg-surface-container-lowest font-label-sm text-label-sm text-primary hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                    <Icon name="logout" className="text-[16px]" />
                    <span>로그아웃</span>
                </LogoutButton>
            </div>
        </header>
    );
}