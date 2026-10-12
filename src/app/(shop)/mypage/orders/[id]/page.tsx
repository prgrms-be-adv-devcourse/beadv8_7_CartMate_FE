import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '주문 상세 | TEAMBUY',
};

const ORDER_ID = 'ORD-20250308-94812';

type StepState = 'done' | 'current' | 'todo';

const STEPS: { no: string; label: string; note: string; state: StepState }[] = [
    { no: '01', label: '결제 대기', note: '03.08 완료', state: 'done' },
    { no: '02', label: '주문 확정', note: '03.08 완료', state: 'done' },
    { no: '03', label: '배송 준비', note: '진행 중', state: 'current' },
    { no: '04', label: '배송 중', note: '-', state: 'todo' },
    { no: '05', label: '배송 완료', note: '-', state: 'todo' },
    { no: '06', label: '구매확정', note: '-', state: 'todo' },
];

const STEP_STYLE: Record<StepState, { circle: string; label: string; note: string }> = {
    done: {
        circle: 'w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md mb-space-xs',
        label: 'font-label-sm text-label-sm text-on-surface font-bold',
        note: 'font-caption text-caption text-outline mt-0.5',
    },
    current: {
        circle: 'w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-primary text-primary flex items-center justify-center font-label-md text-label-md mb-space-xs shadow-sm',
        label: 'font-label-sm text-label-sm text-primary font-bold',
        note: 'font-caption text-caption text-primary mt-0.5',
    },
    todo: {
        circle: 'w-10 h-10 rounded-full bg-surface-container border border-outline-variant text-outline flex items-center justify-center font-label-md text-label-md mb-space-xs',
        label: 'font-label-sm text-label-sm text-outline',
        note: 'font-caption text-caption text-outline mt-0.5',
    },
};

const ORDER_MENU = [
    { label: '주문 상세 내역', href: ROUTES.order(ORDER_ID), active: true },
    { label: '배송지 변경', href: ROUTES.addresses, active: false },
    { label: '결제 영수증 조회', href: '#', active: false },
    { label: '교환 / 환불 신청', href: ROUTES.orderClaim(ORDER_ID), active: false },
    { label: '1:1 문의하기', href: ROUTES.inquiries, active: false },
];

const GROUP_SUMMARY = [
    { label: '프로젝트명:', value: 'FC서울 오피셜 유니폼 공동구매', className: 'font-bold text-on-surface' },
    { label: '목표 인원:', value: '20명 (현재 18명 참여)', className: 'text-on-surface' },
    { label: '내 옵션:', value: 'L사이즈 / NO.10 / 마킹포함', className: 'text-on-surface' },
    { label: '달성률:', value: '90% (2명 남음)', className: 'text-primary font-bold' },
];

const SELLER_BUNDLES = [
    {
        icon: 'storefront',
        seller: '판매자: (주)스포츠아카이브',
        shippingType: '본사 직영 배송',
        tracking: '송장 조회 (CJ대한통운 6821...)',
        subtotal: '₩ 80,000',
        shippingNote: '(택배비 무료)',
        items: [
            {
                category: '축구 / 유니폼',
                sku: '품번: SA-UNI-2025-01',
                name: '[공동구매] 2025 프리미엄 매치 홈 유니폼 세트',
                option: '옵션: [컬러] 네이비 / [사이즈] L / [마킹] KIM #10',
                price: '₩ 68,000',
                quantity: '수량: 1벌',
            },
            {
                category: '액세서리 / 양말',
                sku: '품번: SA-ACC-SOCK-02',
                name: '프로페셔널 논슬립  grip 삭스',
                option: '옵션: [컬러] 화이트 / [사이즈] FREE (255-280mm)',
                price: '₩ 12,000',
                quantity: '수량: 1개',
            },
        ],
    },
    {
        icon: 'sports_soccer',
        seller: '판매자: (주)그린스포츠 기어',
        shippingType: '업체 개별 배송',
        tracking: '송장 조회 (우체국택배 5214...)',
        subtotal: '₩ 145,000',
        shippingNote: '(택배비 3,000원 별도)',
        items: [
            {
                category: '장비 / 축구공',
                sku: '품번: GS-BALL-FIFA-PRO',
                name: 'FIFA 규격 공인 매치볼 (팀 전용 각인 포함)',
                option: '옵션: [규격] 5호 / [팀명 각인] FC서울 아마추어',
                price: '₩ 145,000',
                quantity: '수량: 1개',
            },
        ],
    },
];

