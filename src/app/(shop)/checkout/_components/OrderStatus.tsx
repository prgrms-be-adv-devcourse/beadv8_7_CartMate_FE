'use client';

import Link from 'next/link';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey } from '@/api/generated/cart-controller/cart-controller';
import type { OrderDetailItemResponse, OrderDetailResponse } from '@/api/generated/model';
import { getGetDetailQueryKey, getGetMyListQueryKey, useGetDetail } from '@/api/generated/order-controller/order-controller';
import { getGetByOrderQueryKey, getPreviewQueryKey, usePayOrder, usePreview } from '@/api/generated/payment-controller/payment-controller';
import {
    getGetMyWalletQueryKey,
    getGetMyWalletTransactionsQueryKey,
    useGetMyWallet,
} from '@/api/generated/wallet-controller/wallet-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import Notice from './Notice';

const CANCEL_REASON_LABEL: Record<string, string> = {
    BUYER_CANCELED: '주문을 취소했습니다.',
    PAYMENT_EXPIRED: '결제 기한이 지나 자동으로 취소되었습니다.',
    OUT_OF_STOCK: '재고가 부족해 취소되었습니다.',
};

// 접수된 주문(?order=주문id)을 상태별로 보여 준다. 결제 대기면 예치금 결제, 결제 완료면 결제 결과 화면이 된다.
// 결과 화면을 따로 두지 않고 주문 상태로 나누므로 새로고침·뒤로 가기를 해도 지금 상태가 그대로 보인다.
export default function OrderStatus({ orderId }: { orderId: number }) {
    const query = useGetDetail(orderId);
    const order = query.data?.data;

    if (query.isPending) return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    if (!order) return <Notice message={errorMessage(query.error, '주문 정보를 불러오지 못했습니다.')} />;

    if (order.status === 'PAID') return <OrderPaid order={order} />;
    if (order.status === 'CANCELED') return <OrderCanceled order={order} />;
    return <OrderPayment orderId={orderId} order={order} />;
}

