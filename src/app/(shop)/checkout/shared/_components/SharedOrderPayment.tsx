'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/api/generated/member-controller/member-controller';
import type { MemberProfileResponse, ParticipantResponse, SharedGroupOrderDetailResponse, TeamDeliveryAddress } from '@/api/generated/model';
import {
    getGetBySharedGroupOrderQueryKey,
    usePaySharedGroupOrder,
} from '@/api/generated/payment-controller/payment-controller';
import {
    getGetDetail3QueryKey,
    getGetMyList3QueryKey,
    useGetDetail3,
} from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import {
    getGetMyWalletQueryKey,
    getGetMyWalletTransactionsQueryKey,
    useGetMyWallet,
} from '@/api/generated/wallet-controller/wallet-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, formatPhone, parseKst } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import Notice from '../../_components/Notice';

const CANCEL_REASON_LABEL: Record<string, string> = {
    DEADLINE_EXPIRED: '결제 기한 안에 모든 참여자가 결제하지 않아 취소되었습니다.',
    CREATOR_CANCELED: '만든 사람이 공동구매를 취소했습니다.',
    OUT_OF_STOCK: '재고가 부족해 취소되었습니다.',
    SALES_STOPPED: '판매자가 판매를 중지해 공동 주문이 취소되었습니다.', 
};

// 공동 주문(?order=공동주문id)을 상태별로 보여 준다.
// 결과 화면을 따로 두지 않고 상태로 나누므로 새로고침·뒤로 가기를 해도 지금 상태가 그대로 보인다.
export default function SharedOrderPayment() {
    const orderId = Number(useSearchParams().get('order'));
    const valid = Number.isInteger(orderId) && orderId > 0;
    const query = useGetDetail3(orderId, { query: { enabled: valid } });
    const order = query.data?.data;

    if (!valid) return <Notice message="결제할 공동 주문을 찾을 수 없습니다." />;
    if (query.isPending) return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    if (!order) return <Notice message={errorMessage(query.error, '공동 주문 정보를 불러오지 못했습니다.')} />;

    if (order.status === 'CONFIRMED') return <SharedConfirmed order={order} />;
    if (order.status === 'CANCELED') return <SharedCanceled order={order} />;
    if (order.myPaymentStatus === 'PAID') return <SharedWaiting order={order} />;
    return <SharedPayment orderId={orderId} order={order} />;
}

