'use client';

import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

const LINK_CLASS = 'font-caption text-caption text-on-surface-variant hover:text-primary transition-colors';

const COMMON_LINKS = [
    { label: '고객센터', href: ROUTES.notices },
    { label: '판매자 센터', href: ROUTES.seller },
];

// 헤더 상단 유틸 메뉴. 로그인 여부에 따라 앞부분이 바뀐다.
export default function HeaderUtilNav() {
    const { user, isLoading } = useCurrentUser();

    const items: { key: string; node: ReactNode }[] = [];
    if (user) {
        items.push(
            {
                key: 'me',
                node: (
                    <Link href={ROUTES.myPage} className={LINK_CLASS}>
                        <span className="font-semibold text-on-surface">{user.nickname}</span>님
                    </Link>
                ),
            },
            { key: 'logout', node: <LogoutButton className={LINK_CLASS}>로그아웃</LogoutButton> },
        );
    } else {
        // 확인 중에는 자리만 차지하게 숨겨서, 응답 후 메뉴가 밀리거나 로그인 링크가 깜빡이지 않게 한다.
        const hidden = isLoading ? ' invisible' : '';
        items.push(
            { key: 'login', node: <Link href={ROUTES.login} className={`${LINK_CLASS}${hidden}`} aria-hidden={isLoading}>로그인</Link> },
            { key: 'signup', node: <Link href={ROUTES.signup} className={`${LINK_CLASS}${hidden}`} aria-hidden={isLoading}>회원가입</Link> },
        );
    }
    COMMON_LINKS.forEach((link) =>
        items.push({ key: link.href, node: <Link href={link.href} className={LINK_CLASS}>{link.label}</Link> }),
    );

    return (
        <nav className="flex items-center">
            {items.map((item, index) => (
                <Fragment key={item.key}>
                    {index > 0 && <span className="w-1 h-1 rounded-full bg-outline-variant mx-2.5" />}
                    {item.node}
                </Fragment>
            ))}
        </nav>
    );
}
