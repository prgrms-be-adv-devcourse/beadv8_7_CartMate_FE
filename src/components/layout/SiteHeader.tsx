'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import SidebarNav from '@/components/layout/SidebarNav';
import { apiFetch } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

// 백엔드 shared/member/dto/MemberDto 와 같은 모양
type Member = {
    id: number;
    email: string;
    nickname: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
};

const NAV_ITEMS = [
    { label: '스포츠 종목', href: ROUTES.home },
    { label: '공동구매', href: ROUTES.groupPurchases },
    { label: '로스터 제작', href: ROUTES.groupPurchaseNew },
    { label: 'MOQ 특가', href: ROUTES.search },
];

const ICON_BUTTON =
    'relative h-10 pl-3 pr-3.5 rounded-full flex items-center gap-1.5 whitespace-nowrap font-label-sm text-label-sm text-on-surface-variant bg-surface-container-lowest/70 ring-1 ring-white/80 shadow-sm hover:text-on-surface hover:bg-surface-container-lowest hover:shadow-md transition-all';

const UTIL_LINK = 'font-caption text-caption text-on-surface-variant hover:text-primary transition-colors';

// 로그인한 회원 조회. 페이지가 바뀔 때마다 다시 확인해서 로그인·로그아웃 직후에도 바로 반영된다.
function useCurrentMember() {
    const pathname = usePathname();
    const [member, setMember] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await apiFetch<Member>('/api/members/me');
            setMember(res.data);
        } catch {
            setMember(null); // 401(비로그인), 서버 꺼짐 등은 모두 비로그인으로 처리
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load, pathname]);

    return { member, loading, setMember };
}

// 유틸 링크 사이의 점 구분자
function UtilLinks({ children }: { children: React.ReactNode[] }) {
    const items = children.filter(Boolean);
    return (
        <nav className="flex items-center">
            {items.map((child, index) => (
                <span key={index} className="flex items-center">
                    {index > 0 && <span className="w-1 h-1 rounded-full bg-outline-variant mx-2.5" />}
                    {child}
                </span>
            ))}
        </nav>
    );
}

