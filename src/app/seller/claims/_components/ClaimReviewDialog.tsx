'use client';

import { useState } from 'react';
import { Banner, Button, Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, Text, TextArea } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSellerClaimsQueryKey, useDecideClaim } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import { CLAIM_REASON_LABEL, CLAIM_TYPE_LABEL } from './claimLabels';

const REJECT_REASON_MAX = 1000;
// 상품명 칸 + 승인 칸 + 거절 칸. 버튼 칸은 "전체 승인" 버튼이 들어갈 만큼 고정한다.
const DECISION_COLS = 'grid-cols-[minmax(0,1fr)_88px_88px]';

type Decision = 'APPROVED' | 'REJECTED' | '';

// 클레임 한 건의 상품마다 승인 · 거절을 고르고 한 번에 처리한다(BE ADR 0012).
// 고른 값은 화면에만 있고, "처리"를 눌러야 서버로 간다. 모든 상품을 고르고, 거절한 상품은 사유를 적어야 처리할 수 있다.
// 승인된 상품은 함께 움직인다: 환불(반품)은 클레임당 한 번, 반품 · 교환 완료도 한 번이다.
export default function ClaimReviewDialog({ claim, onClose }: { claim: SellerClaimResponse; onClose: () => void }) {
    const queryClient = useQueryClient();
    const items = (claim.items ?? []).filter((item) => item.deliveryItemId !== undefined);
    const [decisions, setDecisions] = useState<Record<number, Decision>>({});
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [showErrors, setShowErrors] = useState(false);

    const decide = useDecideClaim({
        mutation: {
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: getGetSellerClaimsQueryKey(),
                });
                onClose();
            },
        },
    });
    const busy = decide.isPending;
    const close = () => !busy && onClose();

    const decisionOf = (id: number): Decision => decisions[id] ?? '';
    const missing = items.filter((item) => !decisionOf(item.deliveryItemId!));
    const reasonMissing = items.filter((item) => decisionOf(item.deliveryItemId!) === 'REJECTED' && !(reasons[item.deliveryItemId!] ?? '').trim());
    const tooLong = items.filter((item) => (reasons[item.deliveryItemId!] ?? '').trim().length > REJECT_REASON_MAX);
    const approvedCount = items.filter((item) => decisionOf(item.deliveryItemId!) === 'APPROVED').length;
    const rejectedCount = items.filter((item) => decisionOf(item.deliveryItemId!) === 'REJECTED').length;
    const refund = claim.claimType === 'REFUND';

    function setAll(decision: Decision) {
        setDecisions(Object.fromEntries(items.map((item) => [item.deliveryItemId!, decision])));
    }

    function submit() {
        if (missing.length > 0 || reasonMissing.length > 0 || tooLong.length > 0) {
            setShowErrors(true);
            return;
        }
        decide.mutate({
            claimId: claim.claimId!,
            data: {
                items: items.map((item) => {
                    const result = decisionOf(item.deliveryItemId!) as 'APPROVED' | 'REJECTED';
                    return {
                        deliveryItemId: item.deliveryItemId!,
                        result,
                        rejectReason: result === 'REJECTED' ? reasons[item.deliveryItemId!].trim() : undefined,
                    };
                }),
            },
        });
    }

    return (
        <Dialog isOpen onOpenChange={(open) => !open && close()} purpose="form" width={560}>
            {/* 상품이 많거나 거절 사유 칸이 여럿 열리면 창보다 길어진다. 가운데만 스크롤하고 닫기 · 처리는 아래에 고정한다. */}
            <Layout
                header={
                    <DialogHeader
                        title={`${CLAIM_TYPE_LABEL[claim.claimType ?? ''] ?? '교환 · 환불'} 요청 검토`}
                        subtitle={`주문 ${claim.orderNumber ?? `#${claim.orderId ?? '-'}`} · 상품 ${items.length}개`}
                        onOpenChange={(open) => !open && close()}
                    />
                }
                footer={
                    <LayoutFooter hasDivider>
                        <div className="flex flex-col gap-space-sm w-full">
                            {decide.isError && (
                                <Banner
                                    status="error"
                                    collapsible={false}
                                    title="처리하지 못했습니다"
                                    description={errorMessage(decide.error, '잠시 후 다시 시도해 주세요.')}
                                />
                            )}
                            <div className="flex justify-end gap-space-sm">
                                <Button label="닫기" isDisabled={busy} onClick={close} />
                                <Button label="처리" variant="primary" isLoading={busy} onClick={submit} />
                            </div>
                        </div>
                    </LayoutFooter>
                }
                content={
                    <LayoutContent>
                        <div className="flex flex-col gap-space-md">
                            <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-1">
                                <Text type="supporting">구매자 사유</Text>
                                <Text>{CLAIM_REASON_LABEL[claim.reason ?? ''] ?? claim.reason}</Text>
                                {claim.detail && (
                                    <Text type="supporting" wordBreak="break-word">
                                        “{claim.detail}”
                                    </Text>
                                )}
                            </div>

                            {/* 머리줄과 상품 줄이 같은 칸 너비(DECISION_COLS)를 써서 "전체 승인" 아래에 승인, "전체 거절" 아래에 거절이 온다. */}
                            <div className={`grid ${DECISION_COLS} items-center gap-x-space-sm`}>
                                <Text type="supporting">상품마다 승인 또는 거절을 고르세요</Text>
                                <div className="flex justify-center">
                                    <Button label="전체 승인" size="sm" variant="ghost" isDisabled={busy} onClick={() => setAll('APPROVED')} />
                                </div>
                                <div className="flex justify-center">
                                    <Button label="전체 거절" size="sm" variant="ghost" isDisabled={busy} onClick={() => setAll('REJECTED')} />
                                </div>
                            </div>

                            <ul className="flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
                                {items.map((item) => {
                                    const id = item.deliveryItemId!;
                                    const decision = decisionOf(id);
                                    const reasonError = showErrors && decision === 'REJECTED' && !(reasons[id] ?? '').trim();
                                    return (
                                        <li key={id} className="py-space-md flex flex-col gap-space-sm" data-claim-item-id={id}>
                                            <div
                                                role="group"
                                                aria-label={`${item.productName ?? '상품'} 처리`}
                                                className={`grid ${DECISION_COLS} items-center gap-x-space-sm`}
                                            >
                                                <div className="min-w-0 flex flex-col">
                                                    <Text weight="bold" maxLines={1}>
                                                        {item.productName ?? `상품 #${item.orderItemId}`}
                                                    </Text>
                                                    <Text type="supporting">{item.quantity}개</Text>
                                                </div>
                                                {/* 승인 · 거절은 떨어진 두 버튼으로 둔다. 붙어 있으면 경계가 안 보여 어느 쪽이 눌렸는지 헷갈린다. */}
                                                <div className="flex justify-center">
                                                    <Button
                                                        label="승인"
                                                        size="sm"
                                                        variant={decision === 'APPROVED' ? 'primary' : 'secondary'}
                                                        aria-pressed={decision === 'APPROVED'}
                                                        isDisabled={busy}
                                                        onClick={() =>
                                                            setDecisions((prev) => ({
                                                                ...prev,
                                                                [id]: prev[id] === 'APPROVED' ? '' : 'APPROVED',
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <Button
                                                        label="거절"
                                                        size="sm"
                                                        variant={decision === 'REJECTED' ? 'primary' : 'secondary'}
                                                        aria-pressed={decision === 'REJECTED'}
                                                        isDisabled={busy}
                                                        onClick={() =>
                                                            setDecisions((prev) => ({
                                                                ...prev,
                                                                [id]: prev[id] === 'REJECTED' ? '' : 'REJECTED',
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            {showErrors && !decision && (
                                                <span className="text-caption text-error" role="alert">
                                                    승인 또는 거절을 골라 주세요.
                                                </span>
                                            )}
                                            {decision === 'REJECTED' && (
                                                <TextArea
                                                    label="거절 사유 (구매자에게 보여요)"
                                                    rows={2}
                                                    maxLength={REJECT_REASON_MAX}
                                                    isDisabled={busy}
                                                    placeholder="예: 택을 떼고 착용한 흔적이 있어 반품이 어렵습니다."
                                                    value={reasons[id] ?? ''}
                                                    status={
                                                        reasonError
                                                            ? {
                                                                  type: 'error',
                                                                  message: '거절 사유를 적어 주세요.',
                                                              }
                                                            : undefined
                                                    }
                                                    onChange={(value) => setReasons((prev) => ({ ...prev, [id]: value }))}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            <Text type="supporting">
                                승인 {approvedCount}개 · 거절 {rejectedCount}개{missing.length > 0 ? ` · 미정 ${missing.length}개` : ''}
                            </Text>

                            <Banner
                                status={rejectedCount === items.length && items.length > 0 ? 'info' : 'warning'}
                                collapsible={false}
                                title="처리하면 결정을 바꿀 수 없습니다"
                                description={
                                    refund
                                        ? '승인한 상품만 반품 환불됩니다. 환불 금액은 쿠폰 할인을 반영해 계산되며, 처리하면 곧 구매자에게 환불이 진행됩니다.'
                                        : '승인한 상품만 교환합니다. 상품을 회수하고 교환 상품을 보낸 뒤 교환 완료를 눌러 주세요.'
                                }
                            />
                        </div>
                    </LayoutContent>
                }
            />
        </Dialog>
    );
}