const DELIVERY_INFO = [
    { label: '수령인', value: '김팀장 (FC서울 동호회)', className: 'font-bold text-on-surface' },
    { label: '연락처', value: '010-1234-5678' },
    { label: '배송주소', value: '[06142] 서울특별시 강남구 테헤란로 152 강남파이낸스센터 14층 팀바이 회의실' },
    { label: '배송메모', value: '문 앞에 놓아주시고 경비실 호출 부탁드립니다.' },
];

const PAYMENT_INFO = [
    { label: '총 상품금액', value: '₩ 225,000', className: 'text-on-surface' },
    { label: '공동구매 할인', value: '- ₩ 25,000', className: 'text-primary font-bold' },
    { label: '팀 예치금 사용', value: '- ₩ 50,000', className: 'text-on-surface' },
    { label: '배송비', value: '₩ 3,000', className: 'text-on-surface' },
];

function ImagePlaceholder() {
    return (
        <div className="w-20 h-20 bg-surface-container border border-outline-variant flex items-center justify-center relative overflow-hidden flex-shrink-0">
            <svg className="absolute inset-0 w-full h-full text-outline-variant" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line stroke="currentColor" strokeWidth="1" x1="0" x2="100" y1="0" y2="100" />
                <line stroke="currentColor" strokeWidth="1" x1="100" x2="0" y1="0" y2="100" />
            </svg>
            <span className="font-caption text-caption text-outline z-10">80 x 80</span>
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Order Progress Step Bar */}
            <div className="w-full bg-surface-container-lowest py-space-xl px-gutter mb-space-xl border-b border-outline-variant">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-center justify-between mb-space-md">
                        <div className="flex items-center gap-space-sm">
                            <span className="font-caption text-caption text-outline">[주문번호: {ORDER_ID}]</span>
                            <span className="font-caption text-caption px-space-xs py-0.5 bg-primary text-on-primary">공동구매 주문</span>
                        </div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">주문일시: 2025.03.08 14:22:10</div>
                    </div>
                    <div className="grid grid-cols-6 gap-space-sm relative">
                        {STEPS.map((step) => (
                            <div key={step.no} className="flex flex-col items-center relative z-10">
                                <div className={STEP_STYLE[step.state].circle}>{step.no}</div>
                                <span className={STEP_STYLE[step.state].label}>{step.label}</span>
                                <span className={STEP_STYLE[step.state].note}>{step.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Left Sidebar + Right Content Grid */}
            <div className="max-w-[1200px] mx-auto px-gutter w-full mb-space-xl grid grid-cols-12 gap-gutter">
                {/* Left Sidebar (3 Columns) */}
                <aside className="col-span-3 flex flex-col gap-space-lg">
                    {/* 주문 관리 메뉴 */}
                    <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded">
                        <div className="font-label-md text-label-md text-on-surface mb-space-md pb-space-xs border-b border-surface-container">주문 관리 메뉴</div>
                        <nav className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                            {ORDER_MENU.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={
                                        item.active
                                            ? 'p-space-xs bg-surface-container text-primary font-bold rounded'
                                            : 'p-space-xs hover:bg-surface-container hover:text-on-surface transition-colors rounded'
                                    }
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 공동구매 참여 요약 */}
                    <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded">
                        <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-surface-container">
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">공동구매 참여 요약</span>
                            <span className="font-caption text-caption px-1.5 py-0.5 bg-surface-container text-primary">모집중</span>
                        </div>
                        <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                            {GROUP_SUMMARY.map((row) => (
                                <div key={row.label} className="flex justify-between">
                                    <span className="text-outline">{row.label}</span>
                                    <span className={row.className}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded overflow-hidden mb-space-sm">
                            <div className="bg-primary h-full w-[90%]" />
                        </div>
                        <div className="font-caption text-caption text-outline text-center">목표 수량 달성 시 즉시 할인 단가 적용</div>
                    </div>

                    {/* 고객센터 안내 */}
                    <div className="bg-surface-container border border-outline-variant p-space-md rounded">
                        <div className="font-label-sm text-label-sm font-bold text-on-surface mb-1">고객센터 안내</div>
                        <p className="font-caption text-caption text-outline mb-space-sm">주문 및 커스텀 인쇄 관련 문의는 팀바이 전담 상담사에게 연락주세요.</p>
                        <div className="font-headline-sm text-headline-sm text-primary font-bold">1644-0000</div>
                    </div>
                </aside>

                {/* Right Content (9 Columns) */}
                <div className="col-span-9 flex flex-col gap-space-lg">
                    {SELLER_BUNDLES.map((bundle) => (
                        <div key={bundle.seller} className="bg-surface-container-lowest border border-outline-variant rounded p-space-md">
                            {/* Seller Header */}
                            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
                                <div className="flex items-center gap-space-sm">
                                    <Icon name={bundle.icon} className="text-[18px] text-primary" />
                                    <span className="font-label-md text-label-md text-on-surface font-bold">{bundle.seller}</span>
                                    <span className="font-caption text-caption px-space-xs py-0.5 bg-surface-container text-outline">{bundle.shippingType}</span>
                                </div>
                                <div className="flex items-center gap-space-xs">
                                    <button
                                        className="h-8 px-space-sm border border-outline-variant bg-surface-container-lowest hover:bg-surface-container font-caption text-caption text-on-surface transition-colors flex items-center gap-1"
                                        type="button"
                                    >
                                        <Icon name="local_shipping" className="text-[14px]" />
                                        {bundle.tracking}
                                    </button>
                                </div>
                            </div>

                            {/* Product Items */}
                            {bundle.items.map((item, index) => (
                                <div
                                    key={item.sku}
                                    className={`flex gap-space-md items-center py-space-sm${index < bundle.items.length - 1 ? ' border-b border-surface-container' : ''}`}
                                >
                                    <ImagePlaceholder />
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-space-xs mb-1">
                                            <span className="font-caption text-caption px-1 bg-surface-container text-on-surface-variant">{item.category}</span>
                                            <span className="font-caption text-caption text-outline">{item.sku}</span>
                                        </div>
                                        <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">{item.name}</div>
                                        <div className="font-body-sm text-body-sm text-outline">{item.option}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-headline-sm text-headline-sm text-primary font-bold">{item.price}</div>
                                        <div className="font-body-sm text-body-sm text-outline">{item.quantity}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Seller Bundle Action Footer */}
                            <div className="mt-space-md pt-space-sm border-t border-surface-container flex items-center justify-between">
                                <div className="font-body-sm text-body-sm text-outline">
                                    묶음배송 상품 합계: <span className="font-bold text-on-surface">{bundle.subtotal}</span> {bundle.shippingNote}
                                </div>
                                <div className="flex items-center gap-space-xs">
                                    <Link
                                        href={ROUTES.orderClaim(ORDER_ID)}
                                        className="h-9 px-space-md border border-outline-variant bg-surface-container-lowest hover:bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors inline-flex items-center"
                                    >
                                        교환·환불 요청
                                    </Link>
                                    <button
                                        className="h-9 px-space-md bg-primary text-on-primary hover:bg-on-primary-fixed-variant font-label-sm text-label-sm transition-colors"
                                        type="button"
                                    >
                                        구매확정
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Payment & Delivery Details Section */}
                    <div className="grid grid-cols-2 gap-gutter">
                        {/* Delivery Address Box */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded">
                            <div className="font-label-md text-label-md text-on-surface font-bold mb-space-md pb-space-xs border-b border-surface-container">배송지 정보</div>
                            <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                                {DELIVERY_INFO.map((row) => (
                                    <div key={row.label} className="flex">
                                        <span className="w-24 text-outline">{row.label}</span>
                                        <span className={row.className}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Summary Box */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded">
                            <div className="font-label-md text-label-md text-on-surface font-bold mb-space-md pb-space-xs border-b border-surface-container">결제금액 정보</div>
                            <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                                {PAYMENT_INFO.map((row) => (
                                    <div key={row.label} className="flex justify-between">
                                        <span className="text-outline">{row.label}</span>
                                        <span className={row.className}>{row.value}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between pt-space-xs mt-space-xs border-t border-surface-container font-headline-sm text-headline-sm text-primary font-bold">
                                    <span>최종 결제금액</span>
                                    <span>₩ 153,000</span>
                                </div>
                                <div className="text-right font-caption text-caption text-outline">(신한가상계좌 입금완료)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
