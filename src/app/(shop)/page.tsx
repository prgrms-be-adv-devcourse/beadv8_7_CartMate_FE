import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import AlertButton from './_components/AlertButton';
import SportCategoryBar from './_components/SportCategoryBar';
import WireframeImage from './_components/WireframeImage';

export const metadata: Metadata = { title: '홈 | TEAMBUY' };

const SPORT_CHIPS = [
    { label: '전체 (ALL)', count: 128, active: true },
    { label: '축구', count: 48 },
    { label: '풋살', count: 32 },
    { label: '야구', count: 21 },
    { label: '농구', count: 16 },
    { label: '러닝', count: 11 },
];

const QUICK_CATEGORIES = [
    { title: '유니폼', icon: 'checkroom', imageLabel: '[ IMG: UNIFORM ]', description: '축구 / 풋살 / 농구 / 야구 팀 유니폼', href: ROUTES.groupPurchaseNew },
    { title: '신발', icon: 'sports_gymnastics', imageLabel: '[ IMG: FOOTWEAR ]', description: '축구화 / 풋살화 / 러닝화 단체특가', href: ROUTES.groupPurchases },
    { title: '공', icon: 'sports_soccer', imageLabel: '[ IMG: BALLS ]', description: '공인구 매치볼 / 팀 훈련용 벌크 팩', href: ROUTES.groupPurchases },
    { title: '보호대/기어', icon: 'shield', imageLabel: '[ IMG: GEAR ]', description: '신가드 / 테이핑 롤 / 골키퍼 장갑', href: ROUTES.groupPurchases },
];

const SORT_TABS = ['추천순', '인기 마감순', '할인율 높은순', '최저가순'];

const PRODUCTS = [
    {
        id: 1,
        discount: '25% OFF',
        icon: 'sports_soccer',
        imageLabel: '[ 250 x 250 : BALL ]',
        category: '축구 | FIFA 공인구',
        moq: 'MOQ 5구 이상',
        name: '[MATCH-1] 하이퍼비전 프로 공인구 5호',
        description: '고탄력 하이퍼 쉘 32패널 접착 공인구',
        originalPrice: '개인구매: 52,000원',
        teamPrice: '팀 공구가: 39,000원',
        progress: '80%',
        current: '현재 4/5구 모집',
        remaining: '1구 남음',
    },
    {
        id: 2,
        discount: '18% OFF',
        icon: 'sports_martial_arts',
        imageLabel: '[ 250 x 250 : SHOES ]',
        category: '풋살 | 터프화(TF)',
        moq: 'MOQ 8족 이상',
        name: '[VELOX] 프로 터프 TF 풋살화',
        description: '내마모성 스터드 & 논마킹 생고무 아웃솔',
        originalPrice: '개인구매: 89,000원',
        teamPrice: '팀 공구가: 72,980원',
        progress: '50%',
        current: '현재 4/8족 모집',
        remaining: '4족 남음',
    },
    {
        id: 3,
        discount: '20% OFF',
        icon: 'sports_kabaddi',
        imageLabel: '[ 250 x 250 : GUARD ]',
        category: '보호대 | 정강이 보호대',
        moq: 'MOQ 10세트',
        name: '[SHIELD] 카본 슬리브 일체형 신가드',
        description: '통기성 컴프레션 슬리브 + 초경량 플레이트',
        originalPrice: '개인구매: 28,000원',
        teamPrice: '팀 공구가: 22,400원',
        progress: '90%',
        current: '현재 9/10세트 모집',
        remaining: '1세트 남음 (마감임박)',
    },
    {
        id: 4,
        discount: '15% OFF',
        icon: 'sports_baseball',
        imageLabel: '[ 250 x 250 : BASEBALL ]',
        category: '야구 | 배팅 글러브',
        moq: 'MOQ 6쌍 이상',
        name: '[STRIKE] 천연 양가죽 프로 타격장갑',
        description: '그립력 극대화 프리미엄 엠보싱 레더',
        originalPrice: '개인구매: 45,000원',
        teamPrice: '팀 공구가: 38,250원',
        progress: '33%',
        current: '현재 2/6쌍 모집',
        remaining: '4쌍 남음',
    },
    {
        id: 5,
        discount: '12% OFF',
        icon: 'sports_basketball',
        imageLabel: '[ 250 x 250 : HOOP ]',
        category: '농구 | 인도어 공인구',
        moq: 'MOQ 4구 이상',
        name: '[COURT-PRO] 합성가죽 농구공 7호',
        description: '딥채널 디자인 우수한 핸들링 터치감',
        originalPrice: '개인구매: 65,000원',
        teamPrice: '팀 공구가: 57,200원',
        progress: '75%',
        current: '현재 3/4구 모집',
        remaining: '1구 남음',
    },
    {
        id: 6,
        discount: '30% OFF',
        icon: 'medical_services',
        imageLabel: '[ 250 x 250 : TAPE ]',
        category: '기어 | 테이핑 벌크박스',
        moq: 'MOQ 3박스 이상',
        name: '[MEDIC] 키네시올로지 테이프 벌크팩 (24롤)',
        description: '통기성 방수 면소재 고정력 강화 테이프',
        originalPrice: '개인구매: 96,000원',
        teamPrice: '팀 공구가: 67,200원',
        progress: '66%',
        current: '현재 2/3박스 모집',
        remaining: '1박스 남음',
    },
    {
        id: 7,
        discount: '22% OFF',
        icon: 'directions_run',
        imageLabel: '[ 250 x 250 : RUN ]',
        category: '러닝 | 크루 단체 빕스',
        moq: 'MOQ 15장 이상',
        name: '[PACE] 야간 반사 리플렉티브 조끼 팩',
        description: '고휘도 3M 반사 밴드 적용 통풍 메쉬 조끼',
        originalPrice: '개인구매: 18,000원',
        teamPrice: '팀 공구가: 14,040원',
        progress: '46%',
        current: '현재 7/15장 모집',
        remaining: '8장 남음',
    },
    {
        id: 8,
        discount: '16% OFF',
        icon: 'sports_soccer',
        imageLabel: '[ 250 x 250 : SOCKS ]',
        category: '축구/풋살 | 논슬립 삭스',
        moq: 'MOQ 20켤레',
        name: '[GRIP] 하이그립 실리콘 미끄럼방지 양말',
        description: '발바닥 듀얼 쿠션 & 3D 아치 서포트',
        originalPrice: '개인구매: 12,000원',
        teamPrice: '팀 공구가: 10,080원',
        progress: '100%',
        current: '현재 20/20켤레 달성',
        remaining: '발주 가능 (추가모집)',
        remainingClassName: 'text-primary',
    },
];