// ===== 결제 전 =====
function SharedPayment({ orderId, order }: { orderId: number; order: SharedGroupOrderDetailResponse }) {
    const queryClient = useQueryClient();
    // 잔액은 다른 탭에서 바뀔 수 있어 화면에 들어올 때마다 새로 받는다.
    const wallet = useGetMyWallet({ query: { staleTime: 0 } });
    const balance = wallet.data?.data?.balance ?? 0;
    const amount = order.myShareAmount ?? 0;
    const sufficient = balance >= amount;
    const deadlinePassed = isPast(order.paymentDeadlineAt, order.serverTime);

    // 만든 사람은 결제하면서 팀 배송지를 정한다. 회원 정보의 기본 배송지로 미리 채운다.
    const needsAddress = order.creator === true && !order.teamDeliveryAddress;
    const [address, setAddress] = useState<TeamDeliveryAddress | null>(null);
    const profile = useProfile({ query: { enabled: needsAddress } });
    const defaults = toAddress(profile.data?.data);
    const current = address ?? defaults;

    const [agreed, setAgreed] = useState(false);

    const pay = usePaySharedGroupOrder({
        mutation: {
            onSuccess: () => {
                for (const queryKey of [
                    getGetMyWalletQueryKey(),
                    getGetMyWalletTransactionsQueryKey(),
                    getGetMyList3QueryKey(),
                    getGetBySharedGroupOrderQueryKey(orderId),
                ]) {
                    void queryClient.invalidateQueries({ queryKey });
                }
                // 내 결제 상태가 PAID로 바뀌면 이 화면이 대기(또는 확정) 화면으로 바뀐다.
                void queryClient.invalidateQueries({ queryKey: getGetDetail3QueryKey(orderId) });
            },
            // 잔액 부족·기한 만료 등은 화면에 보인 값이 바뀐 것이므로 다시 받아 맞춘다.
            onError: () => {
                void queryClient.invalidateQueries({ queryKey: getGetMyWalletQueryKey() });
                void queryClient.invalidateQueries({ queryKey: getGetDetail3QueryKey(orderId) });
            },
        },
    });

    const addressValid = !needsAddress || isValidAddress(current);
    const busy = pay.isPending || pay.isSuccess;
    const canPay = !deadlinePassed && sufficient && addressValid && agreed && !busy && !wallet.isPending;

    const submit = () => {
        pay.mutate({
            sharedGroupOrderId: orderId,
            data: needsAddress ? { teamDeliveryAddress: trimAddress(current) } : undefined,
        });
    };

    return (
        <Card>
            <Heading icon="account_balance_wallet" title="내 몫을 결제해주세요" />
            <OrderSummary order={order}>
                <dt className="text-secondary">결제 기한</dt>
                <dd className="text-on-surface">{formatDateTime(order.paymentDeadlineAt)} 까지</dd>
            </OrderSummary>

            <Participants order={order} />

            {needsAddress && (
                <section className="border border-outline-variant p-space-md flex flex-col gap-space-sm" aria-label="팀 배송지">
                    <h3 className="font-label-md text-label-md text-primary font-bold">팀 배송지</h3>
                    <p className="font-caption text-caption text-secondary">만든 사람이 결제할 때 팀 전체가 받을 배송지를 정합니다.</p>
                    <div className="grid grid-cols-2 gap-space-sm">
                        <AddressInput label="받는 분" value={current.receiverName} onChange={(v) => setAddress({ ...current, receiverName: v })} />
                        <AddressInput
                            label="연락처"
                            value={current.receiverPhone}
                            placeholder="010-0000-0000"
                            onChange={(v) => setAddress({ ...current, receiverPhone: formatPhone(v) })}
                        />
                        <AddressInput label="우편번호" value={current.zipCode} onChange={(v) => setAddress({ ...current, zipCode: v })} />
                        <div />
                        <div className="col-span-2">
                            <AddressInput label="주소" value={current.address} onChange={(v) => setAddress({ ...current, address: v })} />
                        </div>
                        <div className="col-span-2">
                            <AddressInput
                                label="상세 주소 (선택)"
                                value={current.addressDetail}
                                onChange={(v) => setAddress({ ...current, addressDetail: v })}
                            />
                        </div>
                    </div>
                </section>
            )}

            <section className="border border-outline-variant p-space-md flex flex-col gap-space-sm" aria-label="예치금 결제">
                <h3 className="font-label-md text-label-md text-primary font-bold">예치금 결제</h3>
                {wallet.isPending ? (
                    <div className="h-20 bg-surface-container-low animate-pulse" aria-hidden />
                ) : (
                    <>
                        <dl className="grid grid-cols-[1fr_auto] gap-y-space-xs font-body-sm text-body-sm">
                            <dt className="text-on-surface-variant">내 분담금</dt>
                            <dd className="text-on-surface font-semibold text-right">{formatPrice(amount)}</dd>
                            <dt className="text-on-surface-variant">보유 예치금</dt>
                            <dd className="text-on-surface text-right">{formatPrice(balance)}</dd>
                            {sufficient && (
                                <>
                                    <dt className="text-on-surface-variant">결제 후 잔액</dt>
                                    <dd className="text-on-surface text-right">{formatPrice(balance - amount)}</dd>
                                </>
                            )}
                        </dl>
                        {deadlinePassed ? (
                            <p className="p-space-xs bg-error-container text-on-error-container font-caption text-caption text-center" role="status">
                                결제 기한이 지나 결제할 수 없습니다. 공동구매는 곧 자동으로 취소되고 낸 분담금은 환불됩니다.
                            </p>
                        ) : (
                            !sufficient && (
                                <div className="p-space-xs bg-error-container text-on-error-container font-caption text-caption flex flex-wrap items-center justify-center gap-x-space-sm" role="status">
                                    <span>예치금이 {formatPrice(amount - balance)} 부족합니다.</span>
                                    <Link className="underline font-semibold" href={ROUTES.depositCharge}>
                                        예치금 충전하기
                                    </Link>
                                </div>
                            )
                        )}
                    </>
                )}
            </section>

            <label className="flex items-start gap-space-xs cursor-pointer select-none">
                <input className="w-4 h-4 mt-0.5 accent-primary" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className="font-caption text-caption text-secondary">
                    결제하면 예치금에서 바로 차감됩니다. 전원이 결제하면 주문이 확정되고 이후에는 환불할 수 없으며,
                    기한 안에 전원이 결제하지 않으면 공동구매가 취소되고 낸 분담금은 자동 환불됩니다.
                </span>
            </label>

            {pay.isError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {payErrorMessage(pay.error)}
                </p>
            )}
            {needsAddress && !addressValid && (
                <p className="font-caption text-caption text-secondary">받는 분, 연락처(010-0000-0000), 우편번호, 주소를 입력하면 결제할 수 있습니다.</p>
            )}

            <button
                className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs hover:opacity-90 disabled:opacity-50"
                type="button"
                disabled={!canPay}
                onClick={submit}
            >
                <Icon name="account_balance_wallet" className="text-[18px]" />
                {busy ? '결제 중...' : `${formatPrice(amount)} 결제하기`}
            </button>
        </Card>
    );
}

