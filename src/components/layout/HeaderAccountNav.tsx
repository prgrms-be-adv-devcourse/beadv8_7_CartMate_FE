'use client';

import { Button } from '@astryxdesign/core/Button';
import Icon from '@/components/ui/Icon';
import { CartCountBadge, DepositAmount } from '@/components/layout/HeaderUserBadges';
import { useCurrentUser, useLogout } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

// 역할별 센터 링크. 관리자·판매자에게만 보인다.
const ROLE_LINKS: Partial<Record<string, { label: string; href: string; icon: string }>> = {
    ADMIN: { label: '관리자 센터', href: ROUTES.admin, icon: 'admin_panel_settings' },
    SELLER: { label: '판매자 센터', href: ROUTES.seller, icon: 'storefront' },
};

// 헤더 오른쪽 계정 메뉴. 예치금·장바구니·계정 버튼을 한 줄, 같은 모양으로 둔다.
// 화면이 좁으면 아이콘만 보인다.
export default function HeaderAccountNav() {
    const { user, isLoading } = useCurrentUser();
    const { logout, isPending } = useLogout();
    const roleLink = user?.role ? ROLE_LINKS[user.role] : undefined;

    return (
        // 로그인 확인 중에는 자리만 차지하게 숨겨서, 응답 후 버튼이 바뀌며 깜빡이지 않게 한다.
        <div className={`ml-auto flex items-center gap-1 md:ml-0${isLoading ? ' invisible' : ''}`} aria-hidden={isLoading}>
            {user && (
                <div className="hidden lg:block">
                    <Button label="예치금" href={ROUTES.deposit} variant="ghost" size="sm" icon={<Icon name="account_balance_wallet" />}>
                        예치금 <DepositAmount />
                    </Button>
                </div>
            )}
            <div className="relative">
                <ResponsiveButton label="장바구니" href={ROUTES.cart} icon="shopping_bag" />
                <CartCountBadge />
            </div>
            {user ? (
                <>
                    {roleLink && <ResponsiveButton label={roleLink.label} href={roleLink.href} icon={roleLink.icon} />}
                    <ResponsiveButton label={`${user.nickname}님`} href={ROUTES.myPage} icon="account_circle" />
                    <ResponsiveButton label="로그아웃" icon="logout" onClick={logout} isDisabled={isPending} />
                </>
            ) : (
                <>
                    <ResponsiveButton label="로그인" href={ROUTES.login} icon="login" />
                    <Button label="회원가입" href={ROUTES.signup} variant="primary" size="sm" />
                </>
            )}
        </div>
    );
}

function ResponsiveButton({ label, href, icon, onClick, isDisabled }: {
    label: string;
    href?: string;
    icon: string;
    onClick?: () => void;
    isDisabled?: boolean;
}) {
    const props = { label, href, onClick, isDisabled, variant: 'ghost', size: 'sm', icon: <Icon name={icon} /> } as const;
    return (
        <>
            <div className="sm:hidden"><Button {...props} isIconOnly /></div>
            <div className="hidden sm:block"><Button {...props} /></div>
        </>
    );
}
