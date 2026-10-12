import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import CopyLinkButton from '../../_components/CopyLinkButton';
import Countdown from '../../_components/Countdown';
import MemberAccordion from './_components/MemberAccordion';

export const metadata: Metadata = {
    title: '팀 공유 장바구니 | TEAMBUY',
};

const MY_ITEMS = [
    {
        badge: '커스텀',
        badgeClassName: 'bg-primary/70',
        category: 'TEAM UNIFORM',
        name: '커스텀 스트라이프 저지 세트 (홈)',
        price: '33,000원',
        options: ['색상: 블랙/화이트', '사이즈: L(100)', '수량: 1벌'],
    },
    {
        badge: '액세서리',
        badgeClassName: 'bg-secondary/80',
        category: 'ACCESSORIES',
        name: '미끄럼방지 논슬립 프로 그립 삭스 (3팩)',
        price: '45,000원',
        options: ['색상: 매트 블랙', '사이즈: L (265-285mm)', '패키지: 3켤레 1세트'],
    },
];

const READONLY_MEMBERS = [
    { initial: '박', name: '박민수', amount: '33,000원', item: '커스텀 스트라이프 저지 세트 (홈)', price: '33,000원', options: ['색상: 블랙/화이트', '사이즈: M(95)', '수량: 1벌'] },
    { initial: '송', name: '송지훈', amount: '33,000원', item: '커스텀 스트라이프 저지 세트 (홈)', price: '33,000원', options: ['색상: 블랙/화이트', '사이즈: XL(105)', '수량: 1벌'] },
];

const COLLAPSED_MEMBERS = [
    { initial: '이', name: '이정후 (팀원)', summary: '저지 세트 (색상: 블랙/화이트 · M(95) · 1벌)' },
    { initial: '최', name: '최영호 (팀원)', summary: '저지 세트 (색상: 블랙/화이트 · 2XL(110) · 1벌)' },
    { initial: '한', name: '한동훈 (팀원)', summary: '저지 세트 (색상: 블랙/화이트 · L(100) · 1벌)' },
    { initial: '정', name: '정우성 (팀원)', summary: '저지 세트 (색상: 블랙/화이트 · L(100) · 1벌)' },
    { initial: '강', name: '강태민 (팀원)', summary: '저지 세트 (색상: 블랙/화이트 · S(90) · 1벌)' },
];

function ImagePlaceholder({ size }: { size: string }) {
    return <div className="w-full h-full flex items-center justify-center font-caption text-[10px] text-outline">[IMG {size}]</div>;
}

