import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import AlertButton from '../../_components/AlertButton';
import ResultStateTabs from './_components/ResultStateTabs';

export const metadata: Metadata = {
    title: '공동구매 최종 결과 | TEAMBUY',
};

const ORDER_SUMMARY = [
    { label: '주문 관리 번호', value: '#TB-CONFIRM-20241110-09', valueClassName: 'font-label-md text-label-md text-primary font-mono tracking-tight' },
    { label: '대상 공동구매 프로젝트', value: '[FC 에이스] 2024 어웨이 유니폼 풀세트', valueClassName: 'font-label-md text-label-md text-on-surface' },
    { label: '제작 예정 기간', value: '영업일 기준 7~10일 소요', valueClassName: 'font-label-md text-label-md text-primary bg-surface-container-high px-2 py-0.5 rounded' },
    { label: '예상 출고 시작일', value: '2024년 11월 21일 (목)', valueClassName: 'font-label-md text-label-md text-on-surface' },
];

const PRODUCTION_STEPS = [
    { icon: 'done', label: '1. 주문확정', sub: '완료 (11/10)', state: 'done' },
    { icon: 'fact_check', label: '2. 시안 검수/발주', sub: '진행중 (D+1)', state: 'active' },
    { icon: 'precision_manufacturing', label: '3. 커스텀 인쇄', sub: '대기', state: 'todo' },
    { icon: 'all_inbox', label: '4. 출고 및 배송', sub: '예정', state: 'todo' },
] as const;

const ROSTER = [
    { name: '주장: 김철수 (나)', marking: 'No.10 / MIN-JUN / XL', amount: '78,000원', paid: true, me: true },
    { name: '팀원: 이지훈', marking: 'No.07 / JH-LEE / L', amount: '38,000원', paid: true, me: false },
    { name: '팀원: 박성민', marking: 'No.11 / SM-PARK / L', amount: '38,000원', paid: true, me: false },
    { name: '팀원: 최영호', marking: 'No.04 / YH-CHOI / M', amount: '38,000원', paid: false, me: false },
    { name: '팀원: 정다은', marking: 'No.19 / DA-EUN / S', amount: '38,000원', paid: false, me: false },
];

