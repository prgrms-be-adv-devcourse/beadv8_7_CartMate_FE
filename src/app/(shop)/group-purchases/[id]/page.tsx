import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import AlertButton from '../_components/AlertButton';
import ConfirmLinkButton from '../_components/ConfirmLinkButton';
import Countdown from '../_components/Countdown';

export const metadata: Metadata = {
    title: '공동구매 상세 | TEAMBUY',
};

type PaymentStatus = 'host' | 'paid' | 'pending' | 'failed';

const STATUS_CHIPS = [
    { label: '결제 완료', count: '6명', dotClassName: 'bg-primary', countClassName: 'text-primary' },
    { label: '미결제', count: '1명', dotClassName: 'bg-outline', countClassName: 'text-primary' },
    { label: '결제 실패(잔액 부족)', count: '1명', dotClassName: 'bg-error', countClassName: 'text-error' },
];

const ESCROW_SUMMARY = [
    { label: '목표 총액', value: '276,000원', valueClassName: 'text-primary' },
    { label: '현재 동결 완료액', value: '210,000원', valueClassName: 'text-primary' },
    { label: '남은 결제 필요액', value: '66,000원', valueClassName: 'text-error' },
];

const PARTICIPANTS: {
    no: string;
    name: string;
    userId: string;
    item: string;
    option: string;
    amount: string;
    paidAt: string;
    status: PaymentStatus;
}[] = [
    { no: '01', name: '김철수 (나)', userId: 'chulsoo_k', item: '저지 세트 외 1건', option: '[홈 XL / #10 CHULSOO, 추가 삭스 1켤레]', amount: '78,000원', paidAt: '11.08 18:30', status: 'host' },
    { no: '02', name: '박민수', userId: 'minsoo_p', item: '저지 세트 1벌', option: '[홈 L / #7 MINSOO]', amount: '33,000원', paidAt: '11.08 19:10', status: 'paid' },
    { no: '03', name: '송지훈', userId: 'jihoon_s', item: '저지 세트 1벌', option: '[홈 M / #14 JIHOON]', amount: '33,000원', paidAt: '11.08 20:05', status: 'paid' },
    { no: '04', name: '최건우', userId: 'geonwoo_c', item: '저지 세트 1벌', option: '[어웨이 L / #9 GEONWOO]', amount: '33,000원', paidAt: '-', status: 'pending' },
    { no: '05', name: '이정협', userId: 'junghyup_l', item: '저지 세트 1벌', option: '[홈 2XL / #18 JUNGHYUP]', amount: '33,000원', paidAt: '11.09 09:12', status: 'failed' },
    { no: '06', name: '강동원', userId: 'dongwon_k', item: '저지 세트 1벌', option: '[홈 XL / #11 DONGWON]', amount: '33,000원', paidAt: '11.09 10:44', status: 'paid' },
    { no: '07', name: '오세훈', userId: 'sehun_o', item: '저지 세트 1벌', option: '[홈 L / #3 SEHUN]', amount: '33,000원', paidAt: '11.09 11:20', status: 'paid' },
    { no: '08', name: '윤석진', userId: 'sukjin_y', item: '저지 세트 1벌', option: '[어웨이 M / #22 SUKJIN]', amount: '33,000원', paidAt: '11.09 12:05', status: 'paid' },
];

const ROW_CLASS: Record<PaymentStatus, string> = {
    host: 'bg-surface-container-low hover:bg-surface-container transition-colors',
    paid: 'hover:bg-surface transition-colors',
    pending: 'bg-surface hover:bg-surface-container-low transition-colors',
    failed: 'bg-error-container/20 hover:bg-error-container/30 transition-colors',
};

const STATUS_BADGE: Record<PaymentStatus, { icon: string; label: string; className: string }> = {
    host: { icon: 'lock', label: '결제 완료 (예치금 동결)', className: 'bg-primary text-on-primary' },
    paid: { icon: 'check_circle', label: '결제 완료 (예치금 동결)', className: 'bg-surface-container-highest text-primary font-bold' },
    pending: { icon: 'schedule', label: '미결제 (대기중)', className: 'bg-surface-variant text-secondary font-bold' },
    failed: { icon: 'error', label: '결제 실패 (예치금 부족)', className: 'bg-error text-on-error font-bold' },
};