function OrderPayment({ orderId, order }: { orderId: number; order: OrderDetailResponse }) {
    const queryClient = useQueryClient();
    // 잔액은 다른 탭에서 바뀔 수 있어 화면에 들어올 때마다 새로 받는다.
    const preview = usePreview(orderId, { query: { staleTime: 0 } });
    const info = preview.data?.data;

    const refreshOrder = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: getGetDetailQueryKey(orderId) }),
            queryClient.invalidateQueries({ queryKey: getPreviewQueryKey(orderId) }),
        ]);

    const pay = usePayOrder({
        mutation: {
            onSuccess: () => {
                // 결제되면 BE가 주문한 상품을 장바구니에서 지우고 예치금을 차감한다. 헤더 배지와 주문 화면이 따라오도록 함께 갱신한다.
                for (const queryKey of [
                    getGetCartQueryKey(),
                    getGetMyWalletQueryKey(),
                    getGetMyWalletTransactionsQueryKey(),
                    getGetMyListQueryKey(),
                    getGetByOrderQueryKey(orderId),
                ]) {
                    void queryClient.invalidateQueries({ queryKey });
                }
                // 주문 상태가 PAID로 바뀌면 이 화면이 결제 결과 화면으로 바뀐다. 결제가 끝난 주문의 미리보기는 다시 받을 필요가 없어 지운다.
                queryClient.removeQueries({ queryKey: getPreviewQueryKey(orderId) });
                void queryClient.invalidateQueries({ queryKey: getGetDetailQueryKey(orderId) });
            },
            // 잔액 부족·기한 만료 등은 화면에 보인 값이 바뀐 것이므로 주문·예치금을 다시 받아 맞춘다.
            onError: () => {
                void queryClient.invalidateQueries({ queryKey: getGetMyWalletQueryKey() });
                void refreshOrder();
            },
        },
    });

    const busy = pay.isPending || pay.isSuccess;
    // 결제는 성공했는데 주문을 다시 받아도 아직 결제 완료로 보이지 않는 경우(재조회 실패 등) 버튼이 멈춰 보이지 않게 안내한다.
    const detailFetching = useIsFetching({ queryKey: getGetDetailQueryKey(orderId) }) > 0;
    const paidButNotShown = pay.isSuccess && !detailFetching;
    const canPay = info?.payable === true && info.sufficient === true && !busy;
    const shortage = info ? (info.amount ?? 0) - (info.walletBalance ?? 0) : 0;

    return (
        <Card>
            <Heading icon="check_circle" title="주문이 접수되었습니다" />
            <OrderSummary order={order}>
                <dt className="text-secondary">결제 기한</dt>
                <dd className="text-on-surface">{formatDateTime(order.paymentDeadlineAt)} 까지</dd>
            </OrderSummary>

            <section className="border border-outline-variant p-space-md flex flex-col gap-space-sm" aria-label="예치금 결제">
                <h3 className="font-label-md text-label-md text-primary font-bold">예치금 결제</h3>
                {preview.isPending ? (
                    <div className="h-20 bg-surface-container-low animate-pulse" aria-hidden />
                ) : !info ? (
                    <div className="flex items-center justify-between gap-space-sm font-body-sm text-body-sm">
                        <span className="text-error">{errorMessage(preview.error, '결제 정보를 불러오지 못했습니다.')}</span>
                        <button className="h-8 px-space-sm border border-outline-variant hover:bg-surface-container shrink-0" type="button" onClick={() => void preview.refetch()}>
                            다시 시도
                        </button>
                    </div>
                ) : (
                    <>
                        <dl className="grid grid-cols-[1fr_auto] gap-y-space-xs font-body-sm text-body-sm">
                            <dt className="text-on-surface-variant">결제 금액</dt>
                            <dd className="text-on-surface font-semibold text-right">{formatPrice(info.amount ?? 0)}</dd>
                            <dt className="text-on-surface-variant">보유 예치금</dt>
                            <dd className="text-on-surface text-right">{formatPrice(info.walletBalance ?? 0)}</dd>
                            {info.sufficient && (
                                <>
                                    <dt className="text-on-surface-variant">결제 후 잔액</dt>
                                    <dd className="text-on-surface text-right">{formatPrice(info.balanceAfter ?? 0)}</dd>
                                </>
                            )}
                        </dl>
                        {!info.payable ? (
                            <p className="p-space-xs bg-error-container text-on-error-container font-caption text-caption text-center" role="status">
                                결제 기한이 지나 결제할 수 없습니다. 주문은 곧 자동으로 취소됩니다.
                            </p>
                        ) : (
                            !info.sufficient && (
                                <div className="p-space-xs bg-error-container text-on-error-container font-caption text-caption flex flex-wrap items-center justify-center gap-x-space-sm" role="status">
                                    <span>예치금이 {formatPrice(shortage)} 부족합니다.</span>
                                    <Link className="underline font-semibold" href={ROUTES.depositCharge}>
                                        예치금 충전하기
                                    </Link>
                                </div>
                            )
                        )}
                    </>
                )}
            </section>

            {pay.isError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {payErrorMessage(pay.error)}
                </p>
            )}
            {paidButNotShown && (
                <div className="flex items-center justify-between gap-space-sm p-space-xs bg-surface-container font-body-sm text-body-sm" role="status">
                    <span>결제가 완료되었습니다. 결제 결과를 불러오지 못했습니다.</span>
                    <button
                        className="h-8 px-space-sm border border-outline-variant hover:bg-surface-container-high shrink-0"
                        type="button"
                        onClick={() => void queryClient.invalidateQueries({ queryKey: getGetDetailQueryKey(orderId) })}
                    >
                        다시 확인
                    </button>
                </div>
            )}
            {info?.payable !== false && <p className="font-body-sm text-body-sm text-secondary">결제 기한이 지나면 주문은 자동으로 취소됩니다.</p>}
            <div className="flex flex-col sm:flex-row gap-space-sm">
                <button
                    className="flex-1 h-11 bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled={!canPay}
                    onClick={() => {
                        if (canPay) pay.mutate({ orderId });
                    }}
                >
                    {pay.isSuccess ? '결제 완료' : busy ? '결제 중...' : `${formatPrice(info?.amount ?? order.totalAmount ?? 0)} 예치금으로 결제하기`}
                </button>
                <ContinueShopping />
            </div>
        </Card>
    );
}

// BE 메시지를 그대로 쓰되, 사용자가 다음에 할 일을 알 수 있도록 몇 가지는 바꿔 말한다.
function payErrorMessage(error: unknown): string {
    const code = error instanceof ApiError ? error.resultCode : undefined;
    if (code?.endsWith('WALLET_INSUFFICIENT_BALANCE')) return '예치금이 부족합니다. 충전한 뒤 다시 결제해주세요.';
    if (code?.endsWith('PAYMENT_ORDER_NOT_PAYABLE') || code?.endsWith('ORDER_PAYMENT_EXPIRED')) {
        return '결제 기한이 지났거나 이미 처리된 주문이라 결제할 수 없습니다.';
    }
    return errorMessage(error, '결제하지 못했습니다. 잠시 후 다시 시도해주세요.');
}

