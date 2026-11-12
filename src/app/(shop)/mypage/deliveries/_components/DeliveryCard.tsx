'use client';

import { useState } from 'react';
import { Badge, Button, Card, Heading, type BadgeVariant } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMyClaims } from '@/api/generated/claim-controller/claim-controller';
import {
    getGetDeliveryDetailsQueryKey,
    getGetDeliveriesByOrderQueryKey,
    getGetMyDeliveriesQueryKey,
    useConfirmDelivery,
    useGetDeliveryDetails,
} from '@/api/generated/delivery-controller/delivery-controller';
import type { DeliveryDetailResponse, RsDataDeliveryDetailResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, toKstLocal } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { errorStatus, hasCode } from '../../orders/_lib/orderView';
import { activeClaimOf, AUTO_CONFIRM_DAYS, CLAIM_TYPE_LABEL, deliveryStatus, MY_CLAIMS_PARAMS, TRACK_STEPS, trackIndex } from '../_lib/deliveryView';

const TONE_VARIANT: Record<'pending' | 'done' | 'muted', BadgeVariant> = { pending: 'warning', done: 'success', muted: 'neutral' };

type Props = {
    deliveryId: number;
    // 판매자가 여러 명인 주문은 배송이 판매자별로 나뉜다. 몇 번째 배송인지 머리에 보여 준다.
    title?: string;
    showItems?: boolean;
    showReceiver?: boolean;
};

// 배송 한 건: 단계 트래커 · 택배사/송장 · 구매 확정 · 교환/환불 신청 링크.
// 주문 상세(판매자별 여러 건)와 배송 상세 화면이 함께 쓴다.
export default function DeliveryCard({ deliveryId, title, showItems = false, showReceiver = false }: Props) {
    const query = useGetDeliveryDetails(deliveryId, { query: { retry: (count, error) => errorStatus(error) === undefined && count < 2 } });
    const delivery = query.data?.data;

    if (query.isPending) return <div className="h-56 rounded bg-surface-container animate-pulse" aria-hidden />;
    if (!delivery) {
        const status = errorStatus(query.error);
        const message =
            status === 404 ? '배송 정보를 찾을 수 없습니다.' : status === 403 ? '본인이 받는 배송만 볼 수 있습니다.' : errorMessage(query.error, '배송 정보를 불러오지 못했습니다.');
        return (
            <Card padding={3} className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm" role="alert">
                <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                    <Icon name="error" className="text-[20px] text-outline" />
                    {message}
                </div>
                {status !== 404 && status !== 403 && (
                    <Button label="다시 시도" variant="secondary" onClick={() => void query.refetch()} />
                )}
            </Card>
        );
    }

    return <DeliveryCardBody delivery={delivery} deliveryId={deliveryId} title={title} showItems={showItems} showReceiver={showReceiver} />;
}