export default function SiteHeader() {
    const { member, loading, setMember } = useCurrentMember();
    const router = useRouter();
    const isLoggedIn = member !== null;

    const handleLogout = async () => {
        try {
            await apiFetch('/api/auth/logout', { method: 'POST' });
        } finally {
            setMember(null);
            router.push(ROUTES.home);
            router.refresh();
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b">
            <div className="max-w-[1200px] mx-auto px-gutter">
                {/* 상단 유틸 영역 */}
                <div className="h-12 flex items-center justify-between text-on-surface-variant">
                    <span className="font-caption text-caption text-outline">스포츠 단체복 · 장비 커스텀 공동구매 플랫폼</span>

                    {/* 로그인 확인 중에는 비워 둬서 메뉴가 깜빡이지 않게 함 */}
                    {!loading && (
                        <div className="flex items-center gap-space-md">
                            {isLoggedIn && (
                                <Link
                                    href={ROUTES.deposit}
                                    className="h-7 pl-2 pr-3 rounded-full flex items-center gap-1.5 font-caption text-caption bg-primary-fixed/70 ring-1 ring-white/70 hover:bg-primary-fixed transition-colors"
                                >
                                    <Icon name="account_balance_wallet" className="text-[15px] text-primary" />
                                    <span className="text-on-surface-variant">팀 예치금</span>
                                    {/* TODO: wallet API 연결 후 실제 사용 가능 잔액 표시 */}
                                    <span className="font-label-sm text-label-sm text-primary">확인하기</span>
                                </Link>
                            )}

                            {isLoggedIn ? (
                                <UtilLinks>
                                    {[
                                        <span key="nickname" className="font-caption text-caption text-on-surface">
                                            <strong className="font-semibold">{member.nickname}</strong>님
                                        </span>,
                                        <button key="logout" type="button" onClick={handleLogout} className={UTIL_LINK}>
                                            로그아웃
                                        </button>,
                                        <Link key="notices" href={ROUTES.notices} className={UTIL_LINK}>
                                            고객센터
                                        </Link>,
                                        member.role === 'ADMIN' ? (
                                            <Link key="admin" href={ROUTES.adminMembers} className={`${UTIL_LINK} font-semibold text-primary`}>
                                                관리자 센터
                                            </Link>
                                        ) : member.role === 'SELLER' ? (
                                            <Link key="seller" href={ROUTES.seller} className={UTIL_LINK}>
                                                판매자 센터
                                            </Link>
                                        ) : null,
                                    ]}
                                </UtilLinks>
                            ) : (
                                <UtilLinks>
                                    {[
                                        <Link key="login" href={ROUTES.login} className={UTIL_LINK}>
                                            로그인
                                        </Link>,
                                        <Link key="signup" href={ROUTES.signup} className={UTIL_LINK}>
                                            회원가입
                                        </Link>,
                                        <Link key="notices" href={ROUTES.notices} className={UTIL_LINK}>
                                            고객센터
                                        </Link>,
                                    ]}
                                </UtilLinks>
                            )}
                        </div>
                    )}
                </div>

                {/* 메인 영역 */}
                <div className="h-20 flex items-center justify-between gap-space-lg">
                    <div className="flex items-center gap-space-lg">
                        <Link href={ROUTES.home} className="flex items-center gap-1.5 shrink-0">
                            <span className="brand-gradient-text font-headline-lg text-headline-lg font-extrabold tracking-tight">TEAMBUY</span>
                            <span className="bg-primary text-on-primary font-caption text-caption px-1.5 py-0.5 rounded-full">B2B</span>
                        </Link>
                        <form
                            action={ROUTES.search}
                            className="w-72 h-10 pl-4 pr-1 rounded-full flex items-center bg-surface-container-lowest/70 ring-1 ring-white/80 shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:bg-surface-container-lowest transition-all"
                        >
                            <Icon name="search" className="text-outline text-[18px] mr-2" />
                            <input
                                name="q"
                                className="w-full bg-transparent border-none outline-none focus-visible:outline-none font-body-sm text-body-sm placeholder:text-outline text-on-surface"
                                placeholder="유니폼, 장비명, 품번 검색"
                                type="text"
                            />
                            <button
                                className="w-8 h-8 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center"
                                type="submit"
                                aria-label="검색"
                            >
                                <Icon name="arrow_forward" className="text-[16px]" />
                            </button>
                        </form>
                    </div>

                    <nav className="flex items-center gap-0.5 p-1 rounded-full bg-surface-container-lowest/50 ring-1 ring-white/70">
                        <SidebarNav
                            items={NAV_ITEMS}
                            exactHref={ROUTES.home}
                            className="h-9 px-4 rounded-full flex items-center whitespace-nowrap font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/80 transition-all"
                            activeClassName="h-9 px-4 rounded-full flex items-center whitespace-nowrap font-label-md text-label-md bg-surface-container-lowest text-primary shadow-sm"
                        />
                    </nav>

                    <div className="flex items-center gap-space-sm">
                        {/* 비로그인 상태에서 장바구니·마이페이지를 누르면 로그인 페이지로 */}
                        <Link href={isLoggedIn ? ROUTES.cart : ROUTES.login} className={ICON_BUTTON}>
                            <Icon name="shopping_bag" className="text-[18px]" />
                            장바구니
                            {/* TODO: cart API 연결 후 담긴 개수 배지 표시 */}
                        </Link>
                        <Link href={isLoggedIn ? ROUTES.myPage : ROUTES.login} className={ICON_BUTTON}>
                            <Icon name="account_circle" className="text-[18px]" />
                            마이페이지
                        </Link>
                        {isLoggedIn && (
                            <Link
                                href={ROUTES.myPage}
                                className="w-9 h-9 shrink-0 rounded-full p-[2px] bg-primary"
                                aria-label={`${member.nickname}님 마이페이지`}
                                title={member.nickname}
                            >
                                <span className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center font-label-sm text-label-sm text-primary">
                                    {member.nickname.slice(0, 1)}
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
