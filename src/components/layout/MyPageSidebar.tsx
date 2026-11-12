import SidebarNav from '@/components/layout/SidebarNav';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '마이페이지 홈', href: ROUTES.myPage },
    { label: '주문/배송 조회', href: ROUTES.orders },
    { label: '예치금 관리', href: ROUTES.deposit },
    { label: '배송지 관리', href: ROUTES.addresses },
    { label: '회원 정보 수정', href: ROUTES.profile },
    { label: '판매자 등록', href: ROUTES.sellerApply },
];

// 마이페이지 좌측 메뉴 (col-span-3 영역에 배치)
export default function MyPageSidebar() {
    return (
        <aside className="flex min-w-0 flex-col gap-3 lg:col-span-3 lg:sticky lg:top-28">
            <Card padding={3}>
                <div className="mb-2 px-2">
                    <Text type="supporting" weight="semibold" color="accent">내 계정</Text>
                </div>
                <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:flex lg:flex-col">
                    <SidebarNav
                        items={MENU}
                        exactHref={ROUTES.myPage}
                        className="min-w-0 rounded-lg px-3 py-2.5 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container"
                        activeClassName="min-w-0 rounded-lg bg-primary px-3 py-2.5 font-label-sm text-label-sm font-bold text-on-primary"
                    />
                </nav>
            </Card>
        </aside>
    );
}
