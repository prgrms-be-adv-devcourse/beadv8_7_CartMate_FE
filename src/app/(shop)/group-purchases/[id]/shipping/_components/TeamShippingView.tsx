'use client';

import { useParams, useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { useIsMutating } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useProfile } from '@/api/generated/member-controller/member-controller';
import { getPaySharedGroupOrderMutationKey } from '@/api/generated/payment-controller/payment-controller';
import type { SharedGroupOrderDetailResponse } from '@/api/generated/model';
import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import DeliveryAddressFields, {
    deliveryAddressDefaults,
    deliveryAddressSchema,
    toDeliveryAddressRequest,
    type DeliveryAddressInput,
} from '../../../../checkout/_components/DeliveryAddressFields';
import WalletPaymentSummary, { payErrorMessage } from '../../../../checkout/_components/WalletPaymentSummary';
import Notice from '../../../_components/Notice';
import { DetailSkeleton } from '../../../_components/SharedStatusParts';
import { useNow } from '../../../individual/_lib/useNow';
import { canPayNow, paymentRemainingMs, useSharedOrderOfPurchase, useSharedOrderPay } from '../../../_lib/sharedGroupOrder';
import { hasErrorCode } from '../../../_lib/sharedGroupPurchase';

type Order = SharedGroupOrderDetailResponse;
type AddressOutput = z.output<typeof deliveryAddressSchema>;

// 팀 배송지 입력 (/group-purchases/{id}/shipping). 만든 사람만 쓴다.
// BE는 팀 배송지를 따로 저장하는 API 없이 만든 사람의 분담금 결제 요청에서만 받으므로, 배송지 입력과 만든 사람 몫 결제를 한 번에 한다.
export default function TeamShippingView() {
    const { id } = useParams<{ id: string }>();
    const purchaseId = Number(id);
    const validId = Number.isInteger(purchaseId) && purchaseId > 0;
    const { list, summary, orderId, detail } = useSharedOrderOfPurchase(purchaseId, validId);
    const profile = useProfile();
    const order = detail.data?.data;
    const justPaid = useIsMutating({ mutationKey: getPaySharedGroupOrderMutationKey() }) > 0;
    const resultLink = { href: ROUTES.groupPurchaseResult(purchaseId), linkLabel: '공동 주문 화면으로' };

    if (!validId) return <Notice message="존재하지 않는 공동구매입니다." />;
    if (list.isPending) return <DetailSkeleton />;
    if (list.isError) return <Notice message={errorMessage(list.error, '공동 주문 정보를 불러오지 못했습니다.')} onRetry={() => void list.refetch()} />;
    if (!summary || orderId === undefined) {
        return <Notice message="아직 공동 주문이 없습니다. 공동구매를 마감한 뒤에 팀 배송지를 입력할 수 있습니다." href={ROUTES.groupPurchase(purchaseId)} linkLabel="공동구매로 돌아가기" />;
    }
    if (detail.isPending || profile.isPending) return <DetailSkeleton />;
    if (!order) {
        const status = detail.error instanceof ApiError ? detail.error.status : undefined;
        if (status === 403) return <Notice message="공동 주문 참여자만 볼 수 있습니다." />;
        return <Notice message={errorMessage(detail.error, '공동 주문 정보를 불러오지 못했습니다.')} onRetry={() => void detail.refetch()} />;
    }
    if (!order.creator) return <Notice message="팀 배송지는 공동구매를 만든 사람이 입력합니다. 공동 주문 화면에서 내 몫만 결제하면 됩니다." {...resultLink} />;
    // 방금 이 화면에서 결제했으면 결과 화면으로 옮겨 가는 중이므로 폼을 그대로 둔다(아래 ShippingForm이 이동).
    if (order.myPaymentStatus === 'PAID' && !justPaid) return <Notice message="이미 팀 배송지를 입력하고 결제했습니다." {...resultLink} />;
    if (order.status !== 'PAYING') return <Notice message="결제가 끝났거나 취소된 공동 주문이라 배송지를 입력할 수 없습니다." {...resultLink} />;

    return <ShippingForm purchaseId={purchaseId} orderId={orderId} order={order} receivedAt={detail.dataUpdatedAt} defaults={deliveryAddressDefaults(profile.data?.data)} />;
}

type FormProps = { purchaseId: number; orderId: number; order: Order; receivedAt: number; defaults: DeliveryAddressInput };

function ShippingForm({ purchaseId, orderId, order, receivedAt, defaults }: FormProps) {
    const router = useRouter();
    const now = useNow().getTime();
    const wallet = useGetMyWallet({ query: { staleTime: 0 } });
    const pay = useSharedOrderPay(orderId);
    const form = useForm<DeliveryAddressInput, unknown, AddressOutput>({ resolver: zodResolver(deliveryAddressSchema), defaultValues: defaults });

    const amount = order.myShareAmount ?? 0;
    const balance = wallet.data?.data?.balance;
    const payable = canPayNow(order, paymentRemainingMs(order, receivedAt, now));
    const busy = pay.isPending || pay.isSuccess;
    const canPay = payable && balance !== undefined && balance >= amount && !busy;

    const onSubmit = (values: AddressOutput) => {
        // 검증이 비동기라 버튼이 비활성되기 전에 두 번 제출될 수 있어 한 번 더 막는다.
        if (!canPay) return;
        pay.mutate(
            { sharedGroupOrderId: orderId, data: { teamDeliveryAddress: toDeliveryAddressRequest(values) } },
            { onSuccess: () => router.replace(ROUTES.groupPurchaseResult(purchaseId)) },
        );
    };

    return (
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-primary">
                    <Icon name="local_shipping" className="text-[22px]" />
                    <h1 className="font-headline-sm text-headline-sm">팀 배송지</h1>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">
                    주문이 확정되면 팀 전체 상품이 이 주소로 한 번에 배송됩니다. 결제와 함께 저장되며, 저장한 뒤에는 바꿀 수 없습니다.
                </p>
                <FormProvider {...form}>
                    <DeliveryAddressFields />
                </FormProvider>
            </section>

            <aside className="lg:col-span-4 bg-surface-container-high rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md" aria-label="만든 사람 몫 결제">
                <div className="flex items-center gap-space-xs text-primary">
                    <Icon name="account_balance_wallet" className="text-[20px]" />
                    <h2 className="font-headline-sm text-headline-sm">내 몫 결제</h2>
                </div>
                <p className="font-caption text-caption text-secondary">
                    총액 {formatPrice(order.totalAmount ?? 0)} 중 내 몫(나누어떨어지지 않는 금액 포함)입니다. 결제 기한 {formatDateTime(order.paymentDeadlineAt)}
                </p>
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
                        {hasErrorCode(pay.error, 'ORDER_INVALID_DELIVERY_ADDRESS') || hasErrorCode(pay.error, 'ORDER_TEAM_ADDRESS_REQUIRED')
                            ? '받는 분, 연락처, 우편번호, 주소를 모두 입력해주세요.'
                            : payErrorMessage(pay.error)}
                    </p>
                )}
                <button
                    className="h-12 rounded bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={!canPay}
                >
                    {pay.isSuccess ? '결제 완료' : busy ? '결제 중...' : `배송지 저장하고 ${formatPrice(amount)} 결제하기`}
                </button>
            </aside>
        </form>
    );
}