// ===== 내 결제는 끝났고 다른 참여자를 기다리는 중 =====
function SharedWaiting({ order }: { order: SharedGroupOrderDetailResponse }) {
    return (
        <Card>
            <Heading icon="hourglass_top" title="결제가 완료되었습니다" />
            <p className="font-body-sm text-body-sm text-secondary">
                다른 참여자가 모두 결제하면 주문이 확정됩니다. 결제 기한 {formatDateTime(order.paymentDeadlineAt)} 까지 모이지 않으면 낸 분담금은 자동
                환불됩니다.
            </p>
            <OrderSummary order={order}>
                <dt className="text-secondary">내 분담금</dt>
                <dd className="text-on-surface font-semibold">{formatPrice(order.myShareAmount ?? 0)}</dd>
            </OrderSummary>
            <Participants order={order} />
            <BackToGroupPurchase order={order} />
        </Card>
    );
}

// ===== 전원 결제로 확정 =====
function SharedConfirmed({ order }: { order: SharedGroupOrderDetailResponse }) {
    return (
        <Card>
            <Heading icon="check_circle" title="전원 결제 완료! 주문이 확정되었습니다" />
            <OrderSummary order={order}>
                <dt className="text-secondary">확정 시각</dt>
                <dd className="text-on-surface">{formatDateTime(order.confirmedAt)}</dd>
                <dt className="text-secondary">내 분담금</dt>
                <dd className="text-on-surface font-semibold">{formatPrice(order.myShareAmount ?? 0)}</dd>
            </OrderSummary>
            {order.teamDeliveryAddress && (
                <p className="font-body-sm text-body-sm text-on-surface">
                    배송지: ({order.teamDeliveryAddress.zipCode}) {order.teamDeliveryAddress.address} {order.teamDeliveryAddress.addressDetail ?? ''} ·{' '}
                    {order.teamDeliveryAddress.receiverName}
                </p>
            )}
            <BackToGroupPurchase order={order} />
        </Card>
    );
}

// ===== 무산 =====
function SharedCanceled({ order }: { order: SharedGroupOrderDetailResponse }) {
    const iPaid = order.myPaymentStatus === 'PAID';
    return (
        <Card>
            <Heading icon="cancel" title="취소된 공동 주문입니다" muted />
            <p className="font-body-sm text-body-sm text-secondary">
                {CANCEL_REASON_LABEL[order.cancelReason ?? ''] ?? '공동 주문이 취소되었습니다.'}
            </p>
            {iPaid && (
                <div className="p-space-sm bg-surface-container-low border border-outline-variant font-body-sm text-body-sm flex items-center gap-space-xs">
                    <Icon name="undo" className="text-[18px] text-primary" />
                    결제한 분담금 {formatPrice(order.myShareAmount ?? 0)}은 예치금으로 자동 환불되었습니다.
                    <Link className="ml-auto underline font-semibold text-primary" href={ROUTES.depositHistory}>
                        예치금 내역
                    </Link>
                </div>
            )}
            <BackToGroupPurchase order={order} />
        </Card>
    );
}

