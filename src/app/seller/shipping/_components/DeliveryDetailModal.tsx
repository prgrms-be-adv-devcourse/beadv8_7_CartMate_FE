'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Icon from '@/components/ui/Icon';
import { useGetDeliveryDetails } from '@/api/generated/delivery-controller/delivery-controller';
import { formatDateTime } from '@/lib/format';
import { PURCHASE_TYPE_LABEL, STATUS_BADGE, STATUS_LABEL, fullAddress, loadErrorMessage, itemsOf, optionText } from './delivery';

type Props = {
    deliveryId: number;
    onClose: () => void;
};

export default function DeliveryDetailModal({ deliveryId, onClose }: Props) {
    const { data, isPending, isError, error, refetch, isFetching } = useGetDeliveryDetails(deliveryId, { query: { staleTime: 0 } });
    const detail = data?.data;

    // 열릴 때 닫기 버튼으로 포커스를 옮기고, 닫히면 모달을 연 요소로 돌려준다.
    const closeRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        closeRef.current?.focus();
        return () => opener?.focus();
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-space-md" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delivery-detail-title"
                className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-space-lg py-space-md border-b border-surface-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest">
                    <h2 id="delivery-detail-title" className="font-headline-sm text-on-surface">
                        배송 상세 <span className="text-on-surface-variant font-label-md">#{deliveryId}</span>
                    </h2>
                    <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="text-on-surface-variant hover:text-on-surface">
                        <Icon name="close" />
                    </button>
                </div>

                <div className="p-space-lg flex flex-col gap-space-lg text-body-md text-on-surface">
                    {isPending ? (
                        <p className="text-on-surface-variant text-center py-space-xl">배송 정보를 불러오는 중...</p>
                    ) : isError || !detail ? (
                        <div className="text-center py-space-xl flex flex-col items-center gap-space-sm">
                            <p className="text-error">{loadErrorMessage(error)}</p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-space-md py-1.5 rounded-lg font-label-md disabled:opacity-50"
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-space-sm">
                                {detail.status && (
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-caption font-label-md ${STATUS_BADGE[detail.status] ?? STATUS_BADGE.REQUESTED}`}>
                                        {STATUS_LABEL[detail.status] ?? detail.status}
                                    </span>
                                )}
                                <span className="text-body-sm text-on-surface-variant">
                                    주문 #{detail.orderId}
                                    {detail.purchaseType && ` · ${PURCHASE_TYPE_LABEL[detail.purchaseType] ?? detail.purchaseType}`}
                                </span>
                            </div>

                            <Section title="배송 상품">
                                <ul className="divide-y divide-surface-variant">
                                    {itemsOf(detail).map((item) => (
                                        <li key={item.deliveryItemId} className="py-space-sm flex items-start justify-between gap-space-md">
                                            <div>
                                                <div className="font-label-md">{item.productName ?? `상품 #${item.orderItemId ?? item.deliveryItemId}`}</div>
                                                {optionText(item) && <div className="text-caption text-on-surface-variant">{optionText(item)}</div>}
                                            </div>
                                            <span className="font-label-md shrink-0">{item.quantity}개</span>
                                        </li>
                                    ))}
                                </ul>
                            </Section>

                            <Section title="받는 분">
                                <Field label="수령인">{detail.receiverName}</Field>
                                <Field label="연락처">{detail.receiverPhone}</Field>
                                <Field label="배송지">{fullAddress(detail)}</Field>
                            </Section>

                            <Section title="송장">
                                <Field label="택배사">{detail.carrier ?? '-'}</Field>
                                <Field label="송장번호">{detail.trackingNumber ?? '-'}</Field>
                            </Section>

                            <Section title="처리 이력">
                                <Field label="배송 요청">{formatDateTime(detail.createdAt)}</Field>
                                <Field label="발송">{formatDateTime(detail.shippedAt)}</Field>
                                <Field label="배송 완료">{formatDateTime(detail.deliveredAt)}</Field>
                                <Field label="구매 확정">{formatDateTime(detail.confirmedAt)}</Field>
                                {detail.canceledAt && <Field label="취소">{formatDateTime(detail.canceledAt)}</Field>}
                            </Section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h3 className="font-label-md text-on-surface-variant mb-space-xs">{title}</h3>
            <div className="bg-surface-container-low rounded-lg px-space-md py-space-sm">{children}</div>
        </section>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex gap-space-md py-1 text-body-sm">
            <span className="w-20 shrink-0 text-on-surface-variant">{label}</span>
            <span className="text-on-surface break-all">{children || '-'}</span>
        </div>
    );
}
