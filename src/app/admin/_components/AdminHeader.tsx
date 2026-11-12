'use client';

import { Badge, Button, Card, Text } from '@astryxdesign/core';
import LogoutButton from '@/components/auth/LogoutButton';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { useAdminMember } from './AdminGuard';

export default function AdminHeader() {
    const member = useAdminMember();

    // 관리자 확인 전에는 헤더를 그리지 않음
    if (!member) return null;

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-space-md md:fixed md:left-64 md:right-0 md:px-space-lg">
            <div className="flex items-center gap-space-sm">
                <Button label="사이트 홈" icon={<Icon name="home" className="text-[18px]" />} href={ROUTES.home} variant="ghost" />
                <Text color="disabled">/</Text>
                <Text color="secondary">관리자 콘솔</Text>
            </div>
            <div className="flex items-center gap-space-md">
                <Card className="hidden items-center gap-space-sm sm:flex" padding={2} variant="muted">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Text color="inherit" className="text-on-primary">{member.nickname.slice(0, 1)}</Text>
                    </div>
                    <div className="flex flex-col text-left">
                        <Text>{member.nickname}</Text>
                        <Text color="secondary">{member.email}</Text>
                    </div>
                    <Badge variant="info" label="관리자" />
                </Card>
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
