import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ChipGroup from './_components/ChipGroup';
import CopyLinkButton from './_components/CopyLinkButton';
import Countdown from './_components/Countdown';
import WirePlaceholder from './_components/WirePlaceholder';

export const metadata: Metadata = {
    title: '진행 중인 내 팀 공동구매 | TEAMBUY',
};

const SPORT_CHIPS = [
    { label: '전체 (ALL)', icon: 'sports_soccer' },
    { label: '축구' },
    { label: '풋살' },
    { label: '야구' },
    { label: '농구' },
    { label: '러닝' },
];

const CATEGORY_SHORTCUTS = [
    { icon: 'apparel', tag: '[ROSTER BUILDER]', title: '유니폼 커스텀', desc: '배번 / 로고 / 마킹 로스터', href: ROUTES.groupPurchaseNew },
    { icon: 'roller_skating', tag: '[FOOTWEAR]', title: '신발', desc: '축구화 / 풋살화 / 러닝화', href: ROUTES.search },
    { icon: 'sports_soccer', tag: '[MATCH BALLS]', title: '공', desc: '공인구매 매치볼 / 단체 벌크', href: ROUTES.search },
    { icon: 'shield', tag: '[SAFETY GEAR]', title: '보호대 / 기어', desc: '신가드 / 테이핑 / 장갑', href: ROUTES.search },
];

const PRODUCTS = [
    { label: 'CUSTOM JERSEY', discount: '15% OFF', category: '[축구 / 의류]', moq: '최소 5명 이상', name: '프로 매치 커스텀 팀 저지 세트', price: '₩55,000', salePrice: '₩46,750' },
    { label: 'FUTSAL SHOES', discount: '18% OFF', category: '[풋살 / 신발]', moq: '최소 3명 이상', name: '인조잔디 전용 TF 터프 풋살화', price: '₩89,000', salePrice: '₩72,980' },
    { label: 'MATCH BALL (5호)', discount: '20% OFF', category: '[축구 / 공]', moq: '최소 10개 이상', name: '협회 공인 시합용 열접합 5호구', price: '₩45,000', salePrice: '₩36,000' },
    { label: 'KNEE GUARD', discount: '12% OFF', category: '[보호대 / 기어]', moq: '최소 5명 이상', name: '엘라스틱 듀얼 서포트 무릎 보호대', price: '₩28,000', salePrice: '₩24,640' },
    { label: 'TRAINING BIBS', discount: '25% OFF', category: '[훈련용품]', moq: '최소 10벌 이상', name: '형광 메쉬 팀 구분 훈련 조끼 (10벌 팩)', price: '₩35,000', salePrice: '₩26,250' },
    { label: 'GRIP SOCKS', discount: '30% OFF', category: '[축구 / 잡화]', moq: '최소 15켤레 이상', name: '프로 퍼포먼스 패드 논슬립 그립 삭스', price: '₩15,000', salePrice: '₩10,500' },
    { label: 'SPORTS TAPE', discount: '15% OFF', category: '[메디컬 / 기어]', moq: '최소 5팩 이상', name: '키네시올로지 탄력 근육 테이프 6롤 세트', price: '₩22,000', salePrice: '₩18,700' },
    { label: 'WATER JUG 8L', discount: '10% OFF', category: '[훈련보조]', moq: '최소 2세트 이상', name: '대용량 8L 보랭 쿨러 저그 + 스퀴즈 보틀 6개', price: '₩68,000', salePrice: '₩61,200' },
];

const SORT_OPTIONS = ['추천순', '인기 마감순', '할인율 높은순', '최저가순'];

const ESCROW_STEPS = [
    { step: 'STEP 01', title: '공구 방 개설 & 옵션 모집', desc: '호스트가 상품과 최소 수량(MOQ)을 설정하고 고유 초대 링크를 생성하여 팀원들에게 배포합니다.' },
    { step: 'STEP 02', title: '팀원 개별 예치금 동결', desc: '각 팀원이 사이즈와 마킹을 선택하고 본인 예치금으로 결제 시 금액이 안전하게 시스템에 동결(HOLD)됩니다.' },
    { step: 'STEP 03', title: 'MOQ 100% 달성 시 자동 발주', desc: '목표 인원과 결제가 완료되면 제조 공장 로스터 데이터로 자동 변환되어 단체 제작에 돌입합니다.' },
    { step: 'STEP 04', title: '미달 시 100% 자동 환불', desc: '정해진 모집 기한 내 인원 미충족 시 수수료 차감 없이 즉시 각 팀원의 예치금 잔액으로 원복 환불됩니다.' },
];

