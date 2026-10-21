'use client';

import { useState, type FormEvent } from 'react';
import { useReadyDelivery, useShipDelivery } from '@/api/generated/delivery-controller/delivery-controller';
import type { SellerDeliveryResponse } from '@/api/generated/model';
import { CARRIERS, TRACKING_NUMBER_MAX, deliveryErrorMessage } from './delivery';

export type ActionResult = { ok: boolean; message: string; stale?: boolean };

type Props = {
    delivery: SellerDeliveryResponse;
    onResult: (result: ActionResult) => void;
};

// 목록 한 행의 처리 영역. 배송요청이면 송장 등록(배송 준비), 배송준비면 발송 처리, 그 밖에는 송장 정보만 보여 준다.
export default function DeliveryActions({ delivery, onResult }: Props) {
    if (delivery.status === 'REQUESTED') return <ReadyForm delivery={delivery} onResult={onResult} />;
    if (delivery.status === 'PREPARING') return <ShipButton delivery={delivery} onResult={onResult} />;
    return <TrackingInfo delivery={delivery} />;
}

function TrackingInfo({ delivery }: { delivery: SellerDeliveryResponse }) {
    if (!delivery.carrier && !delivery.trackingNumber) {
        return <span className="text-caption text-on-surface-variant">송장 정보 없음</span>;
    }
    return (
        <div>
            <div className="font-label-md">{delivery.carrier}</div>
            <div className="text-caption text-on-surface-variant tabular-nums">{delivery.trackingNumber}</div>
        </div>
    );
}

function ReadyForm({ delivery, onResult }: Props) {
    const deliveryId = delivery.deliveryId!;
    const [carrier, setCarrier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [touched, setTouched] = useState(false);
    // 결과 콜백은 훅 옵션에 둔다. mutate()에 넘긴 콜백은 응답 전에 행이 목록에서 빠지면(재조회로 언마운트) 호출되지 않는다.
    const ready = useReadyDelivery({
        mutation: {
            onSuccess: (_data, { deliveryId: id }) => onResult({ ok: true, message: `배송 #${id}의 송장을 등록하고 배송 준비로 옮겼습니다.` }),
            onError: (error) => onResult({ ok: false, ...deliveryErrorMessage(error) }),
        },
    });

    const trimmed = trackingNumber.trim();
    const invalid = !carrier ? '택배사를 선택해 주세요.' : !trimmed ? '송장번호를 입력해 주세요.' : null;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (invalid || ready.isPending) return;
        ready.mutate({ deliveryId, data: { carrier, trackingNumber: trimmed } });
    };

    const errorId = `ready-error-${deliveryId}`;
    const showError = touched && invalid;
    return (
        <form onSubmit={submit} className="flex flex-col gap-2 min-w-[240px]" noValidate>
            <div className="flex gap-2">
                <select
                    aria-label="택배사"
                    aria-invalid={showError && !carrier ? true : undefined}
                    aria-describedby={showError ? errorId : undefined}
                    className="w-28 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    disabled={ready.isPending}
                >
                    <option value="">택배사 선택</option>
                    {CARRIERS.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <input
                    aria-label="송장번호"
                    aria-invalid={showError && !!carrier ? true : undefined}
                    aria-describedby={showError ? errorId : undefined}
                    className="flex-1 min-w-0 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface tabular-nums"
                    placeholder="송장번호 입력"
                    type="text"
                    inputMode="numeric"
                    maxLength={TRACKING_NUMBER_MAX}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    disabled={ready.isPending}
                />
            </div>
            <div className="flex items-center justify-end gap-2">
                <span id={errorId} role="alert" className="text-caption text-error">
                    {showError ? invalid : ''}
                </span>
                <button
                    type="submit"
                    disabled={ready.isPending}
                    className="bg-primary text-on-primary hover:opacity-90 px-3 py-1 rounded text-caption font-label-md disabled:opacity-50"
                >
                    {ready.isPending ? '처리 중...' : '송장 등록 · 배송 준비'}
                </button>
            </div>
        </form>
    );
}

function ShipButton({ delivery, onResult }: Props) {
    const deliveryId = delivery.deliveryId!;
    const [confirming, setConfirming] = useState(false);
    const ship = useShipDelivery({
        mutation: {
            onSuccess: (_data, { deliveryId: id }) => onResult({ ok: true, message: `배송 #${id}을(를) 발송 처리했습니다. 배송 중 탭에서 확인할 수 있습니다.` }),
            onError: (error) => onResult({ ok: false, ...deliveryErrorMessage(error) }),
            onSettled: () => setConfirming(false),
        },
    });

    const submit = () => ship.mutate({ deliveryId });

    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <TrackingInfo delivery={delivery} />
            <div className="flex items-center justify-end gap-1">
                {confirming ? (
                    <>
                        <span className="text-caption text-on-surface-variant mr-1">발송할까요?</span>
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={ship.isPending}
                            className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-3 py-1 rounded text-caption font-label-md disabled:opacity-50"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={ship.isPending}
                            className="bg-primary text-on-primary hover:opacity-90 px-3 py-1 rounded text-caption font-label-md disabled:opacity-50"
                        >
                            {ship.isPending ? '처리 중...' : '발송 확인'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="bg-primary text-on-primary hover:opacity-90 px-3 py-1 rounded text-caption font-label-md"
                    >
                        발송 처리
                    </button>
                )}
            </div>
        </div>
    );
}