function OrderPaid({ order }: { order: OrderDetailResponse }) {
    const wallet = useGetMyWallet();
    // 지금 잔액이다(이 주문의 결제 직후 잔액이 아님). 재조회 중에는 결제 전 값이 잠깐 보일 수 있어 숨긴다.
    const balance = wallet.isFetching ? undefined : wallet.data?.data?.balance;

    return (
        <Card>
            <Heading icon="task_alt" title="결제가 완료되었습니다" />
            <OrderSummary order={order}>
                <dt className="text-secondary">결제 수단</dt>
                <dd className="text-on-surface">팀바이 예치금</dd>
                <dt className="text-secondary">결제 일시</dt>
                <dd className="text-on-surface">{formatDateTime(order.paidAt)}</dd>
                {balance !== undefined && (
                    <>
                        <dt className="text-secondary">현재 예치금</dt>
                        <dd className="text-on-surface">{formatPrice(balance)}</dd>
                    </>
                )}
            </OrderSummary>
            {(order.items?.length ?? 0) > 0 && (
                <ul className="flex flex-col divide-y divide-surface-container border-t border-outline-variant">
                    {order.items?.map((item) => (
                        <li key={item.itemId} className="py-space-sm flex items-center justify-between gap-space-md">
                            <div className="min-w-0">
                                <div className="font-body-md text-body-md text-on-surface truncate">{item.productName}</div>
                                <div className="font-caption text-caption text-secondary">
                                    {item.optionName && `옵션: ${item.optionName} · `}수량: {item.quantity}
                                </div>
                            </div>
                            {itemAmount(item) !== null && (
                                <span className="font-label-md text-label-md text-on-surface shrink-0">{formatPrice(itemAmount(item) ?? 0)}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {order.deliveryAddress && (
                <p className="font-body-sm text-body-sm text-secondary">
                    배송지: {order.deliveryAddress.receiverName} · {order.deliveryAddress.address} {order.deliveryAddress.addressDetail}
                </p>
            )}
            <div className="flex flex-col sm:flex-row gap-space-sm">
                {/* 주문 내역 화면은 MY-1에서 연결한다 */}
                <button
                    className="flex-1 h-11 border border-outline-variant font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled
                    title="주문 내역은 준비 중입니다"
                >
                    주문 내역 보기 (준비 중)
                </button>
                <Link className="flex-1 h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90" href={ROUTES.home}>
                    쇼핑 계속하기
                </Link>
            </div>
        </Card>
    );
}

// BE 스펙에서 이름이 같은 ItemResponse 스키마가 하나로 합쳐져, 생성된 타입에는 개인 주문 항목의 금액 필드(unitPrice·amount)가 없다.
// 주문 항목 금액. 값이 없으면 null(금액 숨김).
function itemAmount(item: OrderDetailItemResponse): number | null {
    if (item.amount !== undefined) return item.amount;
    return item.unitPrice !== undefined && item.quantity !== undefined ? item.unitPrice * item.quantity : null;
}

function OrderCanceled({ order }: { order: OrderDetailResponse }) {
    return (
        <Card>
            <Heading icon="cancel" title="취소된 주문입니다" muted />
            <OrderSummary order={order}>
                <dt className="text-secondary">취소 일시</dt>
                <dd className="text-on-surface">{formatDateTime(order.canceledAt)}</dd>
            </OrderSummary>
            {order.cancelReason && (
                <p className="font-body-sm text-body-sm text-secondary">{CANCEL_REASON_LABEL[order.cancelReason] ?? '취소된 주문입니다.'}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-space-sm">
                <Link className="flex-1 h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90" href={ROUTES.cart}>
                    장바구니로 가기
                </Link>
                <ContinueShopping />
            </div>
        </Card>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return <div className="max-w-[640px] mx-auto bg-surface-container-lowest border border-primary p-space-xl flex flex-col gap-space-md">{children}</div>;
}

function Heading({ icon, title, muted = false }: { icon: string; title: string; muted?: boolean }) {
    return (
        <div className="flex items-center gap-space-sm">
            <Icon name={icon} className={`text-[28px] ${muted ? 'text-outline' : 'text-primary'}`} />
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">{title}</h2>
        </div>
    );
}

function OrderSummary({ order, children }: { order: OrderDetailResponse; children: React.ReactNode }) {
    return (
        <dl className="grid grid-cols-[120px_1fr] gap-y-space-xs font-body-md text-body-md">
            <dt className="text-secondary">주문 번호</dt>
            <dd className="text-on-surface font-semibold">{order.orderNumber}</dd>
            <dt className="text-secondary">주문 금액</dt>
            <dd className="text-on-surface font-semibold">{formatPrice(order.totalAmount ?? 0)}</dd>
            {children}
        </dl>
    );
}

function ContinueShopping() {
    return (
        <Link className="flex-1 h-11 border border-outline-variant font-label-md text-label-md flex items-center justify-center hover:bg-surface-container" href={ROUTES.home}>
            쇼핑 계속하기
        </Link>
    );
}
