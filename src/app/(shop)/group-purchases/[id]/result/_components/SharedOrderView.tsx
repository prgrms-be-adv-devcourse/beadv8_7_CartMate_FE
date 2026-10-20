'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { SharedGroupOrderDetailResponse } from '@/api/generated/model';
import {
    getGetDetail3QueryKey,
    getGetMyList3QueryKey,
    useCancel2,
} from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import { getGetDetail1QueryKey, useGetDetail1 } from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import WalletPaymentSummary, { payErrorMessage } from '../../../../checkout/_components/WalletPaymentSummary';
import ItemThumb from '../../../_components/ItemThumb';
import Notice from '../../../_components/Notice';
import { DetailSkeleton } from '../../../_components/SharedStatusParts';
import { useNow } from '../../../individual/_lib/useNow';
import {
    CANCEL_REASON_LABEL,
    canPayNow,
    ORDER_STATUS_LABEL,
    orderBadgeClass,
    paymentRemainingMs,
    useSharedOrderOfPurchase,
    useSharedOrderPay,
} from '../../../_lib/sharedGroupOrder';
import { hasErrorCode, remainingText } from '../../../_lib/sharedGroupPurchase';

type Order = SharedGroupOrderDetailResponse;

// 공동 주문 결과 · N빵 결제 (/group-purchases/{id}/result). 경로의 id는 공동구매 id다.
// 결제 진행 중이면 내 몫 결제와 팀원 결제 현황, 확정·취소되면 결과를 같은 화면에서 상태로 나눠 보여 준다.
export default function SharedOrderView() {
    const { id } = useParams<{ id: string }>();
    const purchaseId = Number(id);
    const validId = Number.isInteger(purchaseId) && purchaseId > 0;
    const { list, summary, orderId, detail } = useSharedOrderOfPurchase(purchaseId, validId);
    const order = detail.data?.data;

    if (!validId) return <Notice message="존재하지 않는 공동구매입니다." />;
    if (list.isPending) return <DetailSkeleton />;
    if (list.isError) return <Notice message={errorMessage(list.error, '공동 주문 정보를 불러오지 못했습니다.')} onRetry={() => void list.refetch()} />;
    if (!summary || orderId === undefined) {
        return (
            <Notice
                message="아직 공동 주문이 없습니다. 공동구매가 마감되면 공동 주문이 만들어지고 이 화면에서 내 몫을 결제할 수 있습니다."
                href={ROUTES.groupPurchase(purchaseId)}
                linkLabel="공동구매로 돌아가기"
            />
        );
    }
    if (detail.isPending) return <DetailSkeleton />;
    if (!order) {
        const status = detail.error instanceof ApiError ? detail.error.status : undefined;
        if (status === 403) return <Notice message="공동 주문 참여자만 볼 수 있습니다." />;
        if (status === 404) return <Notice message="존재하지 않는 공동 주문입니다." />;
        return <Notice message={errorMessage(detail.error, '공동 주문 정보를 불러오지 못했습니다.')} onRetry={() => void detail.refetch()} />;
    }

    return (
        <OrderContent
            purchaseId={purchaseId}
            orderId={orderId}
            order={order}
            receivedAt={detail.dataUpdatedAt}
            refreshing={detail.isFetching}
            refetchFailed={detail.isRefetchError}
            refresh={() => void detail.refetch()}
        />
    );
}

type ContentProps = {
    purchaseId: number;
    orderId: number;
    order: Order;
    receivedAt: number;
    refreshing: boolean;
    refetchFailed: boolean;
    refresh: () => void;
};