function DeliveryCardBody({ delivery, deliveryId, title, showItems, showReceiver }: Props & { delivery: DeliveryDetailResponse }) {
    const status = deliveryStatus(delivery.status);
    const canceled = delivery.status === 'CANCELED';
    const items = delivery.items ?? [];

    return (
        <Card padding={4} className="flex flex-col gap-space-md" aria-label={`배송 ${title ?? `#${deliveryId}`}`} data-delivery-id={deliveryId}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-xs border-b border-surface-container">
                <div className="flex flex-wrap items-center gap-space-sm">
                    <Icon name="local_shipping" className="text-[20px] text-primary" />
                    <Heading level={2}>{title ?? `배송 #${deliveryId}`}</Heading>
                    <span data-delivery-status={delivery.status}><Badge label={status.label} variant={TONE_VARIANT[status.tone]} /></span>
                </div>
                <span className="font-caption text-caption text-outline">배송 요청 {formatDateTime(delivery.createdAt)}</span>
            </div>

            {canceled ? (
                <div className="flex items-start gap-space-sm font-body-sm text-body-sm" role="status">
                    <Icon name="cancel" className="text-[22px] text-outline mt-0.5" />
                    <div>
                        <div className="font-bold text-on-surface">배송이 취소되었습니다</div>
                        <p className="text-on-surface-variant mt-0.5">{formatDateTime(delivery.canceledAt)}</p>
                    </div>
                </div>
            ) : (
                <DeliveryTracker delivery={delivery} />
            )}

            <TrackingInfo delivery={delivery} />

            {showReceiver && (
                <dl className="grid grid-cols-[88px_1fr] gap-y-space-xs font-body-sm text-body-sm">
                    <dt className="text-outline">받는 분</dt>
                    <dd className="text-on-surface font-bold">{delivery.receiverName}</dd>
                    <dt className="text-outline">연락처</dt>
                    <dd className="text-on-surface">{delivery.receiverPhone}</dd>
                    <dt className="text-outline">주소</dt>
                    <dd className="text-on-surface">
                        {delivery.zipCode && `[${delivery.zipCode}] `}
                        {delivery.address} {delivery.addressDetail}
                    </dd>
                </dl>
            )}

            {showItems && (
                <div>
                    <div className="font-label-sm text-label-sm text-outline mb-space-xs">배송 상품 {items.length}건</div>
                    {items.length === 0 ? (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">상품 정보가 없습니다.</p>
                    ) : (
                        <ul className="flex flex-col divide-y divide-surface-container">
                            {items.map((item) => (
                                <li key={item.deliveryItemId} className="py-space-xs flex items-center justify-between gap-space-md font-body-sm text-body-sm">
                                    <div className="min-w-0">
                                        <div className="text-on-surface font-bold truncate">{item.productName}</div>
                                        {(item.options ?? []).length > 0 && (
                                            <div className="font-caption text-caption text-on-surface-variant">
                                                {(item.options ?? []).map((option) => `${option.optionName}: ${option.optionValue}`).join(' · ')}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-on-surface-variant shrink-0">{item.quantity}개</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {!canceled && <DeliveryActions delivery={delivery} deliveryId={deliveryId} />}
        </Card>
    );
}

type StepState = 'done' | 'current' | 'todo';

const STEP_CIRCLE: Record<StepState, string> = {
    done: 'bg-primary text-on-primary',
    current: 'bg-surface-container-lowest border-2 border-primary text-primary ring-4 ring-primary/15',
    todo: 'bg-surface-container border border-outline-variant text-outline',
};

// 배송 요청 → 배송 준비 → 배송 중 → 배송 완료 → 구매 확정. 지나온 단계는 채우고 지금 단계는 테두리로 강조한다.
function DeliveryTracker({ delivery }: { delivery: DeliveryDetailResponse }) {
    const current = trackIndex(delivery.status);
    return (
        <ol className="grid grid-cols-5" aria-label="배송 진행 단계">
            {TRACK_STEPS.map((step, index) => {
                // 마지막 단계(구매 확정)에 도달했으면 그 단계도 완료로 칠한다.
                const state: StepState = index < current || (index === current && index === TRACK_STEPS.length - 1) ? 'done' : index === current ? 'current' : 'todo';
                const at = step.at ? (delivery[step.at] as string | undefined) : undefined;
                return (
                    <li key={step.status} className="relative flex flex-col items-center text-center px-0.5" aria-current={index === current ? 'step' : undefined}>
                        {index > 0 && (
                            <span
                                className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 -z-0 ${index <= current ? 'bg-primary' : 'bg-outline-variant'}`}
                                aria-hidden
                            />
                        )}
                        <span className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center mb-space-xs ${STEP_CIRCLE[state]}`}>
                            <Icon name={state === 'done' ? 'check' : step.icon} className="text-[20px]" />
                        </span>
                        <span className={`font-label-sm text-label-sm ${state === 'todo' ? 'text-outline' : 'text-on-surface font-bold'}`}>{step.label}</span>
                        <span className="font-caption text-caption text-outline mt-0.5 min-h-[1.25em] break-keep">
                            {index <= current && at ? formatDateTime(at) : index === current ? '진행 중' : ''}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

// 택배사 · 송장번호. 판매자가 배송 준비 처리할 때 등록한다(그 전에는 비어 있음).
function TrackingInfo({ delivery }: { delivery: DeliveryDetailResponse }) {
    const [copied, setCopied] = useState(false);
    const tracking = delivery.trackingNumber;

    const onCopy = async () => {
        if (!tracking) return;
        try {
            await navigator.clipboard.writeText(tracking);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // 권한이 없으면 복사만 건너뛴다. 번호는 화면에 그대로 보인다.
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm p-space-sm rounded bg-surface-container font-body-sm text-body-sm">
            <div className="flex items-center gap-space-sm">
                <span className="text-outline w-16 shrink-0">택배사</span>
                <span className="text-on-surface font-bold" data-testid="delivery-carrier">
                    {delivery.carrier || '-'}
                </span>
            </div>
            <div className="flex items-center gap-space-sm">
                <span className="text-outline w-16 shrink-0">송장번호</span>
                {tracking ? (
                    <>
                        <span className="text-on-surface font-bold tabular-nums" data-testid="delivery-tracking-number">
                            {tracking}
                        </span>
                        <button
                            className="inline-flex items-center gap-0.5 font-caption text-caption text-primary hover:underline"
                            type="button"
                            onClick={() => void onCopy()}
                            aria-label="송장번호 복사"
                        >
                            <Icon name={copied ? 'check' : 'content_copy'} className="text-[14px]" />
                            {copied ? '복사됨' : '복사'}
                        </button>
                    </>
                ) : (
                    <span className="text-on-surface-variant">판매자가 송장을 등록하면 표시됩니다</span>
                )}
            </div>
        </div>
    );
}

// 상태별 안내 + 구매 확정(배송 완료일 때) + 교환 · 환불 신청 링크(배송 완료 · 구매 확정 전일 때, BE 클레임 접수 조건과 같음).
function DeliveryActions({ delivery, deliveryId }: { delivery: DeliveryDetailResponse; deliveryId: number }) {
    const queryClient = useQueryClient();
    const [asking, setAsking] = useState(false);
    const delivered = delivery.status === 'DELIVERED';
    const status = deliveryStatus(delivery.status);
    // 처리 중인 교환 · 환불이 있으면 BE가 구매 확정을 막으므로 미리 알려 준다. 배송 완료일 때만 조회한다.
    const claims = useGetMyClaims(MY_CLAIMS_PARAMS, { query: { enabled: delivered } });
    const activeClaim = activeClaimOf(claims.data?.data?.content, deliveryId);

    // 결과 처리(캐시 반영 · 무효화)는 훅 옵션에 둔다. 재조회로 카드가 다시 그려져도 콜백이 빠지지 않게.
    const confirm = useConfirmDelivery({
        mutation: {
            onSuccess: () => {
                setAsking(false);
                queryClient.setQueryData<RsDataDeliveryDetailResponse>(getGetDeliveryDetailsQueryKey(deliveryId), (prev) =>
                    prev?.data ? { ...prev, data: { ...prev.data, status: 'CONFIRMED', confirmedAt: prev.data.confirmedAt ?? toKstLocal(new Date()) } } : prev,
                );
            },
            onSettled: () => {
                void queryClient.invalidateQueries({ queryKey: getGetDeliveryDetailsQueryKey(deliveryId) });
                void queryClient.invalidateQueries({ queryKey: getGetMyDeliveriesQueryKey() });
                void queryClient.invalidateQueries({ queryKey: getGetDeliveriesByOrderQueryKey() });
            },
        },
    });

    const confirmError = confirm.isError
        ? hasCode(confirm.error, 'DELIVERY_CLAIM_IN_PROGRESS')
            ? '처리 중인 교환 · 환불 요청이 있어 구매 확정할 수 없습니다. 처리가 끝난 뒤 다시 시도해 주세요.'
            : hasCode(confirm.error, 'DELIVERY_INVALID_STATUS')
              ? '배송 상태가 바뀌어 구매 확정할 수 없습니다. 최신 상태로 다시 불러옵니다.'
              : errorStatus(confirm.error) === 403
                ? '본인이 받는 배송만 구매 확정할 수 있습니다.'
                : errorStatus(confirm.error) === 404
                  ? '배송 정보를 찾을 수 없습니다.'
                  : errorMessage(confirm.error, '구매 확정하지 못했습니다. 잠시 후 다시 시도해 주세요.')
        : null;

    const note =
        delivery.status === 'DELIVERED'
            ? `배송 완료 후 ${AUTO_CONFIRM_DAYS}일이 지나면 자동으로 구매 확정됩니다. 구매 확정 후에는 교환 · 환불을 신청할 수 없습니다.`
            : delivery.status === 'SHIPPING' || delivery.status === 'PREPARING' || delivery.status === 'REQUESTED'
              ? '배송이 완료되면 구매 확정과 교환 · 환불 신청을 할 수 있습니다.'
              : delivery.status === 'CONFIRMED'
                ? `구매 확정 ${formatDateTime(delivery.confirmedAt)}`
                : '';

    // 교환 · 환불 신청 화면은 주문 기준 주소다. 공동물품 공구 배송은 주문 상세가 따로 없어 연결하지 않는다.
    const claimHref =
        delivery.purchaseType === 'INDIVIDUAL_GROUP' && delivery.orderId !== undefined ? `${ROUTES.orderClaim(delivery.orderId)}?delivery=${deliveryId}` : undefined;

    return (
        <div className="flex flex-col gap-space-sm">
            <div className="flex items-start gap-space-sm font-body-sm text-body-sm">
                <Icon name={delivery.status === 'CONFIRMED' ? 'verified' : 'info'} className="text-[20px] text-primary mt-0.5" />
                <div>
                    <div className="font-bold text-on-surface" role="status">
                        {status.message}
                    </div>
                    {note && <p className="text-on-surface-variant mt-0.5">{note}</p>}
                </div>
            </div>

            {delivered && activeClaim && (
                <p className="font-body-sm text-body-sm text-on-surface-variant p-space-sm rounded border border-outline-variant bg-surface" role="status">
                    {CLAIM_TYPE_LABEL[activeClaim.claimType ?? ''] ?? '교환 · 환불'} 요청이 {activeClaim.status === 'APPROVED' ? '승인되어 진행 중' : '접수되어 판매자 확인 중'}입니다. 처리가 끝나면
                    구매 확정할 수 있습니다.
                </p>
            )}

            {confirmError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {confirmError}
                </p>
            )}

            {delivered && asking ? (
                <div className="flex flex-col gap-space-sm p-space-sm rounded border border-primary bg-surface" role="group" aria-label="구매 확정 확인">
                    <p className="font-body-sm text-body-sm text-on-surface">
                        상품을 잘 받으셨나요? 구매를 확정하면 <strong>교환 · 환불을 신청할 수 없습니다.</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-space-sm">
                        <Button label="구매 확정하기" variant="primary" className="flex-1" icon={<Icon name="verified" className="text-[18px]" />} isLoading={confirm.isPending} isDisabled={confirm.isPending} onClick={() => confirm.mutate({ deliveryId })} />
                        <Button label="돌아가기" variant="secondary" className="flex-1" isDisabled={confirm.isPending} onClick={() => setAsking(false)} />
                    </div>
                </div>
            ) : (
                delivered && (
                    <div className="flex flex-col sm:flex-row gap-space-sm">
                        <Button
                            label="구매 확정"
                            variant="primary"
                            className="flex-1"
                            icon={<Icon name="verified" className="text-[18px]" />}
                            // 진행 중 클레임 확인이 끝나기 전에는 누르지 못하게 한다(확정 후 409 방지)
                            isDisabled={!!activeClaim || claims.isPending}
                            onClick={() => {
                                confirm.reset();
                                setAsking(true);
                            }}
                        />
                        {activeClaim ? (
                            <div className="flex-1" title="이미 처리 중인 교환 · 환불 요청이 있습니다">
                                <Button label="교환 · 환불 진행 중" variant="secondary" className="w-full" isDisabled />
                            </div>
                        ) : claimHref ? (
                            <Button label="교환 · 환불 신청" variant="secondary" className="flex-1" href={claimHref} icon={<Icon name="assignment_return" className="text-[18px]" />} />
                        ) : (
                            <div className="flex-1" title="공동물품 공구 배송의 교환 · 환불 신청은 준비 중입니다">
                                <Button label="교환 · 환불 신청 (준비 중)" variant="secondary" className="w-full" isDisabled />
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
