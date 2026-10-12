import SidebarNav from '@/components/layout/SidebarNav';
import { ROUTES } from '@/lib/routes';

const MENU = [
    { label: '마이페이지 홈', href: ROUTES.myPage },
    { label: '주문/배송 조회', href: ROUTES.orders },
    { label: '팀 예치금 관리', href: ROUTES.deposit },
    { label: '배송지 관리', href: ROUTES.addresses },
    { label: '회원 정보 수정', href: ROUTES.profile },
    { label: '판매자 등록', href: ROUTES.sellerApply },
];

// 마이페이지 좌측 메뉴 (col-span-3 영역에 배치)
export default function MyPageSidebar() {
    return (
        <aside className="col-span-3 flex flex-col gap-space-sm">
            <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant flex flex-col gap-space-xs">
                <div className="font-label-md text-label-md font-bold text-primary mb-space-xs">마이페이지</div>
                <nav className="flex flex-col gap-1 font-body-sm text-body-sm">
                    <SidebarNav
                        items={MENU}
                        exactHref={ROUTES.myPage}
                        className="px-space-sm py-2 rounded hover:bg-surface-container text-on-surface-variant"
                        activeClassName="px-space-sm py-2 rounded bg-primary text-on-primary font-bold"
                    />
                </nav>
            </div>
        </aside>
    );
}