function ConfirmedView() {
    return (
        <>
            {/* Top Hero Banner: Order Confirmed */}
            <div className="bg-surface-container-lowest p-space-xl border border-outline-variant rounded shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
                    <div className="space-y-space-sm max-w-[760px]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded">
                            <Icon name="check_circle" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm tracking-wider uppercase">ORDER CONFIRMED · 전원 결제 완료 주문 확정</span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                            축하합니다! 팀원 10명 전원의 결제가 완료되어 공장 커스텀 제작 및 발주가 시작되었습니다.
                        </h2>
                        <p className="font-body-md text-body-md text-secondary">
                            주문 취소 및 마킹 시안 수정은 발주 개시 시점 기준 12시간 내 고객센터 유선 확인 건에 한해 제한적으로 가능합니다. 팀원 개별 배송
                            옵션이 지정된 경우 제작 후 순차 발송됩니다.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-space-xs w-full lg:w-auto shrink-0">
                        <Link
                            className="h-[44px] px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                            href={ROUTES.order()}
                        >
                            <Icon name="print" className="text-[18px]" />
                            <span>주문 상세 내역서 보기</span>
                        </Link>
                        <AlertButton
                            message={'[팀바이 시스템 알림]\n팀원 10명에게 주문 확정 알림이 전송되었습니다.'}
                            className="h-[44px] px-space-lg bg-surface text-primary border border-outline-variant font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                        >
                            <Icon name="send" className="text-[18px]" />
                            <span>팀원들에게 확정 알림 전송</span>
                        </AlertButton>
                    </div>
                </div>
            </div>

            {/* 2-COLUMN METRICS & TIMELINE */}
            <div className="grid grid-cols-12 gap-gutter">
                <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-space-lg border border-outline-variant rounded shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-space-md border-b border-surface-variant mb-space-md">
                            <div className="flex items-center gap-2">
                                <Icon name="inventory_2" className="text-primary text-[20px]" />
                                <h3 className="font-headline-sm text-headline-sm text-primary">발주 및 정산 요약</h3>
                            </div>
                            <span className="font-caption text-caption text-secondary border border-outline-variant px-2 py-0.5 rounded">실시간 확정 데이터</span>
                        </div>
                        <div className="space-y-space-md font-body-sm text-body-sm">
                            {ORDER_SUMMARY.map((row) => (
                                <div key={row.label} className="flex justify-between items-center py-1">
                                    <span className="text-secondary">{row.label}</span>
                                    <span className={row.valueClassName}>{row.value}</span>
                                </div>
                            ))}
                            <div className="pt-space-md border-t border-surface-variant space-y-space-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary">공동구매 총 참여인원</span>
                                    <span className="font-label-md text-label-md text-on-surface">10명 (목표 10명 / 100% 결제완료)</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-secondary">총 결제 완료 금액</span>
                                    <span className="font-headline-sm text-headline-sm text-primary">420,000원</span>
                                </div>
                                <p className="font-caption text-caption text-secondary text-right">※ 전원 예치금 최종 차감 완료 (동결 → 출금 처리)</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-space-lg p-space-md bg-surface-container-low border border-outline-variant rounded">
                        <div className="flex items-center justify-between mb-space-xs">
                            <span className="font-label-sm text-label-sm text-secondary uppercase">내 결제 정산 내역</span>
                            <span className="font-caption text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">실차감 완료</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="font-body-sm text-body-sm text-on-surface">내 차감 금액 (동결 해제 후 실차감)</span>
                            <span className="font-headline-sm text-headline-sm text-primary">78,000원</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant text-secondary font-caption text-caption">
                            <span>차감 후 내 보유 예치금 잔액</span>
                            <span className="font-mono text-on-surface font-semibold">72,000원</span>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 flex flex-col gap-space-md">
                    <div className="bg-surface-container-lowest p-space-lg border border-outline-variant rounded shadow-sm">
                        <div className="flex items-center justify-between pb-space-sm border-b border-surface-variant mb-space-lg">
                            <div className="flex items-center gap-2">
                                <Icon name="local_shipping" className="text-primary text-[20px]" />
                                <h3 className="font-headline-sm text-headline-sm text-primary">제작 현황 트래커</h3>
                            </div>
                            <span className="font-caption text-caption text-secondary">상태 업데이트: 실시간 공장 ERP 연동</span>
                        </div>
                        <div className="relative py-space-sm mb-space-lg">
                            <div className="absolute top-5 left-8 right-8 h-1 bg-surface-variant -z-0" />
                            <div className="absolute top-5 left-8 w-1/3 h-1 bg-primary -z-0" />
                            <div className="grid grid-cols-4 relative z-10 text-center">
                                {PRODUCTION_STEPS.map((step) => (
                                    <div key={step.label} className={`flex flex-col items-center${step.state === 'todo' ? ' opacity-40' : ''}`}>
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md text-label-md mb-2 ${
                                                step.state === 'done'
                                                    ? 'bg-primary text-on-primary shadow-sm'
                                                    : step.state === 'active'
                                                      ? 'bg-surface-container-lowest border-2 border-primary text-primary shadow-sm animate-pulse'
                                                      : 'bg-surface-container-high border border-outline-variant text-secondary'
                                            }`}
                                        >
                                            <Icon name={step.icon} className="text-[20px]" />
                                        </div>
                                        <span
                                            className={`font-label-sm text-label-sm ${
                                                step.state === 'todo' ? 'text-secondary' : step.state === 'active' ? 'text-primary font-bold' : 'text-primary'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                        <span className={`font-caption text-caption mt-0.5 ${step.state === 'active' ? 'text-primary font-bold' : 'text-secondary'}`}>{step.sub}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-space-md bg-surface border border-outline-variant rounded flex items-start gap-space-sm">
                            <Icon name="info" className="text-primary text-[22px] shrink-0 mt-0.5" />
                            <div className="font-body-sm text-body-sm text-secondary">
                                <span className="font-bold text-on-surface">현재 공정: </span>제작 공장에 10인 개별 로스터 인쇄 시안(등번호, 영문 네이밍)이 전달되어 데이터
                                오류 검증 중입니다. 검수 완료 후 원단 재단 및 전사 인쇄 작업이 즉시 시작됩니다.
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-lowest p-space-lg border border-outline-variant rounded shadow-sm flex-1">
                        <div className="flex items-center justify-between mb-space-md">
                            <h4 className="font-label-md text-label-md text-primary">확정 유니폼 및 마킹 명세 요약</h4>
                            <span className="font-caption text-caption text-secondary">[ 10벌 일괄 패키징 · 개별 배송 0건 ]</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-space-md">
                            <div className="w-full sm:w-[160px] h-[130px] bg-surface border border-outline-variant rounded relative flex items-center justify-center overflow-hidden shrink-0">
                                <svg className="absolute inset-0 w-full h-full text-outline-variant" preserveAspectRatio="none" stroke="currentColor" strokeWidth="1">
                                    <line x1="0" x2="100%" y1="0" y2="100%" />
                                    <line x1="100%" x2="0" y1="0" y2="100%" />
                                </svg>
                                <span className="font-caption text-caption text-secondary bg-surface-container-lowest px-2 py-0.5 border border-outline-variant z-10">
                                    [ WIRED DESIGN: 160x130 ]
                                </span>
                            </div>
                            <div className="flex-1 space-y-1 text-secondary font-body-sm text-body-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-label-sm text-label-sm text-on-surface">[팀바이 프로] 커스텀 팀킷 매치웨어 (네이비/화이트)</span>
                                    <span className="font-caption text-caption bg-surface-container-high px-1.5 py-0.5 rounded">전사 승화</span>
                                </div>
                                <p className="font-caption text-caption text-secondary">원단: 쿨맥스 드라이핏 에어로 140g · 마킹: 팀 엠블럼 전면 패치 + 배면 2도 전사</p>
                                <div className="pt-space-xs grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-1.5 bg-surface border border-outline-variant rounded">
                                        <span className="block text-secondary font-caption text-caption">내 마킹 옵션</span>
                                        <span className="font-bold text-on-surface">No.10 / MIN-JUN (Size XL)</span>
                                    </div>
                                    <div className="p-1.5 bg-surface border border-outline-variant rounded">
                                        <span className="block text-secondary font-caption text-caption">수령 배송지</span>
                                        <span className="truncate block text-on-surface" title="서울특별시 송파구 올림픽로">
                                            FC 에이스 클럽하우스 일괄
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CancelledView() {
    return (
        <>
            {/* Top Warning Banner: Order Cancelled & Deposit Hold Released */}
            <div className="bg-surface-container-lowest p-space-xl border border-outline-variant rounded shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary" />
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
                    <div className="space-y-space-sm max-w-[760px]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high border border-outline-variant text-primary rounded">
                            <Icon name="lock_open" className="text-[18px]" />
                            <span className="font-label-sm text-label-sm tracking-wider uppercase">CANCELED &amp; REFUNDED · 결제 기한 만료 취소 &amp; 동결 해제</span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">
                            결제 기한(2024.11.10 23:59) 내에 전원 결제가 완료되지 않아 공동구매가 자동 취소되었습니다.
                        </h2>
                        <p className="font-body-md text-body-md text-secondary">
                            팀바이 정책에 따라 참여자 전원의 예치금은 수수료 차감 없이 즉시 100% 동결 해제되어 [사용 가능 잔액]으로 안전하게 원복되었습니다.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-space-xs w-full lg:w-auto shrink-0">
                        <Link
                            className="h-[44px] px-space-lg bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
                            href={ROUTES.groupPurchaseNew}
                        >
                            <Icon name="replay" className="text-[18px]" />
                            <span>동일 구성으로 다시 공동구매 개설하기</span>
                        </Link>
                        <Link
                            className="h-[44px] px-space-lg bg-surface text-primary border border-outline-variant font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                            href={ROUTES.cart}
                        >
                            <Icon name="shopping_cart" className="text-[18px]" />
                            <span>개인구매로 전환하여 장바구니 담기</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2-COLUMN CANCELLATION AUDIT & REFUND BREAKDOWN */}
            <div className="grid grid-cols-12 gap-gutter">
                <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-space-lg border border-outline-variant rounded shadow-sm">
                    <div className="flex items-center justify-between pb-space-md border-b border-surface-variant mb-space-md">
                        <div className="flex items-center gap-2">
                            <Icon name="account_balance" className="text-primary text-[20px]" />
                            <h3 className="font-headline-sm text-headline-sm text-primary">예치금 환원 및 동결 해제 명세표</h3>
                        </div>
                        <span className="font-caption text-caption text-secondary border border-outline-variant px-2 py-0.5 rounded">자동 정산 완료</span>
                    </div>
                    <div className="space-y-space-md">
                        <div className="p-space-md bg-surface border border-outline-variant rounded">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-label-sm text-label-sm text-secondary">미결제 사유 안내</span>
                                <span className="font-caption text-caption text-secondary">마감일 2024.11.10 23:59 기준</span>
                            </div>
                            <div className="flex items-center justify-between font-body-sm text-body-sm">
                                <span className="text-on-surface">최종 인원 현황:</span>
                                <span className="font-bold text-on-surface">
                                    총 10명 중 8명 결제 완료 / <span className="text-primary underline">2명 미결제</span>
                                </span>
                            </div>
                            <p className="font-caption text-caption text-secondary mt-1">최소 수량(MOQ 10벌) 기준 미충족에 따른 시스템 규정 자동 세션 클로즈</p>
                        </div>
                        <div className="p-space-md bg-surface-container-low border border-outline-variant rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <Icon name="shield" className="text-primary text-[18px]" />
                                <span className="font-label-sm text-label-sm text-primary">팀바이 안전 예치금 보호 조치</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                                동결(HOLD)되어 있던 결제 참여자 전원의 예치금이 <strong className="text-primary font-semibold">100% 즉시 동결 해제(반환)</strong>되었습니다.
                                별도의 환불 신청 절차 없이 내 지갑에서 즉시 확인 가능합니다.
                            </p>
                        </div>
                        <div className="border-t border-surface-variant pt-space-sm space-y-2 font-body-sm text-body-sm">
                            <div className="flex justify-between items-center text-secondary">
                                <span>기존 동결(HOLD) 설정 금액</span>
                                <span className="font-mono">78,000원</span>
                            </div>
                            <div className="flex justify-between items-center text-secondary">
                                <span>취소 수수료 / 페널티</span>
                                <span className="font-mono text-primary font-semibold">0원 (전액 무료 취소)</span>
                            </div>
                            <div className="flex justify-between items-center py-2 bg-surface px-space-sm border border-outline-variant rounded">
                                <span className="font-label-sm text-label-sm text-on-surface">내 계좌 처리 결과</span>
                                <span className="font-label-md text-label-md text-primary font-mono">동결 해제 → 가용 예치금 원복</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="font-headline-sm text-headline-sm text-primary">현재 내 총 사용 가능 예치금 잔액</span>
                                <span className="font-headline-lg text-headline-lg text-primary font-mono">150,000원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-space-lg border border-outline-variant rounded shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-space-md border-b border-surface-variant mb-space-md">
                            <div className="flex items-center gap-2">
                                <Icon name="group" className="text-primary text-[20px]" />
                                <h3 className="font-headline-sm text-headline-sm text-primary">팀원별 결제 마감 결과표</h3>
                            </div>
                            <span className="font-caption text-caption text-secondary">10명 기준 로스터 명세</span>
                        </div>
                        <div className="border border-outline-variant rounded overflow-hidden">
                            <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                                <thead>
                                    <tr className="bg-surface border-b border-outline-variant font-label-sm text-label-sm text-secondary">
                                        <th className="py-2.5 px-3">역할/이름</th>
                                        <th className="py-2.5 px-3">선택 마킹/사이즈</th>
                                        <th className="py-2.5 px-3 text-right">금액</th>
                                        <th className="py-2.5 px-3 text-center">결제 상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant">
                                    {ROSTER.map((member) => (
                                        <tr key={member.name} className={member.paid ? 'bg-surface-container-lowest' : 'bg-surface-container-lowest bg-surface-container-high/30'}>
                                            <td className={`py-2 px-3 ${member.me ? 'font-semibold text-primary' : member.paid ? 'text-secondary' : 'text-primary font-bold'}`}>{member.name}</td>
                                            <td className="py-2 px-3 text-secondary">{member.marking}</td>
                                            <td className={`py-2 px-3 text-right font-mono${member.paid ? '' : ' text-outline'}`}>{member.amount}</td>
                                            <td className="py-2 px-3 text-center">
                                                {member.paid ? (
                                                    <span className="font-caption text-caption bg-surface-container-high px-1.5 py-0.5 rounded text-primary">동결 해제 완료</span>
                                                ) : (
                                                    <span className="font-caption text-caption border border-outline text-secondary px-1.5 py-0.5 rounded">기한만료 미결제</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="font-caption text-caption text-secondary mt-2">※ 기타 5명 팀원은 정상 결제 후 동결 해제(반환) 조치되었습니다.</p>
                    </div>
                    <div className="mt-space-lg p-space-md bg-surface border border-outline-variant rounded flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon name="notifications_active" className="text-secondary text-[20px]" />
                            <span className="font-body-sm text-body-sm text-secondary">미결제 팀원에게 개별 자동 리마인드 발송 내역</span>
                        </div>
                        <span className="font-caption text-caption border border-outline-variant bg-surface-container-lowest px-2 py-0.5 rounded">카카오 알림톡 2회 전송됨</span>
                    </div>
                </div>
            </div>

            {/* Alternative Next Actions Banner */}
            <div className="p-space-lg bg-surface-container-lowest border border-outline-variant rounded flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div>
                    <h4 className="font-headline-sm text-headline-sm text-primary mb-1">다음 단계 진행 옵션 안내</h4>
                    <p className="font-body-sm text-body-sm text-secondary">
                        결제하지 않은 팀원을 제외하고 수량을 조절하여 다시 시작하거나, 현재 구성을 개인 커스텀 장바구니로 바로 담을 수 있습니다.
                    </p>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                    <Link
                        className="h-[40px] px-space-md border border-outline-variant bg-surface text-secondary hover:text-primary font-label-md text-label-md rounded flex items-center"
                        href={ROUTES.deposit}
                    >
                        내 예치금 관리 바로가기
                    </Link>
                    <Link className="h-[40px] px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center" href={ROUTES.groupPurchaseNew}>
                        인원 조정 후 재모집 개설
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function GroupPurchaseResultPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <ResultStateTabs
                    intro={
                        <div>
                            <div className="flex items-center gap-space-xs text-secondary font-caption text-caption uppercase tracking-wider mb-space-xs">
                                <Icon name="receipt_long" className="text-[16px]" />
                                <span>Order Settlement Wireframe Guide · Step 06/06</span>
                            </div>
                            <h1 className="font-headline-lg text-headline-lg text-on-surface">공동구매 최종 결과 상태 (Order Confirmed vs Order Cancelled)</h1>
                            <p className="font-body-md text-body-md text-secondary mt-1">
                                팀원 전체 결제 완료 시 즉시 생산 공정으로 진입하는 [주문 확정] 상태와, 기한 초과 미결제 시 안전하게 예치금이 환원되는 [취소/동결
                                해제] 상태 비교 인터페이스.
                            </p>
                        </div>
                    }
                    confirmedView={<ConfirmedView />}
                    cancelledView={<CancelledView />}
                />
                {/* BOTTOM WIREFRAME COMPARISON SUMMARY & SPEC NOTES */}
                <section className="mt-space-xl pt-space-lg border-t border-surface-variant" />
            </div>
        </div>
    );
}
