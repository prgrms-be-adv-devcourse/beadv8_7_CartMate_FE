import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ProductOptions from './_components/ProductOptions';

export const metadata: Metadata = { title: '상품 상세 | TEAMBUY' };

const THUMBNAILS = [
    { label: '전면 (선택)', active: true },
    { label: '후면 뷰' },
    { label: '쇼츠/하의' },
    { label: '원단 텍스처' },
];

const DETAIL_TABS = ['1. 상품 상세 정보 (선택됨)', '2. 사이즈 가이드 & 실측 치수', '3. 공동구매 & 예치금 진행 절차', '4. Q&A (12)'];

const SPECS = [
    { label: '원단 구성', detail: '폴리에스터 92% + 엘라스테인 8% (Aero-Dry Mesh)', note: '국내 시험연구원 흡한속건 통과' },
    { label: '통기성 & 중량', detail: '하이브리드 메쉬 패널 적용 / 상의 기준 약 165g (M사이즈)', note: '하절기 야외 피치 최적화' },
    { label: '신축성 및 봉제', detail: '4방향 스트레치(4-Way Stretch) 무시접 오드람프 봉제', note: '마찰 최소화, 경기 중 당김 방지' },
    { label: '세탁 주의사항', detail: '30도 미온수 단독 손세탁 권장 / 건조기 사용 금지 / 다림질 금지', note: '전사 열전사 필름 보존' },
];

const SIZE_GUIDES = [
    {
        title: '상의 실측 (M / 95 기준)',
        unit: '단면 (cm)',
        description: '총장 71cm / 가슴단면 51cm / 화장 44cm. 슬림핏과 레귤러핏의 중간 피치 핏입니다.',
        note: '· 정사이즈 추천',
    },
    {
        title: '하의 실측 (M / 95 기준)',
        unit: '단면 (cm)',
        description: '총장 44cm / 허리단면 36cm(밴딩 조절) / 허벅지단면 32cm. 내부 이너 브리프 미포함.',
        note: '· 허리 밴드 스트링 적용',
    },
    {
        title: '팀 일괄 주문 추천 가이드',
        unit: '체형 가이드',
        description: '경기용 인체공학 패턴으로, 보호대 착용 또는 루즈한 핏을 선호하시는 경우 1사이즈 업을 권장합니다.',
        note: '· S(90)부터 2XL(110)까지 구성',
    },
];

const FAQS = [
    {
        question: '최소 수량(MOQ 10벌)을 채우지 못하면 어떻게 처리되나요?',
        answer: '공동구매 모집 기한 종료 시점까지 10벌 미만일 경우 주문은 자동으로 취소되며, 팀원들이 사전에 충전 및 결제한 예치금은 수수료 없이 100% 팀원 각자의 계정으로 자동 환불됩니다.',
    },
    {
        question: '팀원들이 각자 자신의 사이즈와 등번호를 직접 선택해 결제할 수 있나요?',
        answer: '네, 가능합니다. 팀장이 [공동구매 시작하기]를 누르면 고유 초대 링크가 생성됩니다. 팀원들은 해당 링크로 접속하여 본인의 사이즈, 등번호, 이니셜을 직접 입력하고 개인 예치금으로 분할 결제할 수 있습니다.',
    },
    {
        question: '제작 시작 후 사이즈 변경이나 추가 주문(추가 오더)이 가능한가요?',
        answer: "공동구매 마감 즉시 원단 재단 및 마킹 공정에 들어가므로 변경이 불가능합니다. 추후 신입 팀원 추가 주문은 기존 팀 등록 정보를 바탕으로 동일 단가가 적용되는 '추가 주문관'을 통해 신청하실 수 있습니다.",
    },
];

function CrossLines({ className = '' }: { className?: string }) {
    return (
        <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} xmlns="http://www.w3.org/2000/svg">
            <line stroke="#c6c6cd" strokeWidth="1" x1="0" x2="100%" y1="0" y2="100%" />
            <line stroke="#c6c6cd" strokeWidth="1" x1="100%" x2="0" y1="0" y2="100%" />
        </svg>
    );
}