const remindMessage = (name: string) => `[팀바이 시스템 알림]\n'${name}' 팀원에게 카카오톡 및 푸시 알림으로 결제 독촉 메시지를 전송했습니다.`;

function ParticipantAction({ status, name }: { status: PaymentStatus; name: string }) {
    if (status === 'host') return <span className="font-caption text-caption text-secondary">완료 처리됨</span>;
    if (status === 'pending') {
        return (
            <AlertButton
                message={remindMessage(name)}
                className="w-full h-8 bg-surface-container-lowest hover:bg-primary hover:text-on-primary text-primary font-label-sm text-label-sm rounded shadow-sm flex items-center justify-center gap-1 transition-colors"
            >
                <Icon name="send" className="text-[14px]" />
                독촉 알림 발송
            </AlertButton>
        );
    }
    if (status === 'failed') {
        return (
            <AlertButton
                message={remindMessage(name)}
                className="w-full h-8 bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm rounded shadow-sm flex items-center justify-center gap-1 transition-colors"
            >
                <Icon name="restart_alt" className="text-[14px]" />
                재결제 안내
            </AlertButton>
        );
    }
    return <span className="font-caption text-caption text-secondary">-</span>;
}

export default function GroupPurchaseDetailPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* 상단 시스템 알림 배너 */}
                <div className="w-full bg-surface-container-high rounded-lg p-space-md mb-space-lg shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-space-sm min-w-0">
                        <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
                            info
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-space-sm min-w-0">
                            <span className="font-label-md text-label-md text-primary font-bold whitespace-nowrap">[공동구매 상태 알림]</span>
                            <span className="font-body-md text-body-md text-on-surface truncate">
                                옵션 수정이 마감되었습니다. 팀원 전원 결제가 완료되면 공장 제작 및 발주가 진행됩니다.
                            </span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-space-xs flex-shrink-0 pl-space-md">
                        <span className="font-caption text-caption text-secondary uppercase tracking-wider">주문번호 #TB-20241108-042</span>
                    </div>
                </div>

                {/* 결제 진행 상황 카드 (Bento Grid 스타일) */}
                <div className="grid grid-cols-12 gap-gutter mb-space-xl">
                    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-space-md">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-caption text-caption bg-surface-container-highest text-primary px-2 py-0.5 rounded font-bold">MOQ 8벌 확정</span>
                                    <span className="font-caption text-caption text-secondary">마감일시: 2024.11.10 23:59 KST</span>
                                </div>
                                <h2 className="font-headline-md text-headline-md text-primary tracking-tight">FC 팀바이 24/25 어센틱 풀셋 공동구매</h2>
                            </div>
                            <div className="text-right">
                                <div className="font-caption text-caption text-secondary mb-0.5">남은 결제 기한</div>
                                <div className="flex items-center gap-1">
                                    <span className="font-label-sm text-label-sm bg-primary text-on-primary px-1.5 py-0.5 rounded">D-1</span>
                                    <Countdown hours={18} minutes={34} seconds={43} className="font-headline-sm text-headline-sm text-primary font-bold" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-surface rounded-lg p-space-md mb-space-md">
                            <div className="flex items-end justify-between mb-space-xs">
                                <div className="flex items-center gap-space-xs">
                                    <span className="font-label-md text-label-md text-primary">팀원 결제 현황</span>
                                    <span className="font-body-sm text-body-sm text-secondary">(8명 중 6명 완료)</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-display-xl text-display-xl text-primary font-bold">75</span>
                                    <span className="font-headline-sm text-headline-sm text-secondary">%</span>
                                </div>
                            </div>
                            <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden flex">
                                <div className="bg-primary h-full transition-all duration-500 ease-out" style={{ width: '75%' }} title="결제 완료 75%" />
                                <div className="bg-outline h-full transition-all duration-500 ease-out" style={{ width: '12.5%' }} title="결제 실패 12.5%" />
                                <div className="bg-surface-variant h-full" style={{ width: '12.5%' }} title="미결제 12.5%" />
                            </div>
                            <div className="flex items-center justify-between mt-space-xs text-secondary font-caption text-caption">
                                <span>최소 달성 기준: 100% 충족 필요</span>
                                <span>미완료 2건 (총 66,000원 대기 중)</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                            {STATUS_CHIPS.map((chip) => (
                                <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded">
                                    <span className={`w-2 h-2 rounded-full ${chip.dotClassName}`} />
                                    <span className="font-label-sm text-label-sm text-on-surface">{chip.label}</span>
                                    <span className={`font-label-sm text-label-sm font-bold ${chip.countClassName}`}>{chip.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-4 bg-surface-container-high rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-space-xs mb-space-sm text-primary">
                                <Icon name="shield" className="text-[20px]" />
                                <h3 className="font-headline-sm text-headline-sm">안전 에스크로 보증</h3>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary mb-space-md leading-relaxed">
                                모든 참여자의 결제 금액은 <strong>팀바이 안전 정산 계좌(Escrow)</strong>에 우선 동결 보관되며, 8명 전원 결제 완료 즉시 제작
                                공장으로 공식 발주서가 전송됩니다.
                            </p>
                            <div className="space-y-space-xs bg-surface-container-lowest p-space-sm rounded mb-space-md">
                                {ESCROW_SUMMARY.map((row) => (
                                    <div key={row.label} className="flex items-center justify-between text-caption font-caption text-secondary">
                                        <span>{row.label}</span>
                                        <span className={`font-bold ${row.valueClassName}`}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-space-sm">
                            <AlertButton
                                message={'[팀바이 시스템 알림]\n미결제 팀원(최건우, 이정협) 2명에게 긴급 결제 촉구 알림이 일괄 발송되었습니다.'}
                                className="w-full h-11 bg-surface-container-lowest hover:bg-surface text-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                                <Icon name="notifications_active" className="text-[18px]" />
                                <span>미결제 팀원 전체 일괄 재알림 발송</span>
                            </AlertButton>
                        </div>
                    </div>
                </div>

                {/* 메인 섹션: 참여자 개별 결제 상태 테이블 */}
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-space-sm">
                        <div className="flex items-center gap-space-xs">
                            <h3 className="font-headline-sm text-headline-sm text-primary">참여자 결제 세부 대장</h3>
                            <span className="font-caption text-caption text-secondary px-2 py-0.5 bg-surface-container rounded-full">총 8건</span>
                        </div>
                        <div className="flex items-center gap-space-xs">
                            <span className="font-caption text-caption text-secondary">실시간 갱신: 방금 전</span>
                            <button className="p-1 rounded hover:bg-surface text-secondary" title="새로고침" type="button">
                                <Icon name="sync" className="text-[18px]" />
                            </button>
                        </div>
                    </div>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface">
                                    <th className="py-3 px-3 w-12 text-center">No</th>
                                    <th className="py-3 px-4">팀원명 / 권한</th>
                                    <th className="py-3 px-4">주문 내역 및 수량</th>
                                    <th className="py-3 px-4 text-right">결제 대상 금액</th>
                                    <th className="py-3 px-4 text-center">결제 일시</th>
                                    <th className="py-3 px-4 text-center">상태</th>
                                    <th className="py-3 px-4 text-center w-36">관리 액션</th>
                                </tr>
                            </thead>
                            <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                                {PARTICIPANTS.map((p) => {
                                    const badge = STATUS_BADGE[p.status];
                                    const isFailed = p.status === 'failed';
                                    const isBold = p.status === 'host' || isFailed;
                                    return (
                                        <tr key={p.no} className={ROW_CLASS[p.status]}>
                                            <td className={`py-3.5 px-3 text-center font-label-sm ${isFailed ? 'text-error' : 'text-secondary'}`}>{p.no}</td>
                                            <td className="py-3.5 px-4">
                                                {p.status === 'host' ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-label-md text-label-md text-primary font-bold">{p.name}</span>
                                                        <span className="font-caption text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">호스트</span>
                                                    </div>
                                                ) : (
                                                    <div className={`font-label-md text-label-md ${isFailed ? 'text-error font-bold' : 'text-primary font-medium'}`}>{p.name}</div>
                                                )}
                                                <div className="font-caption text-caption text-secondary">ID: {p.userId}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-on-surface">
                                                <div>{p.item}</div>
                                                <div className="font-caption text-caption text-secondary">{p.option}</div>
                                            </td>
                                            <td className={`py-3.5 px-4 text-right font-label-md text-label-md text-primary${isBold ? ' font-bold' : ''}`}>{p.amount}</td>
                                            <td className={`py-3.5 px-4 text-center ${isFailed ? 'text-error' : 'text-secondary'}`}>{p.paidAt}</td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 font-caption text-caption px-2.5 py-1 rounded-full ${badge.className}`}>
                                                    <Icon name={badge.icon} className="text-[14px]" />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <ParticipantAction status={p.status} name={p.name} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="pt-space-md mt-space-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-xs text-secondary font-caption text-caption">
                        <div className="flex items-center gap-1">
                            <Icon name="info" className="text-[16px]" />
                            <span>결제 기한(11.10 23:59) 내에 전원 결제가 완료되지 않을 경우, 동결된 예치금은 수수료 없이 전액 자동 해제 및 환불됩니다.</span>
                        </div>
                        <div>
                            <span>기록 보관 기준: 최종 발주 완료 후 30일</span>
                        </div>
                    </div>
                </div>

                {/* 하단: 미결제 참여자 시점 '내 몫 결제 인터랙션 카드' */}
                <div className="w-full max-w-[520px] mx-auto bg-surface-container-lowest rounded-xl p-space-xl shadow-md">
                    <div className="flex items-center justify-between pb-space-sm mb-space-md">
                        <div>
                            <span className="font-caption text-caption text-secondary uppercase font-bold">[ 참여자 결제 패널 ]</span>
                            <h3 className="font-headline-md text-headline-md text-primary mt-0.5">내 결제 정보</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                            <Icon name="credit_card" className="text-[24px]" />
                        </div>
                    </div>
                    <div className="bg-surface rounded-lg p-space-md mb-space-md space-y-space-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-body-md text-body-md text-secondary">결제할 내 몫 금액</span>
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">33,000원</span>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs">
                            <span className="font-body-sm text-body-sm text-secondary">현재 보유 예치금</span>
                            <span className="font-body-sm text-body-sm text-on-surface">150,000원</span>
                        </div>
                        <div className="flex items-center justify-between font-label-sm text-label-sm pt-space-xs text-primary">
                            <span>결제 후 잔여 예치금</span>
                            <span className="font-bold">117,000원 (결제 가능)</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-high rounded-lg p-space-md mb-space-lg flex items-start gap-space-sm">
                        <Icon name="lock_clock" className="text-primary text-[20px] flex-shrink-0 mt-0.5" />
                        <p className="font-caption text-caption text-secondary leading-relaxed">
                            결제 시 예치금이 <strong className="text-on-surface">안전 에스크로 계좌에 동결(HOLD)</strong>되며, 전원 결제 완료 시 공장 측에 최종
                            차감됩니다. 기한 내 미달 시 즉시 환원됩니다.
                        </p>
                    </div>
                    <div className="space-y-space-xs">
                        <ConfirmLinkButton
                            href={ROUTES.groupPurchaseResult()}
                            confirmMessage={'33,000원의 예치금을 안전 에스크로 계좌로 동결하시겠습니까?\n(동결 후 잔액: 117,000원)'}
                            doneMessage="결제가 완료되었습니다. 예치금 33,000원이 안전하게 동결 처리되었습니다."
                            className="w-full h-12 bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
                        >
                            <Icon name="account_balance_wallet" className="text-[20px]" />
                            <span>내 몫 결제하기 (예치금 33,000원 동결)</span>
                        </ConfirmLinkButton>
                        <div className="flex items-center justify-center gap-space-md pt-2 font-caption text-caption text-secondary">
                            <Link className="hover:text-primary underline" href={ROUTES.depositCharge}>
                                예치금 즉시 충전하기
                            </Link>
                            <span>·</span>
                            <Link className="hover:text-primary underline" href={ROUTES.notices}>
                                결제 및 환불 규정 상세
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