export default function GroupPurchaseCartPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-space-lg w-full">
                    {/* Top Action Breadcrumb & Title Bar */}
                    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md">
                            <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center rounded-lg shadow-sm">
                                <Icon name="groups_3" className="text-2xl" />
                            </div>
                            <div>
                                <div className="flex items-center gap-space-sm mb-0.5">
                                    <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                                        #FC-SEOUL-2024-WINTER
                                    </span>
                                    <span className="font-caption text-caption text-secondary">개설일: 2024.11.02</span>
                                </div>
                                <h1 className="font-headline-md text-headline-md text-primary tracking-tight">
                                    팀 공유 장바구니 <span className="text-secondary font-body-md text-body-md">(옵션 취합 중)</span>
                                </h1>
                                <p className="font-caption text-caption text-secondary mt-1">※ 팀원 각자가 본인에게 맞는 색상과 사이즈 옵션을 개별 선택하여 담습니다.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-space-sm">
                            <CopyLinkButton
                                url="https://teambuy.internal/group/join?code=FC-SEOUL-2024-WINTER"
                                label="초대 링크 복사"
                                className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-all shadow-sm"
                                copiedClassName=""
                            />
                            <Link
                                className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
                                href={ROUTES.groupPurchaseOptions()}
                            >
                                <Icon name="add_circle" className="text-[18px]" />+ 상품 추가하기
                            </Link>
                        </div>
                    </div>

                    {/* Main Content Layout (65% / 35%) */}
                    <div className="grid grid-cols-12 gap-gutter items-start">
                        {/* Left Column: Participant Accordions */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-md">
                            {/* SECTION 1: ME (Creator/User) - Highlighted & Editable */}
                            <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
                                <div className="bg-surface-container-low p-space-md flex flex-wrap items-center justify-between gap-space-sm">
                                    <div className="flex items-center gap-space-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">나</div>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-headline-sm text-headline-sm text-primary">나 (김철수)</span>
                                                <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-primary text-on-primary font-semibold">제안자·방장</span>
                                                <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold">수정 가능</span>
                                            </div>
                                            <p className="font-caption text-caption text-secondary">담은 품목 2건 · 최종 수정: 방금 전</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-space-md">
                                        <div className="text-right">
                                            <span className="font-caption text-caption text-secondary block">내 결제 예정</span>
                                            <span className="font-headline-sm text-headline-sm text-primary font-bold">78,000원</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-variant text-on-surface font-label-sm text-label-sm shadow-sm flex items-center gap-1"
                                                href={ROUTES.groupPurchaseOptions()}
                                            >
                                                <Icon name="edit" className="text-[16px]" />
                                                수정
                                            </Link>
                                            <button
                                                className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-error-container text-error font-label-sm text-label-sm shadow-sm"
                                                type="button"
                                            >
                                                <Icon name="delete" className="text-[16px]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-space-lg flex flex-col gap-space-md bg-surface-container-lowest">
                                    {MY_ITEMS.map((item) => (
                                        <div key={item.name} className="p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-md transition-all">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 relative">
                                                <ImagePlaceholder size="80x80" />
                                                <div className={`absolute bottom-0 inset-x-0 ${item.badgeClassName} text-on-primary font-caption text-caption text-center py-0.5`}>{item.badge}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-space-sm mb-1">
                                                    <div className="min-w-0">
                                                        <span className="font-caption text-caption text-secondary uppercase block">{item.category}</span>
                                                        <h3 className="font-label-md text-label-md text-primary font-bold truncate">{item.name}</h3>
                                                    </div>
                                                    <span className="font-headline-sm text-headline-sm text-primary whitespace-nowrap">{item.price}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {item.options.map((option) => (
                                                        <span key={option} className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface">
                                                            {option}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION 2~3: Members (Read-only) */}
                            {READONLY_MEMBERS.map((member) => (
                                <MemberAccordion
                                    key={member.name}
                                    amount={member.amount}
                                    header={
                                        <div className="flex items-center gap-space-sm">
                                            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md">
                                                {member.initial}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-headline-sm text-headline-sm text-primary">{member.name}</span>
                                                    <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-secondary">팀원</span>
                                                    <span className="font-caption text-caption text-secondary">선택 완료 (읽기 전용)</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="p-space-md rounded-lg bg-surface-container-lowest flex items-start gap-space-md">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0">
                                            <ImagePlaceholder size="64x64" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-label-md text-label-md text-primary font-bold">{member.item}</h4>
                                                <span className="font-label-md text-label-md text-primary">{member.price}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {member.options.map((option) => (
                                                    <span key={option} className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
                                                        {option}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </MemberAccordion>
                            ))}

                            {/* SECTION 4: Collapsed Members */}
                            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col gap-space-sm">
                                <div className="flex items-center justify-between py-1">
                                    <span className="font-label-md text-label-md text-primary font-bold">대기 및 선택 완료 팀원 (5명)</span>
                                    <span className="font-caption text-caption text-secondary">합계 165,000원</span>
                                </div>
                                <div className="space-y-space-xs">
                                    {COLLAPSED_MEMBERS.map((member) => (
                                        <div
                                            key={member.name}
                                            className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-variant transition-colors"
                                        >
                                            <div className="flex items-center gap-space-sm">
                                                <div className="w-7 h-7 rounded-full bg-surface-container-high text-secondary flex items-center justify-center font-caption text-caption font-bold">
                                                    {member.initial}
                                                </div>
                                                <span className="font-body-sm text-body-sm text-primary font-semibold">{member.name}</span>
                                                <span className="font-caption text-caption text-secondary">{member.summary}</span>
                                            </div>
                                            <div className="flex items-center gap-space-md">
                                                <span className="font-label-sm text-label-sm text-primary">33,000원</span>
                                                <Icon name="lock" className="text-secondary text-[18px]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sticky Summary Panel */}
                        <div className="col-span-12 lg:col-span-4 sticky top-32 flex flex-col gap-space-md">
                            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
                                <div className="flex items-center justify-between pb-2 border-b-0">
                                    <span className="font-caption text-caption uppercase tracking-wider text-secondary font-bold">STATUS &amp; COUNTDOWN</span>
                                    <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold flex items-center gap-1">
                                        <Icon name="timer" className="text-[14px]" /> 실시간 마감
                                    </span>
                                </div>
                                <div className="p-space-md rounded-lg bg-surface-container text-center">
                                    <span className="font-caption text-caption text-secondary block mb-1">장바구니 수정 마감까지 남은 시간</span>
                                    <Countdown hours={43} minutes={18} seconds={18} className="block font-display-xl text-display-xl text-primary font-bold tracking-tight" />
                                    <p className="font-caption text-caption text-secondary mt-1">마감 일시: 2024.11.08 18:00 (금)</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-body-sm text-body-sm text-primary font-semibold">현재 참여 인원</span>
                                        <span className="font-label-md text-label-md text-primary font-bold">
                                            8명 <span className="text-secondary font-body-sm text-body-sm">/ 목표 10명</span>
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '80%' }} />
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-1">
                                        <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 36 36">
                                            <path
                                                className="text-surface-variant"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                            />
                                            <path
                                                className="text-primary"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeDasharray="80, 100"
                                                strokeLinecap="round"
                                                strokeWidth="3.5"
                                            />
                                            <text className="font-caption text-[9px] font-bold" fill="currentColor" textAnchor="middle" x="18" y="21">
                                                80%
                                            </text>
                                        </svg>
                                        <p className="font-caption text-caption text-on-surface">
                                            <span className="font-bold">2명 추가 참여 시</span> 10인 단체 할인 티어(-15%) 적용 확정!
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
                                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">결제 예정 금액 요약</h2>
                                <div className="space-y-space-sm">
                                    <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                                        <span>팀 전체 수량 (총 8명)</span>
                                        <span>11개 품목</span>
                                    </div>
                                    <div className="flex items-center justify-between font-body-sm text-body-sm text-secondary">
                                        <span>팀 전체 주문 합계</span>
                                        <span className="text-on-surface font-semibold">342,000원</span>
                                    </div>
                                    <div className="h-[1px] bg-surface-variant my-1" />
                                    <div className="flex items-center justify-between font-body-lg text-body-lg text-primary font-bold">
                                        <span>내가 결제할 금액</span>
                                        <span className="text-primary text-headline-sm font-bold">78,000원</span>
                                    </div>
                                </div>
                                <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon name="account_balance_wallet" className="text-primary text-[20px]" />
                                        <div>
                                            <span className="font-caption text-caption text-secondary block">내 보유 예치금</span>
                                            <span className="font-label-md text-label-md text-primary font-bold">150,000원</span>
                                        </div>
                                    </div>
                                    <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-bold">결제 잔액 충분</span>
                                </div>
                            </div>

                            <div className="bg-primary text-on-primary p-space-lg rounded-xl shadow-xl flex flex-col gap-space-md relative overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <Icon name="admin_panel_settings" className="text-tertiary-fixed text-[22px]" />
                                    <span className="font-label-md text-label-md uppercase font-bold tracking-wide">구매 제안자(방장) 전용 권한</span>
                                </div>
                                <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                                    옵션 취합을 조기 종료하고 결제 단계로 진입할 수 있습니다. 마감 즉시 모든 참여자에게 개별 결제 요청 알림이 전송됩니다.
                                </p>
                                <Link
                                    className="w-full py-3 rounded-lg bg-surface-container-lowest hover:bg-surface-variant text-primary font-headline-sm text-headline-sm transition-all shadow-md flex items-center justify-center gap-2"
                                    href={ROUTES.groupPurchaseShipping()}
                                >
                                    <Icon name="lock_clock" className="text-[20px]" />
                                    지금 마감하고 결제 단계로 전환
                                </Link>
                                <p className="font-caption text-caption text-center text-on-primary-container/80">* 마감 이후에는 팀원들의 품목·옵션 변경이 제한됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