function SectionTitle({ title, badge }: { title: string; badge: string }) {
    return (
        <div className="flex items-center gap-space-sm border-l-4 border-primary pl-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h2>
            <span className="font-caption text-caption text-secondary border border-outline-variant px-1.5 py-0.5">{badge}</span>
        </div>
    );
}

export default function ProductDetailPage() {
    return (
        <div className="w-full bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                <div className="flex flex-col w-full">
                    {/* 상단 네비게이션 빵가루 (Breadcrumb) */}
                    <div className="flex items-center gap-space-sm mb-space-md text-secondary font-label-sm text-label-sm">
                        <Link className="hover:text-primary hover:underline" href={ROUTES.home}>
                            스포츠
                        </Link>
                        <span className="text-outline-variant">/</span>
                        <Link className="hover:text-primary hover:underline" href={ROUTES.search}>
                            축구/풋살
                        </Link>
                        <span className="text-outline-variant">/</span>
                        <span className="text-primary font-bold">유니폼</span>
                    </div>
                    {/* 상단 좌우 2분할 레이아웃 (560px 이미지 vs 560px 주문 패널) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-start pb-space-xl">
                        {/* [좌측 50%] 이미지 영역 */}
                        <div className="flex flex-col gap-space-md">
                            {/* 메인 이미지 와이어프레임 박스 (560x560px 비율, 대각선 X 가이드) */}
                            <div className="relative w-full aspect-square bg-surface-container-low border border-outline-variant flex items-center justify-center overflow-hidden">
                                <CrossLines />
                                <span className="relative z-10 font-caption text-caption text-outline bg-surface-container-lowest px-1 border border-outline-variant font-semibold">
                                    [ MAIN IMAGE: 560 x 560 ]
                                </span>
                            </div>
                            {/* 썸네일 리스트 (100x100px 4개 배치) */}
                            <div className="grid grid-cols-4 gap-space-sm">
                                {THUMBNAILS.map((thumb) =>
                                    thumb.active ? (
                                        <button
                                            key={thumb.label}
                                            className="relative aspect-square bg-surface-container border-2 border-primary flex items-center justify-center p-1 cursor-pointer"
                                            type="button"
                                        >
                                            <CrossLines />
                                            <span className="relative z-10 font-caption text-caption text-on-surface bg-surface-container-lowest px-1 border border-outline-variant font-bold">
                                                {thumb.label}
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            key={thumb.label}
                                            className="relative aspect-square bg-surface-container-low border border-outline-variant flex items-center justify-center p-1 hover:border-outline cursor-pointer"
                                            type="button"
                                        >
                                            <CrossLines className="opacity-60" />
                                            <span className="relative z-10 font-caption text-caption text-secondary bg-surface-container-lowest px-1">{thumb.label}</span>
                                        </button>
                                    ),
                                )}
                            </div>
                            {/* 단체 주문 인증 스펙 뱃지 안내 바 */}
                            <div className="border border-outline-variant bg-surface-container-low p-space-sm flex items-center justify-between text-secondary font-caption text-caption">
                                <span className="flex items-center gap-1">
                                    <Icon name="verified" className="text-[16px]" /> KFA 규정 인쇄 호환 가능
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icon name="local_shipping" className="text-[16px]" /> 단체 무료 일괄 배송
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icon name="groups" className="text-[16px]" /> MOQ 10벌 이상
                                </span>
                            </div>
                        </div>
                        {/* [우측 50%] 상품 정보 및 주문 액션 영역 */}
                        <div className="flex flex-col gap-space-md bg-surface-container-lowest">
                            {/* 판매자 정보 */}
                            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container-highest">
                                <div className="flex items-center gap-space-xs">
                                    <span className="font-label-md text-label-md text-primary font-bold">FORWARD ATHLETICS</span>
                                    <span className="font-caption text-caption bg-surface-container text-on-surface-variant px-1.5 py-0.5 border border-outline-variant">공식 파트너사</span>
                                </div>
                                <button className="font-label-sm text-label-sm text-secondary hover:text-primary flex items-center gap-0.5 underline underline-offset-2" type="button">
                                    [판매자 정보 보기]
                                </button>
                            </div>
                            {/* 상품명 */}
                            <div>
                                <h1 className="font-headline-md text-headline-md text-on-surface leading-tight font-bold">
                                    [팀 패키지] 24/25 시즌 스트라이프 피치 저지 세트 (상의+하의)
                                </h1>
                                <p className="font-body-sm text-body-sm text-secondary mt-1">공식 경기 규격 충족 고기능성 팀 저지 세트 / 상의+하의 기본 구성</p>
                            </div>
                            {/* 가격 정보 블록 */}
                            <div className="border border-outline p-space-md bg-surface-container-low flex flex-col gap-space-xs">
                                <div className="flex items-baseline justify-between">
                                    <span className="font-label-md text-label-md text-on-surface font-bold">주문 단가 (1벌 기준)</span>
                                    <div className="text-right">
                                        <span className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                                            45,000<span className="text-headline-sm">원</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="pt-space-xs border-t border-outline-variant flex items-center justify-between text-secondary font-caption text-caption">
                                    <span>· 단체 최소 주문(MOQ) 10벌 충족 시 제작 확정</span>
                                    <span>· 팀 공동구매 시 최대 35% 단체 할인 적용</span>
                                </div>
                            </div>
                            <div className="border border-outline-variant bg-surface-container-low p-space-sm font-body-sm text-body-sm text-secondary flex items-start gap-space-xs">
                                <Icon name="info" className="text-[18px] text-primary shrink-0 mt-0.5" />
                                <p className="leading-snug">
                                    <strong className="text-on-surface">옵션 선택 안내:</strong> 개인 구매 시 아래에서 색상/사이즈를 바로 선택하며,{' '}
                                    <strong className="text-on-surface">공동구매 시작 시</strong> 개인별 옵션은 생성된 팀 공유 장바구니에서 참여 팀원들이 각자 직접 선택할 수 있습니다.
                                </p>
                            </div>
                            <ProductOptions />
                            {/* 핵심 CTA 버튼 2개 */}
                            <div className="flex flex-col gap-space-sm pt-space-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                                    <div className="flex gap-space-xs">
                                        <Link
                                            className="flex-1 h-11 border border-primary bg-surface-container-lowest text-primary hover:bg-surface-container-low font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors"
                                            href={ROUTES.cart}
                                        >
                                            <Icon name="shopping_cart" className="text-[18px]" />
                                            <span>개인 장바구니 담기</span>
                                        </Link>
                                        <Link
                                            className="flex-1 h-11 border border-primary bg-surface-container-highest text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm flex items-center justify-center gap-1 font-bold transition-colors"
                                            href={ROUTES.checkout}
                                        >
                                            <span>바로 개인 구매</span>
                                        </Link>
                                    </div>
                                    <Link
                                        className="h-11 border-2 border-primary bg-primary text-on-primary hover:bg-inverse-surface font-label-md text-label-md flex items-center justify-center gap-1.5 font-bold transition-colors"
                                        href={ROUTES.groupPurchaseNew}
                                    >
                                        <Icon name="group_add" className="text-[20px]" />
                                        <span>+ 공동구매 시작하기 (팀 공구방 개설)</span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-caption font-caption text-secondary">
                                    <div className="px-1">· 선택한 옵션으로 1건 즉시 일반 주문/결제가 진행됩니다.</div>
                                    <div className="px-1">· 팀 전용 공유 장바구니 방을 열어 팀원 초대 후 각자 옵션 선택 및 개별 예치금 결제를 진행합니다.</div>
                                </div>
                            </div>
                            {/* 하단 안내 문구 박스 */}
                            <div className="bg-surface-container-low border border-outline-variant p-space-sm text-secondary font-body-sm text-body-sm flex items-start gap-space-xs">
                                <Icon name="account_balance_wallet" className="text-[18px] text-primary shrink-0 mt-0.5" />
                                <p className="leading-snug">
                                    <strong>공동구매 혜택 안내:</strong> 팀 개설 후 링크를 공유하면 팀원별 예치금으로 개별 결제가 가능하며, 목표 수량 충족 시 즉시 공장 생산으로 전환됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* 하단 상세 설명 영역 (탭 메뉴 + 콘텐츠) */}
                    <div className="w-full mt-space-lg pt-space-md border-t-2 border-primary">
                        <div className="grid grid-cols-4 border-b border-outline-variant bg-surface-container-low text-center">
                            {DETAIL_TABS.map((tab, i) => (
                                <button
                                    key={tab}
                                    className={
                                        i === 0
                                            ? 'py-space-md font-label-md text-label-md border-b-2 border-primary bg-surface-container-lowest text-on-surface font-bold'
                                            : 'py-space-md font-label-md text-label-md text-secondary hover:text-on-surface border-b-2 border-transparent'
                                    }
                                    type="button"
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="py-space-xl flex flex-col gap-space-xl">
                            {/* 1) 원단 및 기능성 스펙 표 */}
                            <section className="flex flex-col gap-space-md">
                                <SectionTitle title="원단 소재 및 기능성 스펙" badge="SPECIFICATION SHEET" />
                                <div className="border border-outline-variant overflow-x-auto">
                                    <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                                        <thead>
                                            <tr className="bg-surface-container border-b border-outline-variant font-label-sm text-label-sm text-on-surface">
                                                <th className="p-space-sm border-r border-outline-variant w-1/4">구분</th>
                                                <th className="p-space-sm border-r border-outline-variant w-2/4">기술 규격 및 재질 상세</th>
                                                <th className="p-space-sm w-1/4">검증 기준 / 특징</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant">
                                            {SPECS.map((spec) => (
                                                <tr key={spec.label}>
                                                    <td className="p-space-sm bg-surface-container-low font-bold border-r border-outline-variant">{spec.label}</td>
                                                    <td className="p-space-sm border-r border-outline-variant">{spec.detail}</td>
                                                    <td className="p-space-sm text-secondary">{spec.note}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                            {/* 2) 사이즈 가이드 */}
                            <section className="flex flex-col gap-space-md" id="sizeGuideSection">
                                <SectionTitle title="사이즈 가이드 & 실측 치수 안내" badge="SIZE GUIDE" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                                    {SIZE_GUIDES.map((guide) => (
                                        <div key={guide.title} className="border border-outline-variant p-space-md bg-surface-container-lowest flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
                                                    <span className="font-label-md text-label-md font-bold">{guide.title}</span>
                                                    <span className="font-caption text-caption text-secondary">{guide.unit}</span>
                                                </div>
                                                <p className="font-body-sm text-body-sm text-secondary mt-space-xs">{guide.description}</p>
                                            </div>
                                            <span className="mt-space-sm font-caption text-caption text-primary font-bold">{guide.note}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            {/* 3) 팀 단체 주문 FAQ 박스 */}
                            <section className="flex flex-col gap-space-md">
                                <SectionTitle title="팀 단체 공동구매 FAQ" badge="FREQUENTLY ASKED" />
                                <div className="border border-outline-variant divide-y divide-outline-variant bg-surface-container-lowest">
                                    {FAQS.map((faq) => (
                                        <div key={faq.question} className="p-space-md">
                                            <div className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-space-xs mb-1">
                                                <span className="text-primary font-mono font-bold">Q.</span>
                                                {faq.question}
                                            </div>
                                            <p className="font-body-sm text-body-sm text-secondary pl-4">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
