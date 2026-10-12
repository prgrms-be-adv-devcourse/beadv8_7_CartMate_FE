'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const UNIT_PRICE = 33000;
const MIN_QTY = 10;
const MAX_QTY = 100;

const CART_TIMES = ['12:00', '18:00', '21:00', '23:59'];
const PAY_TIMES = ['18:00', '21:00', '23:59'];

const POLICIES = [
    { strong: '전원 결제 완료 시:', text: ' 설정된 최소 MOQ 달성 즉시 공장 커스텀 제작 오더가 자동 발주 단계로 전환됩니다.' },
    { strong: '최소 인원(10명) 미달 시:', text: ' 마감 시간 직후 공동구매는 자동 취소되며 결제된 개별 예치금은 100% 즉시 원복 동결 해제됩니다.' },
    { strong: '', text: '커스텀 마킹 작업 착수 후에는 단순 변심으로 인한 개별 취소/사이즈 변경이 불가합니다.' },
];

const clampQty = (value: number) => (Number.isNaN(value) ? MIN_QTY : Math.min(MAX_QTY, Math.max(MIN_QTY, value)));
const toDotDate = (date: string) => date.replace(/-/g, '.');

// 공동구매 개설 폼 + 우측 실시간 요약 패널 (입력값을 요약에 즉시 반영)
export default function CreateGroupPurchaseForm({ itemBanner }: { itemBanner: ReactNode }) {
    const router = useRouter();
    const [title, setTitle] = useState('FC 에이스 2024 하반기 유니폼 단체 공구');
    const [maxQty, setMaxQty] = useState(15);
    const [cartDate, setCartDate] = useState('2024-11-08');
    const [cartTime, setCartTime] = useState('18:00');
    const [payDate, setPayDate] = useState('2024-11-10');
    const [payTime, setPayTime] = useState('23:59');
    const [announcement, setAnnouncement] = useState(
        '등번호와 영문 이니셜 철자를 정확히 기재 부탁드립니다. 미결제 인원이 발생할 경우 전체 팀원 발주 일정이 지연될 수 있으니 기한 준수 부탁드립니다.',
    );
    const [agreed, setAgreed] = useState(true);

    const handleSubmit = () => {
        if (!agreed) {
            alert('공동구매 진행 및 예치금 결제 정책에 동의해 주세요.');
            return;
        }
        if (!title.trim()) {
            alert('공동구매 방 제목을 입력해 주세요.');
            return;
        }
        router.push(ROUTES.groupPurchaseCreated);
    };

    return (
        <div className="grid grid-cols-12 gap-gutter items-start">
            {/* Left & Center Form Flow (8 Columns) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
                {itemBanner}
                <form className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-lg" onSubmit={(e) => e.preventDefault()}>
                    {/* Field 1: Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center justify-between" htmlFor="group-title">
                            <span className="flex items-center gap-1">
                                1. 공동구매 방 제목 입력
                                <span className="text-error font-bold">*</span>
                            </span>
                            <span className="font-caption text-caption text-secondary">{title.length} / 40자</span>
                        </label>
                        <div className="relative">
                            <input
                                className="w-full h-11 px-space-md bg-surface-container-lowest font-body-md text-body-md text-on-surface rounded focus:outline-none focus:bg-surface transition-all placeholder:text-outline"
                                id="group-title"
                                maxLength={40}
                                name="groupTitle"
                                placeholder="예: FC 에이스 2024 하반기 유니폼 단체 공구"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <p className="font-caption text-caption text-secondary">팀원들이 알림톡 및 공유 링크 접속 시 확인할 메인 공구 명칭입니다.</p>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />
                    {/* Field 2: Target Member Count */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center gap-1">
                            2. 모집 인원 설정
                            <span className="text-error font-bold">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <div className="p-space-md rounded bg-surface-container flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="font-label-sm text-label-sm text-secondary">최소 필수 주문 수량 (MOQ)</span>
                                    <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-primary font-caption text-caption">고정 기준</span>
                                </div>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="font-display-xl text-display-xl text-primary font-bold">10</span>
                                    <span className="font-body-md text-body-md text-secondary">벌 (명) 이상 필수</span>
                                </div>
                                <p className="font-caption text-caption text-secondary mt-1">최소 수량 미달 시 결제 기한 후 공구는 자동 취소됩니다.</p>
                            </div>
                            <div className="p-space-md rounded bg-surface flex flex-col justify-between">
                                <label className="font-label-sm text-label-sm text-primary flex items-center justify-between" htmlFor="max-quantity">
                                    <span>최대 모집 정원 (수량 상한)</span>
                                    <span className="font-caption text-caption text-secondary">권장: 10 ~ 50명</span>
                                </label>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 flex items-center bg-surface-container-lowest rounded px-space-md h-11">
                                        <input
                                            className="w-full bg-transparent font-headline-sm text-headline-sm text-primary focus:outline-none"
                                            id="max-quantity"
                                            max={MAX_QTY}
                                            min={MIN_QTY}
                                            name="maxQuantity"
                                            type="number"
                                            value={maxQty}
                                            onChange={(e) => setMaxQty(Number(e.target.value))}
                                            onBlur={() => setMaxQty((prev) => clampQty(prev))}
                                        />
                                        <span className="font-body-md text-body-md text-secondary ml-1">벌</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            className="w-8 h-5 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-primary rounded"
                                            type="button"
                                            onClick={() => setMaxQty((prev) => clampQty(prev + 1))}
                                        >
                                            <Icon name="expand_less" className="text-[14px]" />
                                        </button>
                                        <button
                                            className="w-8 h-5 flex items-center justify-center bg-surface-container-high hover:bg-surface-container-highest text-primary rounded"
                                            type="button"
                                            onClick={() => setMaxQty((prev) => clampQty(prev - 1))}
                                        >
                                            <Icon name="expand_more" className="text-[14px]" />
                                        </button>
                                    </div>
                                </div>
                                <p className="font-caption text-caption text-secondary mt-1">설정한 상한선에 도달하면 신규 참여가 자동 마감됩니다.</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />
                    {/* Field 3 & 4: Deadline Dates */}
                    <div className="flex flex-col gap-space-md">
                        <div className="flex items-center justify-between">
                            <span className="font-label-md text-label-md text-primary">3 &amp; 4. 진행 일정 및 마감 시한 설정</span>
                            <span className="font-caption text-caption text-secondary">한국 표준시 (KST) 기준</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <div className="p-space-md rounded bg-surface-container-low flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-label-sm text-label-sm text-primary flex items-center gap-1" htmlFor="cart-date">
                                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                        수정 마감 일시 (장바구니)
                                        <span className="text-error font-bold">*</span>
                                    </label>
                                    <span className="font-caption text-caption text-secondary">옵션 수정 제한</span>
                                </div>
                                <p className="font-caption text-caption text-secondary">팀원이 사이즈/등번호/마킹을 변경할 수 있는 최종 기한입니다.</p>
                                <div className="flex gap-2 mt-1">
                                    <div className="flex-1 relative flex items-center bg-surface-container-lowest rounded px-3 h-11">
                                        <Icon name="calendar_today" className="text-secondary text-[18px] mr-2" />
                                        <input
                                            className="w-full bg-transparent font-body-sm text-body-sm text-primary focus:outline-none"
                                            id="cart-date"
                                            type="date"
                                            value={cartDate}
                                            onChange={(e) => setCartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-[120px] relative flex items-center bg-surface-container-lowest rounded px-3 h-11">
                                        <Icon name="schedule" className="text-secondary text-[18px] mr-2" />
                                        <select
                                            className="w-full bg-transparent font-body-sm text-body-sm text-primary focus:outline-none"
                                            value={cartTime}
                                            onChange={(e) => setCartTime(e.target.value)}
                                        >
                                            {CART_TIMES.map((time) => (
                                                <option key={time} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-space-md rounded bg-surface-container flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-label-sm text-label-sm text-primary flex items-center gap-1" htmlFor="pay-date">
                                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                                        결제 기한 일시 (최종 마감)
                                        <span className="text-error font-bold">*</span>
                                    </label>
                                    <span className="font-caption text-caption text-error font-bold">발주 트리거</span>
                                </div>
                                <p className="font-caption text-caption text-secondary">수정 마감 이후 개별 예치금 입금 및 결제 확정 시한입니다.</p>
                                <div className="flex gap-2 mt-1">
                                    <div className="flex-1 relative flex items-center bg-surface-container-lowest rounded px-3 h-11">
                                        <Icon name="event_available" className="text-secondary text-[18px] mr-2" />
                                        <input
                                            className="w-full bg-transparent font-body-sm text-body-sm text-primary focus:outline-none"
                                            id="pay-date"
                                            type="date"
                                            value={payDate}
                                            onChange={(e) => setPayDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-[120px] relative flex items-center bg-surface-container-lowest rounded px-3 h-11">
                                        <Icon name="schedule" className="text-secondary text-[18px] mr-2" />
                                        <select
                                            className="w-full bg-transparent font-body-sm text-body-sm text-primary focus:outline-none"
                                            value={payTime}
                                            onChange={(e) => setPayTime(e.target.value)}
                                        >
                                            {PAY_TIMES.map((time) => (
                                                <option key={time} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded bg-surface-container-high text-on-surface">
                            <Icon name="info" className="text-[18px] text-primary" />
                            <span className="font-caption text-caption">
                                권장 안내: 팀원 간 원활한 확인을 위해 <strong>결제 기한은 수정 마감 일시 이후 최소 24시간 이상</strong> 여유를 두는 것을
                                권장합니다.
                            </span>
                        </div>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />
                    {/* Field 5: Team Announcement Textarea */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-primary flex items-center justify-between" htmlFor="announcement-text">
                            <span className="flex items-center gap-1">
                                5. 팀원 대상 안내 문구 및 공지사항
                                <span className="font-caption text-caption text-secondary font-normal">(선택)</span>
                            </span>
                            <span className="font-caption text-caption text-secondary">{announcement.length} / 200자</span>
                        </label>
                        <div className="relative">
                            <textarea
                                className="w-full p-space-md bg-surface-container-lowest font-body-md text-body-md text-on-surface rounded focus:outline-none focus:bg-surface transition-all placeholder:text-outline resize-none leading-relaxed"
                                id="announcement-text"
                                maxLength={200}
                                placeholder="팀원들에게 전달할 마킹 가이드라인, 전달 사항, 입금 주의점을 입력하세요."
                                rows={4}
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                            />
                        </div>
                        <p className="font-caption text-caption text-secondary">참여 링크 진입 페이지 상단 및 팀원 카카오톡 알림에 포함되어 노출됩니다.</p>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full" />
                    {/* Field 6: Policy Checkbox Agreement */}
                    <div className="flex flex-col gap-2 p-space-md rounded bg-surface">
                        <div className="flex items-start gap-space-sm cursor-pointer">
                            <input
                                checked={agreed}
                                className="w-4 h-4 mt-0.5 accent-primary cursor-pointer"
                                id="policy-agree"
                                name="policyAgree"
                                type="checkbox"
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label className="font-label-sm text-label-sm text-primary cursor-pointer leading-tight select-none" htmlFor="policy-agree">
                                [필수] 공동구매 진행 및 예치금 결제 정책 확인 및 동의
                            </label>
                        </div>
                        <div className="pl-6 text-secondary font-caption text-caption space-y-1">
                            {POLICIES.map((policy) => (
                                <p key={policy.text}>
                                    · {policy.strong && <strong>{policy.strong}</strong>}
                                    {policy.text}
                                </p>
                            ))}
                        </div>
                    </div>
                </form>
            </div>

            {/* Right Summary & Sticky Confirmation Panel (4 Columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg sticky top-32">
                <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-sm">
                        <h3 className="font-headline-sm text-headline-sm text-primary">개설 요약 시뮬레이션</h3>
                        <span className="font-caption text-caption text-secondary font-mono">LIVE PREVIEW</span>
                    </div>
                    <div className="space-y-space-sm font-body-sm text-body-sm">
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">개설 대표자</span>
                            <span className="text-primary font-medium">홍길동 (FC 에이스 총무)</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">대표 공구 품목</span>
                            <span className="text-primary font-medium text-right">[MATCH-1] 유니폼 세트</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">적용 단가 (MOQ 달성 시)</span>
                            <span className="text-primary font-bold">33,000원 / 벌당</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">설정 정원 범위</span>
                            <span className="text-primary font-medium">
                                {MIN_QTY}명 ~ <span className="font-bold">{maxQty}</span>명
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">장바구니 수정 마감</span>
                            <span className="text-primary font-mono text-[12px]">{`${toDotDate(cartDate)} ${cartTime}`}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-secondary">최종 결제 기한</span>
                            <span className="text-primary font-mono text-[12px] font-bold">{`${toDotDate(payDate)} ${payTime}`}</span>
                        </div>
                    </div>
                    <div className="h-[1px] bg-surface-variant w-full my-1" />
                    <div className="p-space-md rounded bg-surface-container flex flex-col gap-1">
                        <div className="flex items-center justify-between text-secondary font-caption text-caption">
                            <span>목표 달성 시 총 예상 주문액</span>
                            <span className="font-mono">ESTIMATED</span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <span className="font-caption text-caption text-secondary">설정 목표 인원 기준 ({maxQty}명)</span>
                            <span className="font-headline-md text-headline-md text-primary font-bold">{(maxQty * UNIT_PRICE).toLocaleString('ko-KR')}원</span>
                        </div>
                        <p className="font-caption text-[11px] text-secondary mt-1 border-t border-surface-variant pt-1.5">
                            단가 33,000원 × 설정 인원 (수량 할인 없음, 인원별 정가 고정)
                        </p>
                    </div>
                    <div className="flex gap-2 p-3 rounded bg-surface text-secondary font-caption text-caption">
                        <Icon name="share" className="text-[16px] text-primary mt-0.5" />
                        <p className="leading-normal">
                            개설 완료 즉시 <strong>팀 고유 참여 링크 및 QR 코드</strong>가 생성되며 팀원들에게 실시간 공유할 수 있습니다.
                        </p>
                    </div>
                </div>
                <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
                    <button
                        className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                        type="button"
                        onClick={handleSubmit}
                    >
                        <Icon name="group_add" className="text-[18px]" />
                        <span>공동구매 만들기 (방 개설)</span>
                    </button>
                    <Link
                        className="w-full h-11 bg-surface-container-lowest text-primary font-label-md text-label-md rounded flex items-center justify-center gap-1 hover:bg-surface-container transition-all cursor-pointer"
                        href={ROUTES.groupPurchases}
                    >
                        <span>취소하고 돌아가기</span>
                    </Link>
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-secondary font-caption text-caption">
                        <Icon name="lock" className="text-[14px]" />
                        <span>공동구매 생성 수수료 0원 / 개설자 무료</span>
                    </div>
                </div>
                <div className="p-space-md rounded bg-surface text-secondary font-caption text-caption flex flex-col gap-1.5">
                    <span className="font-label-sm text-label-sm text-primary">자주 묻는 질문</span>
                    <p>
                        <strong>Q. 개설 후에도 일정을 변경할 수 있나요?</strong>
                    </p>
                    <p className="pl-2">팀원 1인 이상이 결제를 완료하기 전까지는 마감 일시를 연장할 수 있습니다.</p>
                    <p className="mt-1">
                        <strong>Q. 예치금 결제는 어떻게 진행되나요?</strong>
                    </p>
                    <p className="pl-2">각 팀원이 각자의 계정 예치금 잔액 또는 간편결제를 통해 본인 몫만 분할 결제합니다.</p>
                </div>
            </div>
        </div>
    );
}