// ===== 공통 조각 =====
function Participants({ order }: { order: SharedGroupOrderDetailResponse }) {
    const participants: ParticipantResponse[] = order.participants ?? [];
    const paid = participants.filter((p) => p.status === 'PAID').length;
    const ratio = participants.length ? (paid / participants.length) * 100 : 0;

    return (
        <section className="border border-outline-variant p-space-md flex flex-col gap-space-sm" aria-label="결제 현황">
            <div className="flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-primary font-bold">결제 현황</h3>
                <span className="font-label-md text-label-md text-primary font-bold">
                    {paid} / {participants.length}명
                </span>
            </div>
            <div className="h-2 bg-surface-container">
                <div className="h-2 bg-primary transition-all" style={{ width: `${ratio}%` }} />
            </div>
            <ul className="flex flex-col divide-y divide-surface-container font-body-sm text-body-sm">
                {participants.map((p) => (
                    <li key={p.memberId} className="flex items-center justify-between py-space-xs">
                        <span>
                            {p.nickname ?? `회원 #${p.memberId}`}
                            {p.creator && <span className="ml-1 font-caption text-caption text-primary">(만든 사람)</span>}
                        </span>
                        <span className="text-secondary">{formatPrice(p.shareAmount ?? 0)}</span>
                        <span className={p.status === 'PAID' ? 'text-primary font-semibold' : 'text-outline'}>
                            {p.status === 'PAID' ? '결제 완료' : '미결제'}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function BackToGroupPurchase({ order }: { order: SharedGroupOrderDetailResponse }) {
    if (!order.sharedGroupPurchaseId) return null;
    return (
        <Link
            className="w-full h-11 border border-outline-variant font-label-md text-label-md flex items-center justify-center hover:bg-surface-container"
            href={ROUTES.groupPurchase(order.sharedGroupPurchaseId)}
        >
            공동구매로 돌아가기
        </Link>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return <div className="max-w-[640px] w-full mx-auto bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">{children}</div>;
}

function Heading({ icon, title, muted = false }: { icon: string; title: string; muted?: boolean }) {
    return (
        <div className="flex items-center gap-space-sm">
            <Icon name={icon} className={`text-[24px] ${muted ? 'text-outline' : 'text-primary'}`} />
            <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
        </div>
    );
}

function OrderSummary({ order, children }: { order: SharedGroupOrderDetailResponse; children: React.ReactNode }) {
    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-space-md gap-y-space-xs font-body-sm text-body-sm">
            <dt className="text-secondary">공동 주문</dt>
            <dd className="text-on-surface">#{order.id}</dd>
            <dt className="text-secondary">총 금액</dt>
            <dd className="text-on-surface">{formatPrice(order.totalAmount ?? 0)}</dd>
            {children}
        </dl>
    );
}

function AddressInput({ label, value, placeholder, onChange }: { label: string; value?: string; placeholder?: string; onChange: (v: string) => void }) {
    return (
        <label className="flex flex-col gap-1 font-caption text-caption text-secondary">
            {label}
            <input
                className="h-10 px-space-sm border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none"
                value={value ?? ''}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );
}

// ===== 도우미 =====
function toAddress(profile: MemberProfileResponse | undefined): TeamDeliveryAddress {
    return {
        receiverName: profile?.nickname ?? '',
        receiverPhone: profile?.phone ?? '',
        zipCode: profile?.defaultAddress?.zipCode ?? '',
        address: profile?.defaultAddress?.basicAddress ?? '',
        addressDetail: profile?.defaultAddress?.detailAddress ?? '',
    };
}

function isValidAddress(a: TeamDeliveryAddress): boolean {
    return !!a.receiverName?.trim() && /^010-\d{4}-\d{4}$/.test(a.receiverPhone ?? '') && !!a.zipCode?.trim() && !!a.address?.trim();
}

function trimAddress(a: TeamDeliveryAddress): TeamDeliveryAddress {
    return {
        receiverName: a.receiverName?.trim(),
        receiverPhone: a.receiverPhone,
        zipCode: a.zipCode?.trim(),
        address: a.address?.trim(),
        addressDetail: a.addressDetail?.trim() || undefined,
    };
}

// BE 시각은 시간대 없는 한국 시간이라 parseKst로 해석한다. 서버 시각이 오면 그걸 기준으로 판단한다.
function isPast(deadline: string | undefined, serverTime: string | undefined): boolean {
    const end = parseKst(deadline);
    if (!end) return false;
    const now = parseKst(serverTime)?.getTime() ?? Date.now();
    return end.getTime() <= now;
}

function payErrorMessage(error: unknown): string {
    const code = error instanceof ApiError ? error.resultCode : undefined;
    if (code?.endsWith('WALLET_INSUFFICIENT_BALANCE')) return '예치금이 부족합니다. 충전한 뒤 다시 결제해주세요.';
    if (code?.endsWith('ORDER_TEAM_ADDRESS_REQUIRED')) return '만든 사람은 팀 배송지를 입력해야 결제할 수 있습니다.';
    if (code?.endsWith('PAYMENT_ORDER_NOT_PAYABLE')) return '결제할 수 없는 상태입니다. 결제 기한이 지났거나 이미 처리된 공동 주문입니다.';
    return errorMessage(error, '결제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
}