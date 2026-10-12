import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '마이페이지 | TEAMBUY',
};

const METRIC_CARDS = [
    {
        label: '예치금 사용 가능 잔액',
        icon: 'account_balance_wallet',
        value: '₩ 152,000',
        valueClassName: 'text-primary',
        suffix: null,
        note: '미정산 환불 대기 ₩0',
        noteClassName: 'text-outline',
        action: '충전/환불 >',
        href: ROUTES.deposit,
    },
    {
        label: '진행 중인 공동구매',
        icon: 'groups',
        value: '2건',
        valueClassName: 'text-on-surface',
        suffix: null,
        note: '목표 수량 달성률 85%',
        noteClassName: 'text-on-surface-variant',
        action: '현황 보기 >',
        href: ROUTES.groupPurchases,
    },
    {
        label: '배송 / 제작 진행',
        icon: 'local_shipping',
        value: '1건',
        valueClassName: 'text-on-surface',
        suffix: '배송중',
        note: '로스터 인쇄 작업 완료',
        noteClassName: 'text-outline',
        action: '조회 >',
        href: ROUTES.orders,
    },
];

const ACTIVE_GROUP_ORDERS = [
    {
        id: 'TB-2025-0812',
        icon: 'checkroom',
        category: '축구 유니폼',
        categoryClassName: 'bg-primary text-on-primary',
        title: '[FC서울 스타일] 드라이핏 커스텀 세트 (상하의+스타킹)',
        price: '단가: ₩38,000 (MOQ 20벌 달성 완료 - 최대 할인 적용)',
        status: '배송 준비 중',
        statusClassName: 'text-primary',
        deadline: '인쇄 마감: D-2',
    },
    {
        id: 'TB-2025-0801',
        icon: 'sports_basketball',
        category: '농구 장비',
        categoryClassName: 'border border-primary text-primary',
        title: '프로그레이드 리바운드 농구공 10구 패키지',
        price: '단가: ₩240,000 (현재 8/10구 참여 중 - MOQ 미달성)',
        status: '모집 중 (80%)',
        statusClassName: 'text-on-surface',
        deadline: '마감까지 D-5',
    },
];

const RECENT_ORDERS = [
    {
        date: '2025.02.10',
        id: 'TB-20250210-01',
        name: '스타디움 웜업 자켓 팀 패키지',
        option: '옵션: 블랙 / L (등번호 인쇄 포함)',
        quantity: '15벌',
        amount: '₩ 675,000',
        status: '배송완료',
        statusClassName: 'bg-primary text-on-primary',
    },
    {
        date: '2025.01.25',
        id: 'TB-20250125-04',
        name: '프로 논슬립 스포츠 삭스',
        option: '옵션: 화이트 / 270mm (30족 묶음)',
        quantity: '30족',
        amount: '₩ 180,000',
        status: '구매확정',
        statusClassName: 'border border-outline-variant text-on-surface-variant',
    },
];

