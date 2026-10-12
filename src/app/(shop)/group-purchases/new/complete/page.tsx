import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ShareLinkPanel from './_components/ShareLinkPanel';

export const metadata: Metadata = {
    title: '공동구매 방 생성 완료 | TEAMBUY',
};

const METRICS = [
    { label: '목표 인원', value: '11명', sub: '(고정 인원)', subClassName: 'text-secondary' },
    { label: '장바구니 수정 마감', value: '11.08 18:00', sub: 'D-3 남음', subClassName: 'font-bold text-on-surface-variant' },
    { label: '결제 최종 기한', value: '11.10 23:59', sub: '개별 예치금 차감', subClassName: 'text-secondary' },
];

const STEPS = [
    { badge: '1단계', icon: '', title: '초대 및 팀원 옵션 담기', desc: '초대 링크를 전달받은 팀원들이 본인의 사이즈, 배번, 이니셜을 등록합니다.', footer: '[현재 진행 단계]', active: true },
    { badge: '2단계', icon: 'lock_clock', title: '장바구니 마감', desc: '기한 도달 또는 목표 인원 충족 시 방장이 장바구니를 최종 확정합니다.', footer: '11.08 18:00 자동 마감', active: false },
    { badge: '3단계', icon: 'account_balance_wallet', title: '개별 예치금 결제', desc: '설정된 인원이 모두 모이면 개별 예치금 결제가 진행되며, 각 팀원의 예치금에서 개별 차감됩니다.', footer: '미결제 시 자동 취소', active: false },
    { badge: '4단계', icon: 'precision_manufacturing', title: '주문 확정 및 공장 발주', desc: '제작 데이터(로스터 시트)가 제조 공장으로 자동 발송되며 제작이 시작됩니다.', footer: '제작 소요 7~10 영업일', active: false },
];

export default function GroupPurchaseCreatedPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="max-w-[840px] mx-auto w-full flex flex-col items-center">
                    {/* Top Celebration / Confirmation Header */}
                    <div className="text-center flex flex-col items-center mb-space-xl">
                        <div className="relative w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-space-md shadow-sm">
                            <svg
                                className="w-12 h-12 text-primary"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-25" />
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary" />
                            </span>
                        </div>
                        <div className="flex items-center gap-space-xs mb-space-xs">
                            <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface uppercase tracking-wider font-bold">생성 완료</span>
                            <span className="font-caption text-caption text-secondary">ROOM ID: #GRP-2024-9982</span>
                        </div>
                        <h1 className="font-display-xl text-display-xl text-primary tracking-tight mb-space-xs">공동구매 방이 성공적으로 생성되었습니다!</h1>
                        <p className="font-body-lg text-body-lg text-secondary max-w-[620px]">
                            팀원들에게 초대 링크를 공유하여 상품과 개인 옵션(등번호, 사이즈, 이니셜)을 담도록 안내하세요.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-space-lg mb-space-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pb-space-md">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-caption text-caption px-2 py-0.5 bg-primary text-on-primary rounded">축구 / 풋살</span>
                                    <span className="font-caption text-caption text-secondary">목표 인원: 11명 달성 시 발주</span>
                                </div>
                                <h2 className="font-headline-md text-headline-md text-primary font-bold">FC 에이스 2024 하반기 유니폼 단체 공구</h2>
                            </div>
                            <div className="flex items-center gap-1.5 self-start bg-surface-container px-3 py-1.5 rounded">
                                <Icon name="verified_user" className="text-primary text-[18px]" />
                                <span className="font-label-sm text-label-sm text-on-surface font-semibold">방장 권한 활성화됨</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md pt-space-md bg-surface-container-low rounded-lg p-space-md">
                            <div className="md:col-span-5 flex items-center gap-space-sm">
                                <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center shrink-0">
                                    <Icon name="sports_soccer" className="text-secondary text-[28px]" />
                                </div>
                                <div className="min-w-0">
                                    <span className="font-caption text-caption text-secondary block">대표 품목</span>
                                    <span className="font-label-md text-label-md text-primary font-bold truncate block">[MATCH-1] 커스텀 팀 저지 세트</span>
                                    <span className="font-body-sm text-body-sm text-secondary">상하의 + 스타킹 풀 패키지</span>
                                </div>
                            </div>
                            <div className="md:col-span-7 grid grid-cols-3 gap-space-sm text-center">
                                {METRICS.map((metric) => (
                                    <div key={metric.label} className="bg-surface-container-lowest p-space-sm rounded flex flex-col justify-center">
                                        <span className="font-caption text-caption text-secondary">{metric.label}</span>
                                        <span className="font-label-md text-label-md text-primary font-bold mt-0.5">{metric.value}</span>
                                        <span className={`font-caption text-caption ${metric.subClassName}`}>{metric.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Invite & Share Panel */}
                    <div className="w-full bg-surface-container-high rounded-xl p-space-lg shadow-md mb-space-lg">
                        <div className="flex items-center gap-2 mb-space-xs">
                            <Icon name="link" className="text-primary text-[22px]" />
                            <h3 className="font-headline-sm text-headline-sm text-primary">팀원 초대 및 공유 링크</h3>
                        </div>
                        <p className="font-body-sm text-body-sm text-secondary mb-space-md">
                            초대받은 팀원은 별도의 복잡한 회원가입 절차 없이 링크 접속 후 바로 본인 옵션을 선택할 수 있습니다.
                        </p>
                        <ShareLinkPanel />
                        <div className="bg-surface-container-lowest/80 rounded p-space-sm flex items-start gap-space-xs">
                            <Icon name="info" className="text-secondary text-[18px] shrink-0 mt-0.5" />
                            <div className="font-caption text-caption text-secondary leading-normal">
                                <strong className="font-bold text-on-surface">방장 권한 안내:</strong> 실시간으로 참여 인원 현황, 옵션 선택 누락자 확인 및 장바구니
                                조기 마감이 가능합니다. 마감 전까지 언제든 인원 확인 알림을 재발송할 수 있습니다.
                            </div>
                        </div>
                    </div>

                    {/* Action Button Group */}
                    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-space-md mb-space-xl">
                        <Link
                            className="w-full sm:w-auto min-w-[260px] h-14 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-space-xs shadow-lg transition hover:opacity-90 active:scale-[0.98]"
                            href={ROUTES.groupPurchaseCart()}
                        >
                            <Icon name="shopping_cart_checkout" className="text-[22px]" />
                            <span>공유 장바구니로 이동</span>
                        </Link>
                        <Link
                            className="w-full sm:w-auto min-w-[220px] h-14 bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-space-xs transition hover:bg-surface-variant active:scale-[0.98]"
                            href={ROUTES.groupPurchases}
                        >
                            <Icon name="format_list_bulleted" className="text-[20px]" />
                            <span>내 공동구매 관리 목록 보기</span>
                        </Link>
                    </div>

                    {/* Bottom Process Stepper Guide */}
                    <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                        <div className="flex items-center justify-between mb-space-md">
                            <div>
                                <span className="font-caption text-caption text-secondary uppercase font-bold tracking-wider">PROCESS OVERVIEW</span>
                                <h4 className="font-headline-sm text-headline-sm text-primary">공동구매 전체 진행 단계</h4>
                            </div>
                            <span className="font-caption text-caption bg-surface-container px-2 py-1 rounded text-on-surface">현재: 1단계 진행 중</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm relative">
                            {STEPS.map((step) => (
                                <div
                                    key={step.badge}
                                    className={step.active ? 'bg-surface-container-high rounded-lg p-space-md relative flex flex-col' : 'bg-surface-container-low rounded-lg p-space-md flex flex-col'}
                                >
                                    <div className="flex items-center justify-between mb-space-sm">
                                        <span
                                            className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${
                                                step.active ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'
                                            }`}
                                        >
                                            {step.badge}
                                        </span>
                                        {step.active ? (
                                            <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
                                        ) : (
                                            <Icon name={step.icon} className="text-secondary text-[16px]" />
                                        )}
                                    </div>
                                    <h5 className="font-label-md text-label-md text-primary font-bold mb-1">{step.title}</h5>
                                    <p className="font-body-sm text-body-sm text-secondary flex-1">{step.desc}</p>
                                    <div className={`mt-space-sm pt-space-xs font-caption text-caption ${step.active ? 'font-semibold text-primary' : 'text-secondary'}`}>
                                        {step.footer}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