export default function GroupPurchasesPage() {
    return (
        <div className="bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                <div className="flex flex-col w-full">
                    {/* SECTION 1: WIREFRAME HEADER & FILTER SYSTEM */}
                    <section className="flex flex-col gap-space-lg mb-12">
                        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                            <div className="flex items-center gap-space-sm">
                                <span className="font-caption text-caption uppercase px-space-xs py-0.5 bg-surface-container text-outline">LAYOUT-03</span>
                                <span className="font-caption text-caption text-on-surface-variant tracking-wider font-semibold">홈 대시보드 / 공동구매 허브</span>
                            </div>
                            <div className="flex items-center gap-space-md text-outline font-caption text-caption">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-primary inline-block" /> 실시간 모집 중 24개 팀
                                </span>
                                <span>|</span>
                                <span>예치금 정산 시스템 가동 중</span>
                            </div>
                        </div>
                        {/* Sports Filter Chips Bar */}
                        <div className="flex flex-col gap-space-xs">
                            <span className="font-caption text-caption text-outline uppercase tracking-wider">SELECT SPORT CATEGORY</span>
                            <ChipGroup
                                chips={SPORT_CHIPS}
                                className="flex flex-wrap items-center gap-space-sm"
                                chipClassName="h-9 px-space-md rounded font-label-sm text-label-sm border transition-all flex items-center gap-1.5"
                                activeClassName="bg-primary text-on-primary border-primary shadow-sm"
                                inactiveClassName="bg-surface-container-lowest text-on-surface border-outline-variant hover:border-outline"
                            />
                        </div>
                        {/* 4-Column Category Shortcut Grid */}
                        <div className="grid grid-cols-4 gap-gutter pt-space-xs">
                            {CATEGORY_SHORTCUTS.map((item) => (
                                <Link
                                    key={item.title}
                                    className="group flex flex-col p-space-md bg-surface-container-low border border-outline-variant hover:border-primary transition-colors rounded"
                                    href={item.href}
                                >
                                    <WirePlaceholder className="w-full h-24 mb-space-sm">
                                        <div className="relative z-10 flex flex-col items-center">
                                            <Icon name={item.icon} className="text-[28px] text-on-surface" />
                                            <span className="font-caption text-caption text-outline">{item.tag}</span>
                                        </div>
                                    </WirePlaceholder>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">{item.title}</div>
                                            <div className="font-caption text-caption text-outline">{item.desc}</div>
                                        </div>
                                        <Icon name="arrow_forward" className="text-outline text-[18px] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 2: FEATURED COMPONENT - ONGOING TEAM GROUP PURCHASE CARD */}
                    <section className="flex flex-col gap-space-sm mb-16">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-space-sm">
                                <span className="w-3 h-3 bg-primary inline-block" />
                                <h2 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">진행 중인 내 팀 공동구매 (ACTIVE ROSTER PURCHASE)</h2>
                            </div>
                            <span className="font-caption text-caption text-outline">주문 식별코드: #ORD-202410-0982</span>
                        </div>
                        <div className="bg-surface-container-lowest border-2 border-primary p-space-lg flex flex-col gap-space-lg shadow-sm">
                            {/* Header row: Badges & Countdown */}
                            <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-outline-variant pb-space-md">
                                <div className="flex flex-wrap items-center gap-space-sm">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-outline text-on-surface font-label-sm text-label-sm">
                                        <Icon name="timer" className="text-[16px] animate-pulse" />
                                        <span>
                                            D-2 남은 시간: <Countdown hours={43} minutes={16} seconds={41} className="font-mono font-bold" />
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-on-primary font-label-sm text-label-sm">
                                        <Icon name="group" className="text-[16px]" />
                                        <span>모집 진행중 (8 / 11명 참여 달성)</span>
                                    </div>
                                    <span className="font-caption text-caption text-secondary border border-outline-variant px-2 py-1 bg-surface-container-low">최소 수량 충족률: 72.7%</span>
                                </div>
                                <div className="flex items-center gap-space-xs text-outline font-caption text-caption">
                                    <span>모집 마감일: 2024-11-04 23:59:59</span>
                                </div>
                            </div>
                            {/* Main Body: Team Title & Progress Bar */}
                            <div className="flex flex-col gap-space-sm">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="font-headline-md text-headline-md text-on-surface">FC 에이스 주말 정기전 커스텀 유니폼 공동구매</h3>
                                    <span className="font-label-sm text-label-sm text-outline">[호스트: 팀장 김철수]</span>
                                </div>
                                <div className="w-full flex flex-col gap-1">
                                    <div className="w-full h-3 bg-surface-container border border-outline-variant overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '72.7%' }} />
                                    </div>
                                    <div className="flex justify-between font-caption text-caption text-outline">
                                        <span>목표 MOQ: 11명 (15% 벌크 할인 적용 구간)</span>
                                        <span className="font-bold text-on-surface">3명 추가 시 자동 최종 발주 진행</span>
                                    </div>
                                </div>
                            </div>
                            {/* Item Summary & User Selected Options Spec Box */}
                            <div className="grid grid-cols-12 gap-gutter bg-surface-container-low border border-outline-variant p-space-md items-center">
                                <WirePlaceholder className="col-span-2 aspect-square">
                                    <div className="relative z-10 text-center font-caption text-caption text-outline leading-tight">
                                        [썸네일]
                                        <br />
                                        120 x 120
                                    </div>
                                </WirePlaceholder>
                                <div className="col-span-6 flex flex-col justify-center gap-space-xs pl-space-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-caption text-caption px-1.5 py-0.5 bg-surface-container border border-outline-variant text-outline">축구의류</span>
                                        <span className="font-label-md text-label-md text-on-surface font-semibold">[PRO MATCH] 24/25 커스텀 스트라이프 저지 세트</span>
                                    </div>
                                    <div className="text-body-sm font-body-sm text-on-surface-variant flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-label-sm text-label-sm text-on-surface">내 선택 옵션:</span>
                                            <span className="px-2 py-0.5 bg-surface-container-lowest border border-outline font-mono text-body-sm font-bold">L 사이즈 (100)</span>
                                            <span className="px-2 py-0.5 bg-surface-container-lowest border border-outline font-mono text-body-sm font-bold">마킹: #10 KIM (주장)</span>
                                        </div>
                                        <span className="font-caption text-caption text-outline">팀 패치: 좌측 소매 부착 / 원단: 에어로쿨 쿨링 메쉬</span>
                                    </div>
                                </div>
                                <div className="col-span-4 bg-surface-container-lowest border border-outline p-space-sm flex flex-col justify-between h-full">
                                    <div className="flex items-center justify-between border-b border-surface-container-highest pb-1">
                                        <span className="font-caption text-caption text-outline uppercase">ESCROW STATUS</span>
                                        <span className="flex items-center gap-1 font-caption text-caption text-primary font-bold">
                                            <Icon name="lock" className="text-[14px]" />
                                            안전 에스크로 동결
                                        </span>
                                    </div>
                                    <div className="py-1">
                                        <div className="flex items-baseline justify-between">
                                            <span className="font-body-sm text-body-sm text-on-surface">내 예치금 결제:</span>
                                            <span className="font-label-md text-label-md font-bold text-on-surface">결제 완료 (₩42,000)</span>
                                        </div>
                                        <div className="flex items-baseline justify-between text-error">
                                            <span className="font-caption text-caption">팀원 결제 현황:</span>
                                            <span className="font-caption text-caption font-bold">미결제 팀원 3명 대기 중</span>
                                        </div>
                                    </div>
                                    <div className="font-caption text-caption text-outline bg-surface-container-low px-2 py-1">
                                        * 전원 결제 완료 시 즉시 제작 공장으로 발주 전달됩니다.
                                    </div>
                                </div>
                            </div>
                            {/* Action Button Controls */}
                            <div className="flex items-center justify-between pt-space-xs">
                                <div className="flex items-center gap-space-sm">
                                    <Icon name="info" className="text-outline text-[18px]" />
                                    <span className="font-caption text-caption text-outline">모집 기한 내 미달성 시 동결된 예치금은 즉시 100% 자동 반환됩니다.</span>
                                </div>
                                <div className="flex items-center gap-space-sm">
                                    <CopyLinkButton
                                        url="https://teambuy.internal/group/FC-ACE-202410"
                                        label="초대 링크 복사"
                                        className="h-11 px-5 bg-surface-container-lowest text-on-surface font-label-md text-label-md border border-outline hover:bg-surface-container transition-colors flex items-center gap-2"
                                    />
                                    <Link
                                        className="h-11 px-6 bg-primary text-on-primary font-label-md text-label-md border border-primary hover:bg-on-surface-variant transition-colors flex items-center gap-2"
                                        href={ROUTES.groupPurchase()}
                                    >
                                        <span>공동구매 방 바로가기</span>
                                        <Icon name="open_in_new" className="text-[18px]" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: 4-COLUMN PRODUCT GRID (8 ITEMS) */}
                    <section className="flex flex-col gap-space-md mb-16">
                        <div className="flex items-center justify-between border-b border-outline pb-space-sm">
                            <div className="flex items-center gap-space-sm">
                                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                                    <br />
                                </h2>
                                <span className="font-caption text-caption border border-outline-variant px-2 py-0.5 bg-surface-container text-outline">8개 상품 전시 중</span>
                            </div>
                            <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
                                {SORT_OPTIONS.map((option, i) => (
                                    <button
                                        key={option}
                                        className={i === 0 ? 'px-2 py-1 font-bold text-on-surface border-b border-primary' : 'px-2 py-1 text-on-surface-variant hover:text-on-surface'}
                                        type="button"
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-gutter">
                            {PRODUCTS.map((product) => (
                                <div
                                    key={product.name}
                                    className="flex flex-col bg-surface-container-lowest border border-outline-variant p-space-md hover:border-primary transition-colors justify-between"
                                >
                                    <div>
                                        <WirePlaceholder className="w-full aspect-square mb-space-sm">
                                            <div className="relative z-10 text-center font-caption text-caption text-outline">
                                                [이미지 250 x 250]
                                                <br />
                                                {product.label}
                                            </div>
                                            <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-primary text-on-primary font-caption text-caption">{product.discount}</span>
                                        </WirePlaceholder>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-caption text-caption text-outline">{product.category}</span>
                                            <span className="font-caption text-caption text-primary font-semibold">{product.moq}</span>
                                        </div>
                                        <h3 className="font-label-md text-label-md text-on-surface line-clamp-1 mb-2 font-bold">{product.name}</h3>
                                        <div className="flex flex-col mb-space-md bg-surface-container-low p-2 border border-outline-variant">
                                            <div className="flex items-center justify-between text-outline line-through font-body-sm text-body-sm">
                                                <span>정가 (개별가)</span>
                                                <span>{product.price}</span>
                                            </div>
                                            <div className="flex items-baseline justify-between font-label-md text-label-md text-on-surface font-bold">
                                                <span>공구 할인가</span>
                                                <span className="text-headline-sm">{product.salePrice}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-highest">
                                        <Link
                                            className="h-9 flex items-center justify-center bg-surface-container-lowest border border-outline text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                                            href={ROUTES.product()}
                                        >
                                            개인구매
                                        </Link>
                                        <Link
                                            className="h-9 flex items-center justify-center bg-primary border border-primary text-on-primary font-label-sm text-label-sm hover:bg-on-surface-variant transition-colors"
                                            href={ROUTES.groupPurchaseNew}
                                        >
                                            공구개설
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4: LOWER WIREFRAME BANNER - ESCROW PAYMENT FLOW GUIDE */}
                    <section className="border border-outline bg-surface-container-low p-space-xl flex flex-col gap-space-lg mb-8">
                        <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-space-md">
                            <div className="flex items-center gap-space-sm">
                                <Icon name="account_balance_wallet" className="text-primary text-[24px]" />
                                <div>
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface">팀바이(TEAMBUY) 예치금 에스크로 결제 프로세스 안내</h3>
                                    <p className="font-body-sm text-body-sm text-outline">먹튀 및 결제 파토 방지를 위한 공정 단체 주문 안전결제 메커니즘</p>
                                </div>
                            </div>
                            <span className="font-caption text-caption border border-outline px-space-sm py-1 bg-surface-container-lowest font-mono">FLOW PROTOCOL V2.4</span>
                        </div>
                        <div className="grid grid-cols-4 gap-space-md">
                            {ESCROW_STEPS.map((step) => (
                                <div key={step.step} className="bg-surface-container-lowest border border-outline-variant p-space-md flex flex-col gap-space-xs relative">
                                    <div className="flex items-center justify-between">
                                        <span className="font-caption text-caption text-outline font-bold">{step.step}</span>
                                        <span className="w-2 h-2 rounded-full bg-outline" />
                                    </div>
                                    <div className="font-label-md text-label-md text-on-surface">{step.title}</div>
                                    <p className="font-body-sm text-body-sm text-outline">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-space-xs border-t border-outline-variant">
                            <div className="flex items-center gap-2">
                                <Icon name="verified_user" className="text-outline text-[16px]" />
                                <span className="font-caption text-caption text-outline">에스크로 안전 결제 보증 등록 번호: [제2024-ESCROW-0914호]</span>
                            </div>
                            <Link className="font-label-sm text-label-sm text-on-surface hover:underline flex items-center gap-1" href={ROUTES.deposit}>
                                <span>예치금 충전 및 환불 상세 규정 전문 보기</span>
                                <Icon name="arrow_right_alt" className="text-[16px]" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