function OrderContent({ purchaseId, orderId, order, receivedAt, refreshing, refetchFailed, refresh }: ContentProps) {
    const { user } = useCurrentUser();
    const now = useNow().getTime();
    // 제목은 공동구매 상세에만 있다. 못 받아도 주문 화면은 그대로 쓸 수 있다.
    const purchase = useGetDetail1(purchaseId).data?.data;
    const remainingMs = paymentRemainingMs(order, receivedAt, now);
    const participants = order.participants ?? [];
    const items = order.items ?? [];
    const paidCount = participants.filter((p) => p.status === 'PAID').length;
    const percent = participants.length > 0 ? Math.round((paidCount / participants.length) * 100) : 0;
    const expired = order.status === 'PAYING' && remainingMs !== null && remainingMs <= 0;

    return (
        <div className="flex flex-col w-full gap-space-lg">
            {refetchFailed && (
                <div className="p-space-sm rounded bg-error-container/40 flex flex-wrap items-center gap-space-xs" role="status">
                    <span className="font-body-sm text-body-sm text-on-surface">최신 결제 현황을 불러오지 못해 이전 내용을 보여 주고 있습니다.</span>
                    <button className="font-label-sm text-label-sm text-primary underline" type="button" onClick={refresh}>
                        다시 시도
                    </button>
                </div>
            )}

            {/* 상태 요약 */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden flex flex-col gap-space-md">
                <div className={`absolute top-0 left-0 w-2 h-full ${order.status === 'CANCELED' ? 'bg-outline-variant' : 'bg-primary'}`} />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pl-space-sm">
                    <div className="min-w-0 flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={orderBadgeClass(order.status)}>{order.status ? ORDER_STATUS_LABEL[order.status] : '-'}</span>
                            <span className="font-caption text-caption text-secondary">공동 주문 #{orderId} · 공동구매 #{purchaseId}</span>
                        </div>
                        <h1 className="font-headline-md text-headline-md text-primary tracking-tight break-all">{purchase?.title ?? '공동 주문'}</h1>
                        <p className="font-body-md text-body-md text-on-surface">
                            <StatusMessage order={order} remainingMs={remainingMs} />
                        </p>
                    </div>
                    <div className="md:w-60 shrink-0 p-space-md rounded-lg bg-surface-container text-center">
                        {order.status === 'PAYING' ? (
                            <>
                                <span className="font-caption text-caption text-secondary block mb-1">결제 마감까지</span>
                                <span className="block font-headline-md text-headline-md text-primary font-bold tracking-tight">
                                    {remainingMs === null ? '-' : remainingText(remainingMs)}
                                </span>
                                <p className="font-caption text-caption text-secondary mt-1">{formatDateTime(order.paymentDeadlineAt)}까지</p>
                            </>
                        ) : (
                            <>
                                <span className="font-caption text-caption text-secondary block mb-1">{order.status === 'CONFIRMED' ? '확정 일시' : '취소 일시'}</span>
                                <span className="block font-label-md text-label-md text-primary font-bold">
                                    {formatDateTime(order.status === 'CONFIRMED' ? order.confirmedAt : order.canceledAt)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-surface rounded-lg p-space-md space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-body-sm text-body-sm text-primary font-semibold">결제 완료</span>
                        <span className="font-label-md text-label-md text-primary font-bold">
                            {paidCount}명 <span className="text-secondary font-body-sm text-body-sm">/ {participants.length}명</span>
                        </span>
                    </div>
                    <div
                        className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5"
                        role="progressbar"
                        aria-label="결제 완료 인원"
                        aria-valuemin={0}
                        aria-valuemax={participants.length}
                        aria-valuenow={paidCount}
                    >
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        className="flex items-center gap-1 px-2 py-1 rounded text-secondary hover:bg-surface font-caption text-caption disabled:opacity-60"
                        type="button"
                        onClick={refresh}
                        disabled={refreshing}
                    >
                        <Icon name="sync" className={`text-[16px]${refreshing ? ' animate-spin' : ''}`} />
                        새로고침
                    </button>
                </div>
            </section>

            <div className="grid grid-cols-12 gap-gutter items-start">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
                    {/* 참여자 결제 현황 */}
                    <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                        <h2 className="font-headline-sm text-headline-sm text-primary pb-space-md">참여자 결제 현황</h2>
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface">
                                        <th scope="col" className="py-3 px-4">참여자</th>
                                        <th scope="col" className="py-3 px-4 text-right">분담금</th>
                                        <th scope="col" className="py-3 px-4 text-center">결제</th>
                                        <th scope="col" className="py-3 px-4 text-center">결제 일시</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                                    {participants.map((p) => {
                                        const isMe = user?.id !== undefined && p.memberId === user.id;
                                        return (
                                            <tr key={p.memberId} className={p.creator ? 'bg-surface-container-low' : ''}>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-label-md text-label-md text-primary ${p.creator || isMe ? 'font-bold' : 'font-medium'}`}>
                                                            {p.nickname ?? '알 수 없음'}
                                                            {isMe ? ' (나)' : ''}
                                                        </span>
                                                        {p.creator && <span className="font-caption text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">만든 사람</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-label-md text-label-md text-primary">{formatPrice(p.shareAmount ?? 0)}</td>
                                                <td className="py-3.5 px-4 text-center">
                                                    {p.status === 'PAID' && order.status === 'CANCELED' ? (
                                                        // 취소되면 BE가 결제한 분담금을 자동 환불한다(참여자 상태는 PAID로 남음).
                                                        <span className="font-caption text-caption font-bold text-secondary">결제 후 환불</span>
                                                    ) : p.status === 'PAID' ? (
                                                        <span className="inline-flex items-center gap-1 font-caption text-caption font-bold text-primary">
                                                            <Icon name="check_circle" className="text-[16px]" />
                                                            결제 완료
                                                        </span>
                                                    ) : (
                                                        <span className="font-caption text-caption text-secondary">{order.status === 'PAYING' ? '결제 대기' : '미결제'}</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-center text-secondary">{p.paidAt ? formatDateTime(p.paidAt) : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="pt-space-md flex items-start gap-1 text-secondary font-caption text-caption">
                            <Icon name="info" className="text-[16px]" />
                            <span>총액 {formatPrice(order.totalAmount ?? 0)}을 인원 수로 나누고, 나누어떨어지지 않는 금액은 만든 사람이 부담합니다.</span>
                        </p>
                    </section>

                    {/* 주문 상품 */}
                    <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
                        <div className="flex items-center gap-space-xs">
                            <h2 className="font-headline-sm text-headline-sm text-primary">주문 상품</h2>
                            <span className="font-caption text-caption text-secondary px-2 py-0.5 bg-surface-container rounded-full">{items.length}종</span>
                        </div>
                        <ul className="flex flex-col divide-y divide-surface-container">
                            {items.map((item) => (
                                <li key={item.itemId} className="py-space-sm flex items-center gap-space-md">
                                    <ItemThumb src={item.imageUrl} className="w-14 h-14" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-body-md text-body-md text-on-surface truncate">{item.productName ?? '상품 정보 없음'}</div>
                                        <div className="font-caption text-caption text-secondary">
                                            {item.optionName && `옵션: ${item.optionName} · `}
                                            {formatPrice(item.unitPrice ?? 0)} × {item.quantity ?? 0}개
                                        </div>
                                    </div>
                                    <span className="font-label-md text-label-md text-on-surface shrink-0">{formatPrice(item.amount ?? 0)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex items-center justify-between border-t border-outline-variant pt-space-sm font-body-lg text-body-lg text-primary font-bold">
                            <span>총액</span>
                            <span>{formatPrice(order.totalAmount ?? 0)}</span>
                        </div>
                    </section>
                </div>

                <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg">
                    <MyPaymentCard purchaseId={purchaseId} orderId={orderId} order={order} expired={expired} remainingMs={remainingMs} myPaidAt={participants.find((p) => user?.id !== undefined && p.memberId === user.id)?.paidAt} />
                    <TeamAddressCard order={order} />
                    {order.creator && order.status === 'PAYING' && <CancelOrderCard purchaseId={purchaseId} orderId={orderId} paidCount={paidCount} />}
                    <Link
                        className="h-11 rounded bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container-high"
                        href={ROUTES.groupPurchase(purchaseId)}
                    >
                        <Icon name="arrow_back" className="text-[18px]" />
                        공동구매 상세로
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatusMessage({ order, remainingMs }: { order: Order; remainingMs: number | null }) {
    if (order.status === 'CONFIRMED') return <>참여자 전원이 결제해 주문이 확정되었습니다. 상품은 팀 배송지로 한 번에 배송됩니다.</>;
    if (order.status === 'CANCELED') {
        return (
            <>
                {(order.cancelReason && CANCEL_REASON_LABEL[order.cancelReason]) ?? '취소된 공동 주문입니다.'} 이미 결제한 분담금은 예치금으로 자동 환불됩니다.
            </>
        );
    }
    if (remainingMs !== null && remainingMs <= 0) return <>결제 기한이 지났습니다. 곧 자동으로 취소되며, 이미 결제한 분담금은 예치금으로 환불됩니다.</>;
    return <>참여자 각자 자기 몫을 예치금으로 결제합니다. 결제 기한 안에 모두 결제하면 주문이 확정되고, 한 명이라도 결제하지 않으면 취소됩니다.</>;
}

type MyPaymentProps = { purchaseId: number; orderId: number; order: Order; expired: boolean; remainingMs: number | null; myPaidAt?: string };

function MyPaymentCard({ purchaseId, orderId, order, expired, remainingMs, myPaidAt }: MyPaymentProps) {
    const amount = order.myShareAmount ?? 0;
    const paid = order.myPaymentStatus === 'PAID';

    return (
        <section className="bg-surface-container-high rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" aria-label="내 몫 결제">
            <div className="flex items-center gap-space-xs text-primary">
                <Icon name="account_balance_wallet" className="text-[20px]" />
                <h2 className="font-headline-sm text-headline-sm">내 몫</h2>
                {order.creator && <span className="ml-auto font-caption text-caption text-secondary">만든 사람 부담 포함</span>}
            </div>
            <div className="flex items-center justify-between bg-surface-container-lowest p-space-md rounded">
                <span className="font-body-md text-body-md text-secondary">분담금</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">{formatPrice(amount)}</span>
            </div>
            {paid ? (
                <div className="bg-surface-container-lowest p-space-md rounded flex flex-col gap-1">
                    <span className="flex items-center gap-1 font-label-md text-label-md text-primary font-bold">
                        <Icon name="task_alt" className="text-[18px]" />
                        {order.status === 'CANCELED' ? '결제했던 분담금은 환불됩니다' : '내 몫 결제 완료'}
                    </span>
                    <span className="font-caption text-caption text-secondary">결제 일시 {formatDateTime(myPaidAt)} · 팀바이 예치금</span>
                    {order.status === 'PAYING' && <span className="font-caption text-caption text-secondary">다른 참여자가 모두 결제하면 주문이 확정됩니다.</span>}
                </div>
            ) : order.status !== 'PAYING' ? (
                <p className="font-body-sm text-body-sm text-secondary">결제하지 않았습니다.</p>
            ) : order.creator ? (
                <div className="flex flex-col gap-space-sm">
                    <p className="font-body-sm text-body-sm text-on-surface">만든 사람은 팀 전체 상품을 받을 배송지를 입력하면서 결제합니다.</p>
                    {expired ? (
                        <p className="p-space-xs bg-error-container text-on-error-container font-caption text-caption text-center">결제 기한이 지나 결제할 수 없습니다.</p>
                    ) : (
                        <Link
                            className="h-12 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 hover:opacity-90"
                            href={ROUTES.groupPurchaseShipping(purchaseId)}
                        >
                            <Icon name="local_shipping" className="text-[18px]" />
                            배송지 입력하고 결제하기
                        </Link>
                    )}
                </div>
            ) : (
                <MemberPay orderId={orderId} order={order} remainingMs={remainingMs} />
            )}
        </section>
    );
}

// 참여자(만든 사람 아님)의 예치금 결제. 배송지는 만든 사람이 정하므로 본문 없이 결제한다.
function MemberPay({ orderId, order, remainingMs }: { orderId: number; order: Order; remainingMs: number | null }) {
    // 잔액은 다른 탭에서 바뀔 수 있어 화면에 들어올 때마다 새로 받는다.
    const wallet = useGetMyWallet({ query: { staleTime: 0 } });
    const pay = useSharedOrderPay(orderId);
    const amount = order.myShareAmount ?? 0;
    const balance = wallet.data?.data?.balance;
    const payable = canPayNow(order, remainingMs);
    const busy = pay.isPending || pay.isSuccess;
    const canPay = payable && balance !== undefined && balance >= amount && !busy;

    return (
        <div className="flex flex-col gap-space-sm">
            <div className="bg-surface-container-lowest p-space-md rounded flex flex-col gap-space-sm">
                {wallet.isPending ? (
                    <div className="h-16 bg-surface-container-low animate-pulse" aria-hidden />
                ) : balance === undefined ? (
                    <div className="flex items-center justify-between gap-space-sm font-body-sm text-body-sm">
                        <span className="text-error">{errorMessage(wallet.error, '예치금 정보를 불러오지 못했습니다.')}</span>
                        <button className="h-8 px-space-sm border border-outline-variant rounded hover:bg-surface-container shrink-0" type="button" onClick={() => void wallet.refetch()}>
                            다시 시도
                        </button>
                    </div>
                ) : (
                    <WalletPaymentSummary amount={amount} walletBalance={balance} payable={payable} notPayableMessage="결제 기한이 지나 결제할 수 없습니다. 공동 주문은 곧 자동으로 취소됩니다." />
                )}
            </div>
            {pay.isError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {payErrorMessage(pay.error)}
                </p>
            )}
            <button
                className="h-12 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                disabled={!canPay}
                onClick={() => {
                    if (canPay) pay.mutate({ sharedGroupOrderId: orderId });
                }}
            >
                {pay.isSuccess ? '결제 완료' : busy ? '결제 중...' : `${formatPrice(amount)} 예치금으로 결제하기`}
            </button>
        </div>
    );
}

function TeamAddressCard({ order }: { order: Order }) {
    const address = order.teamDeliveryAddress;
    const hasAddress = Boolean(address?.address);
    if (!hasAddress && order.status !== 'PAYING') return null;
    return (
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs text-primary">
                <Icon name="local_shipping" className="text-[20px]" />
                <h2 className="font-headline-sm text-headline-sm">팀 배송지</h2>
            </div>
            {hasAddress && address ? (
                <dl className="grid grid-cols-[72px_1fr] gap-y-1 font-body-sm text-body-sm">
                    <dt className="text-secondary">받는 분</dt>
                    <dd className="text-on-surface">{address.receiverName}</dd>
                    <dt className="text-secondary">연락처</dt>
                    <dd className="text-on-surface">{address.receiverPhone}</dd>
                    <dt className="text-secondary">주소</dt>
                    <dd className="text-on-surface break-all">
                        ({address.zipCode}) {address.address} {address.addressDetail}
                    </dd>
                </dl>
            ) : (
                <p className="font-body-sm text-body-sm text-secondary">만든 사람이 결제할 때 팀 배송지를 입력합니다. 확정되면 상품이 이 주소로 한 번에 배송됩니다.</p>
            )}
        </section>
    );
}

// 만든 사람의 공동 주문 취소. 결제 진행 중에만 되고, 이미 결제한 분담금은 BE가 자동 환불한다.
function CancelOrderCard({ purchaseId, orderId, paidCount }: { purchaseId: number; orderId: number; paidCount: number }) {
    const queryClient = useQueryClient();
    const cancel = useCancel2({
        mutation: {
            onSettled: () => {
                for (const queryKey of [getGetDetail3QueryKey(orderId), getGetMyList3QueryKey(), getGetDetail1QueryKey(purchaseId)]) {
                    void queryClient.invalidateQueries({ queryKey });
                }
            },
        },
    });
    const onCancel = () => {
        const refundNote = paidCount > 0 ? `\n이미 결제한 ${paidCount}명의 분담금은 예치금으로 자동 환불됩니다.` : '';
        if (!window.confirm(`공동 주문을 취소할까요?${refundNote}\n취소하면 되돌릴 수 없습니다.`)) return;
        cancel.mutate({ id: orderId });
    };
    return (
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
            <h2 className="font-label-md text-label-md text-on-surface font-bold">공동 주문 관리</h2>
            <p className="font-caption text-caption text-secondary">결제가 모이기 전에 주문을 취소할 수 있습니다. 결제한 분담금은 자동 환불됩니다.</p>
            {cancel.isError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {hasErrorCode(cancel.error, 'ORDER_NOT_PAYING') ? '이미 확정되었거나 취소된 공동 주문입니다.' : errorMessage(cancel.error, '취소하지 못했습니다.')}
                </p>
            )}
            <button
                className="h-11 rounded border border-error text-error font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-error-container/40 disabled:opacity-60"
                type="button"
                onClick={onCancel}
                disabled={cancel.isPending}
            >
                <Icon name="cancel" className="text-[18px]" />
                {cancel.isPending ? '취소하는 중...' : '공동 주문 취소'}
            </button>
        </section>
    );
}