export default function MyPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* Top Greeting Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl pb-space-lg border-b border-outline-variant">
                    <div>
                        <div className="font-caption text-caption text-outline uppercase tracking-wider mb-space-xs">[MY ACCOUNT DASHBOARD]</div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">홍길동 회원님, 반갑습니다.</h1>
                    </div>
                    <div className="flex items-center gap-space-md">
                        <Link
                            className="h-10 px-space-md bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md rounded flex items-center gap-space-xs hover:border-primary transition-colors"
                            href={ROUTES.seller}
                        >
                            <Icon name="storefront" className="text-[18px]" />
                            판매자 센터
                        </Link>
                        <Link
                            className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-space-xs hover:bg-on-surface transition-colors"
                            href={ROUTES.groupPurchaseNew}
                        >
                            <Icon name="add" className="text-[18px]" />
                            공동구매 개설하기
                        </Link>
                        <Link
                            className="h-10 px-space-md bg-surface-container-lowest text-on-surface border border-outline-variant font-label-md text-label-md rounded flex items-center gap-space-xs hover:border-primary transition-colors"
                            href={ROUTES.profile}
                        >
                            <Icon name="settings" className="text-[18px]" />
                            회원정보 수정
                        </Link>
                    </div>
                </div>

                {/* Main Grid Layout: Sidebar + Content */}
                <div className="grid grid-cols-12 gap-gutter items-start">
                    <MyPageSidebar />

                    {/* Right Content Area (9 columns) */}
                    <div className="col-span-9 flex flex-col gap-space-xl">
                        {/* Top Metric Cards Grid */}
                        <div className="grid grid-cols-3 gap-space-md">
                            {METRIC_CARDS.map((card) => (
                                <div
                                    key={card.label}
                                    className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-space-xs">
                                            <span className="font-label-sm text-label-sm text-outline uppercase">{card.label}</span>
                                            <Icon name={card.icon} className="text-outline text-[18px]" />
                                        </div>
                                        <div className={`font-headline-lg text-headline-lg font-bold mt-1 ${card.valueClassName}`}>
                                            {card.value}
                                            {card.suffix && <span className="font-body-sm text-outline font-normal"> {card.suffix}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-space-lg pt-space-sm border-t border-surface-container">
                                        <span className={`font-caption text-caption ${card.noteClassName}`}>{card.note}</span>
                                        <Link className="font-label-sm text-label-sm text-primary hover:underline" href={card.href}>
                                            {card.action}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Active Group Order Summary Section */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                            <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">현재 참여 중인 공동구매 요약</h2>
                                    <p className="font-body-sm text-body-sm text-outline">개설된 공동구매의 MOQ 달성 현황 및 잔여 마감일 안내입니다.</p>
                                </div>
                                <Link
                                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-xs"
                                    href={ROUTES.groupPurchases}
                                >
                                    전체 보기 <Icon name="arrow_forward" className="text-[14px]" />
                                </Link>
                            </div>
                            <div className="flex flex-col gap-space-md">
                                {ACTIVE_GROUP_ORDERS.map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-space-md bg-surface-container-low border border-outline-variant rounded flex items-center justify-between gap-space-md"
                                    >
                                        <div className="flex items-center gap-space-md">
                                            <div className="w-16 h-16 bg-surface-container border border-outline-variant rounded flex items-center justify-center shrink-0">
                                                <Icon name={order.icon} className="text-outline text-[24px]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-space-xs mb-1">
                                                    <span className={`px-1.5 py-0.5 font-caption text-caption rounded ${order.categoryClassName}`}>
                                                        {order.category}
                                                    </span>
                                                    <span className="font-caption text-caption text-outline">[주문번호: {order.id}]</span>
                                                </div>
                                                <div className="font-label-md text-label-md text-on-surface font-bold">{order.title}</div>
                                                <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{order.price}</div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className={`font-label-sm text-label-sm font-bold ${order.statusClassName}`}>{order.status}</div>
                                            <div className="font-caption text-caption text-outline mt-1">{order.deadline}</div>
                                            <Link
                                                className="mt-2 h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm rounded hover:border-primary transition-colors inline-flex items-center"
                                                href={ROUTES.order(order.id)}
                                            >
                                                주문 상세
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders Summary List */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                            <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">최근 주문 요약 목록</h2>
                                    <p className="font-body-sm text-body-sm text-outline">최근 3개월간 체결된 주문 및 발송 내역입니다.</p>
                                </div>
                                <Link
                                    className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-space-xs"
                                    href={ROUTES.orders}
                                >
                                    전체 내역 <Icon name="arrow_forward" className="text-[14px]" />
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline-variant font-label-sm text-label-sm text-outline">
                                            <th className="py-3 px-2 font-medium">주문일자 / 번호</th>
                                            <th className="py-3 px-2 font-medium">상품명 / 옵션</th>
                                            <th className="py-3 px-2 font-medium">수량</th>
                                            <th className="py-3 px-2 font-medium">결제금액</th>
                                            <th className="py-3 px-2 font-medium text-right">주문상태</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                                        {RECENT_ORDERS.map((order) => (
                                            <tr key={order.id}>
                                                <td className="py-3 px-2 text-outline">
                                                    <div>{order.date}</div>
                                                    <div className="font-caption">{order.id}</div>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="font-label-md text-on-surface font-bold">{order.name}</div>
                                                    <div className="text-outline text-caption">{order.option}</div>
                                                </td>
                                                <td className="py-3 px-2">{order.quantity}</td>
                                                <td className="py-3 px-2 font-bold">{order.amount}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <span className={`inline-block px-2 py-0.5 font-caption rounded ${order.statusClassName}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