const ESCROW_STEPS = [
    {
        step: 'STEP 01',
        icon: 'add_box',
        title: '공구 방 개설 & 옵션 모집',
        description: '팀 리더가 목표 제품 및 최소 수량(MOQ)을 설정하고 고유 초대 링크를 생성하여 팀원들에게 배포합니다.',
        note: '· 마킹 로스터 폼 실시간 취합',
    },
    {
        step: 'STEP 02',
        icon: 'lock',
        title: '팀원 개별 예치금 동결',
        description: '팀원이 각자의 사이즈와 마킹을 선택한 뒤 본인 계정 예치금으로 각자 결제 승인하여 안전하게 동결(Escrow Holding)됩니다.',
        note: '· 총무 사비 선결제 불필요',
    },
    {
        step: 'STEP 03',
        icon: 'precision_manufacturing',
        title: 'MOQ 달성 시 자동 발주',
        description: '목표 인원이 100% 충족되는 즉시 동결 금액이 정산되며, 공식 파트너 브랜드 공장으로 생산 발주서가 자동 전송됩니다.',
        note: '· 발주 직후 송장 번호 개별 알림',
    },
    {
        step: 'STEP 04',
        icon: 'history',
        title: '미달 시 100% 자동 환불',
        description: '지정된 마감 기한 내에 최소 수량이 충족되지 않으면 수수료 차감 없이 즉시 팀원 전원 계좌로 100% 자동 반환됩니다.',
        note: '· 환불 수수료 0원 보장',
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col w-full bg-surface-container-lowest">
            <SportCategoryBar activeSport="전체" />
            {/* Main Content Wrapper: Desktop 1200px wireframe layout */}
            <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
                {/* SECTION 1: Category Filter Chips & Wireframe Status Indicator */}
                <section className="flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-xs border-b border-outline-variant">
                        <div className="flex items-center gap-space-sm">
                            <span className="font-caption text-caption uppercase text-outline tracking-wider bg-surface-container px-space-xs py-0.5 border border-outline-variant">SPORT SELECTOR</span>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">종목별 장비 탐색</h2>
                        </div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span>실시간 공구 세션 동기화 모드</span>
                        </div>
                    </div>
                    {/* Filter Chips */}
                    <div className="flex flex-wrap items-center gap-space-xs">
                        {SPORT_CHIPS.map((chip) =>
                            chip.active ? (
                                <button
                                    key={chip.label}
                                    className="px-space-md py-1.5 font-label-sm text-label-sm bg-primary text-on-primary border border-primary transition-colors flex items-center gap-1"
                                    type="button"
                                >
                                    <span>{chip.label}</span>
                                    <span className="text-caption opacity-70">{chip.count}</span>
                                </button>
                            ) : (
                                <button
                                    key={chip.label}
                                    className="px-space-md py-1.5 font-label-sm text-label-sm bg-surface-container-lowest text-on-surface border border-outline-variant hover:border-primary transition-colors flex items-center gap-1"
                                    type="button"
                                >
                                    <span>{chip.label}</span>
                                    <span className="text-caption text-outline">{chip.count}</span>
                                </button>
                            ),
                        )}
                    </div>
                    {/* Quick Category Navigation Cards (4 items) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mt-space-xs">
                        {QUICK_CATEGORIES.map((card) => (
                            <Link
                                key={card.title}
                                className="group flex flex-col bg-surface-container-lowest border border-outline-variant p-space-md hover:border-primary transition-all"
                                href={card.href}
                            >
                                <WireframeImage>
                                    <div className="relative z-10 flex flex-col items-center gap-1 text-center px-space-xs">
                                        <Icon name={card.icon} className="text-outline text-[32px] group-hover:text-primary transition-colors" />
                                        <span className="font-caption text-caption text-outline font-semibold tracking-wide">{card.imageLabel}</span>
                                    </div>
                                </WireframeImage>
                                <div className="mt-space-md flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-headline-sm text-headline-sm text-on-surface group-hover:underline">{card.title}</span>
                                        <Icon name="arrow_forward" className="text-outline group-hover:text-primary text-[18px]" />
                                    </div>
                                    <p className="font-body-sm text-body-sm text-outline">{card.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* SECTION 2: Active Roster Purchase Section */}
                <section className="border-2 border-primary bg-surface-container-lowest p-space-lg flex flex-col gap-space-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-outline-variant pb-space-md">
                        <div className="flex flex-wrap items-center gap-space-sm">
                            <span className="bg-primary text-on-primary font-caption text-caption px-space-sm py-0.5 uppercase tracking-wider font-semibold">진행 중인 내 팀 공동구매</span>
                            <span className="font-caption text-caption text-outline border border-outline-variant px-space-xs py-0.5">주문코드: #ORD-202410-0982</span>
                            <span className="font-caption text-caption text-on-surface bg-surface-container px-space-xs py-0.5 border border-outline-variant">축구 | FC 에이스</span>
                        </div>
                        <div className="flex items-center gap-space-sm">
                            <span className="inline-flex items-center gap-1 bg-surface-container-high px-space-sm py-0.5 font-label-sm text-label-sm text-on-surface border border-outline">
                                <Icon name="timer" className="text-[16px]" />
                                <span>
                                    D-2 남은 시간: <strong className="font-bold">43:18:18</strong>
                                </span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-primary text-on-primary px-space-sm py-0.5 font-label-sm text-label-sm">
                                <span>모집 진행중 (8/11명 참여)</span>
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                        {/* Left Product Wireframe Card (4 cols) */}
                        <div className="lg:col-span-4 border border-outline-variant p-space-md bg-surface-container-low flex flex-col gap-space-sm">
                            <WireframeImage className="bg-surface-container-lowest">
                                <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                                    <Icon name="sd_storage" className="text-outline text-[36px]" />
                                    <span className="font-caption text-caption text-outline font-semibold">[ 250 x 250 PRODUCT PREVIEW ]</span>
                                </div>
                            </WireframeImage>
                            <div className="flex flex-col gap-1">
                                <span className="font-caption text-caption text-outline uppercase">[PRO MATCH] 24/25 커스텀 스트라이프 저지 세트</span>
                                <div className="text-body-sm font-body-sm text-on-surface border-t border-outline-variant pt-space-xs mt-1">
                                    <div className="flex justify-between">
                                        <span className="text-outline">선택 옵션:</span>
                                        <span className="font-semibold text-on-surface">사이즈: L (100) / 색상: 블랙</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Order Status & Progress (8 cols) */}
                        <div className="lg:col-span-8 flex flex-col justify-between h-full gap-space-md">
                            <div className="flex flex-col gap-space-sm">
                                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                                    <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">FC 에이스 주말 정기전 커스텀 유니폼 공동구매</h3>
                                    <span className="font-caption text-caption bg-surface text-on-surface-variant border border-outline-variant px-space-sm py-0.5">MOQ 충족 기준: 11벌</span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    최소 단체 발주 수량(MOQ) 충족 시 관리자가 검수 후 공장 커스텀 제작에 착수합니다. 미달 시 모집 마감 시점에 전액 100% 예치금으로 자동 환불됩니다.
                                </p>
                                {/* Progress Meter Box */}
                                <div className="border border-outline-variant bg-surface-container-lowest p-space-md flex flex-col gap-space-sm mt-space-xs">
                                    <div className="flex items-center justify-between font-label-md text-label-md">
                                        <span className="flex items-center gap-1.5">
                                            <Icon name="group" className="text-[18px]" />
                                            <span>최소 수량 충족률</span>
                                        </span>
                                        <span className="text-on-surface font-bold text-headline-sm">
                                            72.7% <span className="font-body-sm font-normal text-outline">(8 / 11명)</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-surface-container-highest border border-outline-variant relative overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '72.7%' }} />
                                    </div>
                                    <div className="flex items-center justify-between font-caption text-caption text-outline">
                                        <span>현재 확정: 8명 (예치금 홀딩 완료)</span>
                                        <span className="text-on-surface font-semibold underline underline-offset-2">3명 추가 참여 시 자동 최종 발주 진행</span>
                                    </div>
                                </div>
                                {/* Escrow Status Box */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mt-space-xs">
                                    <div className="border border-outline-variant bg-surface-container-low p-space-sm flex items-start gap-space-sm">
                                        <Icon name="verified_user" className="text-[20px] text-primary" />
                                        <div className="flex flex-col">
                                            <span className="font-caption text-caption text-outline uppercase">내 결제 상태 (ESCROW)</span>
                                            <span className="font-label-md text-label-md text-on-surface font-bold">결제 완료 (42,000원 홀딩 중)</span>
                                            <span className="font-caption text-caption text-outline">발주 확정 전까지 안전 예치 보호</span>
                                        </div>
                                    </div>
                                    <div className="border border-outline-variant bg-surface-container-low p-space-sm flex items-start gap-space-sm">
                                        <Icon name="pending_actions" className="text-[20px] text-outline" />
                                        <div className="flex flex-col">
                                            <span className="font-caption text-caption text-outline uppercase">팀원 참여 현황</span>
                                            <span className="font-label-md text-label-md text-on-surface font-bold">미결제 초대 대기 3명</span>
                                            <span className="font-caption text-caption text-outline">박민수, 송지훈, 최건우 링크 미등록</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom CTA Action Buttons */}
                            <div className="flex flex-wrap items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant">
                                <AlertButton
                                    className="h-11 px-space-md border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-1.5"
                                    message="공동구매 초대 링크가 클립보드에 복사되었습니다: https://teambuy.internal/roster/join?code=ORD-202410-0982"
                                >
                                    <Icon name="share" className="text-[18px]" />
                                    <span>[초대 링크 복사]</span>
                                </AlertButton>
                                <Link
                                    className="h-11 px-space-lg bg-primary text-on-primary font-label-md text-label-md border border-primary hover:bg-on-surface-variant flex items-center gap-1.5 transition-colors"
                                    href={ROUTES.groupPurchase()}
                                >
                                    <Icon name="open_in_new" className="text-[18px]" />
                                    <span>[공동구매 방 바로가기]</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: Real-Time Bulk Catalog (4-Column Wireframe Grid) */}
                <section className="flex flex-col gap-space-lg">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-outline-variant pb-space-sm">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-space-xs">
                                <span className="font-caption text-caption uppercase text-outline tracking-wider bg-surface-container px-space-xs py-0.5 border border-outline-variant">BULK CATALOG</span>
                                <span className="font-caption text-caption text-outline">전체 8개 실시간 공구 개설 가능</span>
                            </div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">실시간 모집 중인 장비 목록</h2>
                        </div>
                        {/* Sorting Filter Tabs */}
                        <div className="flex items-center gap-1 border border-outline-variant bg-surface-container-lowest p-0.5">
                            {SORT_TABS.map((tab, i) => (
                                <button
                                    key={tab}
                                    className={
                                        i === 0
                                            ? 'px-space-sm py-1 font-label-sm text-label-sm bg-primary text-on-primary'
                                            : 'px-space-sm py-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                                    }
                                    type="button"
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* 4-Column Product Grid (8 Items) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
                        {PRODUCTS.map((product) => (
                            <div
                                key={product.id}
                                className="border border-outline-variant bg-surface-container-lowest p-space-md flex flex-col justify-between hover:border-primary transition-all"
                            >
                                <Link href={ROUTES.product(product.id)} className="flex flex-col gap-space-sm">
                                    <WireframeImage>
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="bg-primary text-on-primary font-caption text-caption px-1.5 py-0.5 font-bold">{product.discount}</span>
                                        </div>
                                        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
                                            <Icon name={product.icon} className="text-outline text-[28px]" />
                                            <span className="font-caption text-caption text-outline font-semibold">{product.imageLabel}</span>
                                        </div>
                                    </WireframeImage>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-caption text-caption text-outline">{product.category}</span>
                                            <span className="font-caption text-caption bg-surface-container px-1 border border-outline-variant text-on-surface">{product.moq}</span>
                                        </div>
                                        <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{product.name}</h3>
                                        <p className="font-body-sm text-body-sm text-outline line-clamp-1">{product.description}</p>
                                    </div>
                                    <div className="border-t border-outline-variant pt-space-xs flex flex-col gap-1">
                                        <div className="flex items-baseline justify-between">
                                            <span className="font-caption text-caption text-outline line-through">{product.originalPrice}</span>
                                            <span className="font-label-md text-label-md text-on-surface font-bold">{product.teamPrice}</span>
                                        </div>
                                        <div className="w-full bg-surface-container h-1.5 overflow-hidden">
                                            <div className="bg-primary h-full" style={{ width: product.progress }} />
                                        </div>
                                        <div className="flex justify-between font-caption text-caption text-outline">
                                            <span>{product.current}</span>
                                            <span className={`text-on-surface font-semibold${product.remainingClassName ? ` ${product.remainingClassName}` : ''}`}>
                                                {product.remaining}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                {/* Dual Buttons */}
                                <div className="grid grid-cols-2 gap-space-xs mt-space-md pt-space-xs border-t border-surface-container-highest">
                                    <AlertButton
                                        className="h-9 px-space-xs border border-outline-variant bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors text-center"
                                        message="개인 단품 장바구니에 담겼습니다."
                                    >
                                        [개인구매]
                                    </AlertButton>
                                    <Link
                                        className="h-9 px-space-xs bg-primary text-on-primary font-label-sm text-label-sm border border-primary hover:bg-on-surface-variant transition-colors flex items-center justify-center text-center"
                                        href={ROUTES.groupPurchases}
                                    >
                                        [공동구매]
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 4: Teambuy Escrow Payment Process Guide */}
                <section className="border border-outline-variant bg-surface-container-low p-space-lg flex flex-col gap-space-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-outline-variant pb-space-sm">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-space-xs">
                                <span className="font-caption text-caption uppercase text-outline tracking-wider bg-surface-container px-space-xs py-0.5 border border-outline-variant">SAFETY PROTOCOL</span>
                                <span className="font-caption text-caption text-outline">먹튀 방지 &amp; 총무 부담 제로</span>
                            </div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">팀바이(TEAMBUY) 예치금 에스크로 결제 프로세스 안내</h2>
                        </div>
                        <Link className="text-on-surface font-label-sm text-label-sm underline underline-offset-4 hover:text-outline flex items-center gap-1" href={ROUTES.deposit}>
                            <span>[예치금 이용안내 상세 가이드]</span>
                            <Icon name="arrow_forward" className="text-[16px]" />
                        </Link>
                    </div>
                    {/* 4-Step Flow Protocol Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                        {ESCROW_STEPS.map((step) => (
                            <div key={step.step} className="bg-surface-container-lowest border border-outline-variant p-space-md flex flex-col gap-space-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-caption text-caption uppercase px-space-xs py-0.5 bg-primary text-on-primary font-bold">{step.step}</span>
                                    <Icon name={step.icon} className="text-outline text-[22px]" />
                                </div>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface">{step.title}</h3>
                                <p className="font-body-sm text-body-sm text-outline">{step.description}</p>
                                <div className="mt-auto pt-space-xs border-t border-surface-container-highest text-caption font-caption text-outline">{step.note}</div>
                            </div>
                        ))}
                    </div>
                    {/* Escrow License & Security Notice Banner */}
                    <div className="border border-outline-variant bg-surface-container-lowest p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md">
                            <Icon name="encrypted" className="text-primary text-[28px] shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">금융결제망 연동 안전거래 에스크로 등록 완료</span>
                                <span className="font-caption text-caption text-outline">
                                    전자금융거래법 제28조 제2항 제1호에 따른 전자상거래 결제대금예치업 등록번호: [제 02-000-0000호]
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <a className="font-label-sm text-label-sm text-on-surface px-space-sm py-1 border border-outline-variant hover:bg-surface-container transition-colors inline-block" href="#">
                                [에스크로 약관 확인]
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
