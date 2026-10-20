'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SharedGroupPurchaseDetailItemResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import SharedDetailGate, { type SharedDetailContext } from '../../../_components/SharedDetailGate';
import SharedItemRow from '../../../_components/SharedItemRow';
import { AmountSummary, DeadlineBox, DetailSkeleton, ParticipantProgress, StateBanner } from '../../../_components/SharedStatusParts';
import { itemPermissions, MAX_QUANTITY, statusBadgeClass, statusLabel } from '../../../_lib/sharedGroupPurchase';
import { useSharedItemMutations } from '../../../_lib/useSharedItemMutations';

// 공동 장바구니: 담긴 품목의 수량을 바꾸거나 뺀다. 품목은 사람별이 아니라 공동구매 하나에 함께 담긴다.
export default function SharedCartView() {
    return <SharedDetailGate skeleton={<DetailSkeleton />}>{(ctx) => <CartContent {...ctx} />}</SharedDetailGate>;
}

function CartContent({ id, purchase, remainingMs, deadlinePassed }: SharedDetailContext) {
    const items = purchase.items ?? [];
    const permissions = itemPermissions(purchase, deadlinePassed);
    const editableNow = purchase.editable === true && !deadlinePassed;
    const { changeQuantity, remove } = useSharedItemMutations(id);
    // 어느 품목에서 난 실패인지 함께 기억해 그 품목 아래에 보여 준다.
    // 다른 참여자가 먼저 뺀 품목이면 다시 받은 목록에 행이 없으므로 목록 위에 상품명과 함께 보여 준다.
    const [failure, setFailure] = useState<{ itemId: number; name: string; message: string } | null>(null);
    const busyItemId = changeQuantity.isPending
        ? changeQuantity.variables?.itemId
        : remove.isPending
          ? remove.variables?.itemId
          : undefined;

    const onQuantity = (item: SharedGroupPurchaseDetailItemResponse, quantity: number, onFail?: () => void) => {
        if (item.itemId === undefined) return;
        const itemId = item.itemId;
        setFailure(null);
        changeQuantity.mutate(
            { id, itemId, data: { quantity } },
            {
                onError: (error) => {
                    onFail?.();
                    setFailure({ itemId, name: itemName(item), message: errorMessage(error, '수량을 바꾸지 못했습니다.') });
                },
            },
        );
    };
    const onRemove = (item: SharedGroupPurchaseDetailItemResponse) => {
        if (item.itemId === undefined) return;
        if (!window.confirm(`'${itemName(item)}'을(를) 공동 장바구니에서 뺄까요?\n다른 참여자에게도 바로 반영됩니다.`)) return;
        const itemId = item.itemId;
        setFailure(null);
        remove.mutate(
            { id, itemId },
            { onError: (error) => setFailure({ itemId, name: itemName(item), message: errorMessage(error, '상품을 빼지 못했습니다.') }) },
        );
    };

    const permissionNote = permissions.canChangeQuantity
        ? '참여자 누구나 상품을 담고 수량을 바꾸거나 뺄 수 있습니다. 바꾼 내용은 모든 참여자에게 바로 보입니다.'
        : permissions.canRemove
          ? '마감 보류 중에는 만든 사람만 상품을 뺄 수 있습니다. 구매할 수 없는 상품을 빼면 마감할 수 있습니다.'
          : '수정이 마감되어 품목을 바꿀 수 없습니다.';

    return (
        <div className="flex flex-col gap-space-lg w-full">
            {/* 제목 · 상품 담기 */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-md min-w-0">
                    <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center rounded-lg shadow-sm shrink-0">
                        <Icon name="groups_3" className="text-2xl" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-space-sm mb-0.5">
                            <span className={statusBadgeClass(purchase.status, editableNow)}>{statusLabel(purchase.status, editableNow)}</span>
                            <span className="font-caption text-caption text-secondary">#{id} · 만든 사람 {purchase.creatorNickname ?? '-'}</span>
                        </div>
                        <h1 className="font-headline-md text-headline-md text-primary tracking-tight break-all">
                            {purchase.title} <span className="text-secondary font-body-md text-body-md">공동 장바구니</span>
                        </h1>
                        <p className="font-caption text-caption text-secondary mt-1">※ {permissionNote}</p>
                    </div>
                </div>
                <div className="flex items-center gap-space-sm shrink-0">
                    <Link
                        className="flex items-center gap-1.5 px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md transition-all shadow-sm"
                        href={ROUTES.groupPurchase(id)}
                    >
                        <Icon name="dashboard" className="text-[18px]" />
                        현황판
                    </Link>
                    {permissions.canAdd && (
                        <Link
                            className="flex items-center gap-1.5 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
                            href={ROUTES.groupPurchaseOptions(id)}
                        >
                            <Icon name="add_circle" className="text-[18px]" />
                            상품 담기
                        </Link>
                    )}
                </div>
            </div>

            {!editableNow && <StateBanner purchase={purchase} deadlinePassed={deadlinePassed} />}

            <div className="grid grid-cols-12 gap-gutter items-start">
                {/* 품목 */}
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-primary font-bold">담긴 상품 {items.length}종</span>
                        {purchase.hasUnavailableItem && (
                            <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                                구매 불가 상품 있음
                            </span>
                        )}
                    </div>
                    {failure && !items.some((item) => item.itemId === failure.itemId) && (
                        <p className="p-space-sm rounded bg-error-container/40 font-body-sm text-body-sm text-error" role="alert">
                            &apos;{failure.name}&apos;: {failure.message}
                        </p>
                    )}
                    {items.length === 0 ? (
                        <div className="bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center gap-space-md text-center">
                            <Icon name="shopping_cart" className="text-[40px] text-outline" />
                            <p className="font-body-md text-body-md text-on-surface">아직 담긴 상품이 없습니다.</p>
                            {permissions.canAdd && (
                                <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center rounded" href={ROUTES.groupPurchaseOptions(id)}>
                                    첫 상품 담기
                                </Link>
                            )}
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.itemId} className="flex flex-col gap-1">
                                <SharedItemRow
                                    item={item}
                                    controls={
                                        (permissions.canChangeQuantity || permissions.canRemove) && item.itemId !== undefined ? (
                                            <ItemControls
                                                item={item}
                                                canChangeQuantity={permissions.canChangeQuantity && item.purchasable !== false}
                                                canRemove={permissions.canRemove}
                                                busy={busyItemId === item.itemId}
                                                disabled={busyItemId !== undefined}
                                                onQuantity={(quantity, onFail) => onQuantity(item, quantity, onFail)}
                                                onRemove={() => onRemove(item)}
                                            />
                                        ) : undefined
                                    }
                                />
                                {failure && failure.itemId === item.itemId && (
                                    <p className="font-caption text-caption text-error px-space-sm" role="alert">
                                        {failure.message}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* 현황 요약 */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-space-md">
                    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
                        <DeadlineBox purchase={purchase} remainingMs={remainingMs} />
                        <ParticipantProgress purchase={purchase} />
                    </div>
                    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md">
                        <h2 className="font-headline-sm text-headline-sm text-primary font-bold">결제 예정 금액 요약</h2>
                        <AmountSummary purchase={purchase} />
                    </div>
                </div>
            </div>
        </div>
    );
}

type ItemControlsProps = {
    item: SharedGroupPurchaseDetailItemResponse;
    canChangeQuantity: boolean;
    canRemove: boolean;
    busy: boolean;
    disabled: boolean;
    onQuantity: (quantity: number, onFail?: () => void) => void;
    onRemove: () => void;
};

function ItemControls({ item, canChangeQuantity, canRemove, busy, disabled, onQuantity, onRemove }: ItemControlsProps) {
    const quantity = item.quantity ?? 1;
    const name = itemName(item);
    const stepClass =
        'w-8 h-8 flex items-center justify-center bg-surface-container-lowest hover:bg-surface-variant text-on-surface disabled:opacity-40 disabled:cursor-not-allowed';
    return (
        <div className="flex sm:flex-col items-center sm:items-end gap-space-sm shrink-0">
            {canChangeQuantity && (
                <div className="flex items-center rounded-lg overflow-hidden shadow-sm" aria-busy={busy}>
                    <button className={stepClass} type="button" aria-label={`${name} 수량 줄이기`} disabled={disabled || quantity <= 1} onClick={() => onQuantity(quantity - 1)}>
                        <Icon name="remove" className="text-[16px]" />
                    </button>
                    <QuantityInput quantity={quantity} label={`${name} 수량`} disabled={disabled} onCommit={onQuantity} />
                    <button
                        className={stepClass}
                        type="button"
                        aria-label={`${name} 수량 늘리기`}
                        disabled={disabled || quantity >= MAX_QUANTITY}
                        onClick={() => onQuantity(quantity + 1)}
                    >
                        <Icon name="add" className="text-[16px]" />
                    </button>
                </div>
            )}
            <div className="flex items-center gap-1">
                {/* BE의 상품은 아직 옵션 없이 상품 하나가 곧 구매 단위(inventoryId = 상품 id)라 바꿀 옵션이 없다 */}
                <button
                    className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled
                    title="상품 옵션은 준비 중입니다."
                >
                    <Icon name="tune" className="text-[16px]" />
                    옵션 변경 (준비 중)
                </button>
                {canRemove && (
                    <button
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-error-container text-error font-label-sm text-label-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        type="button"
                        aria-label={`${name} 빼기`}
                        disabled={disabled}
                        onClick={onRemove}
                    >
                        <Icon name="delete" className="text-[16px]" />
                    </button>
                )}
            </div>
            <span className="font-caption text-caption text-secondary" aria-live="polite">
                {busy ? '반영 중...' : ''}
            </span>
        </div>
    );
}

// 직접 입력한 수량은 입력을 마칠 때(포커스 이동·Enter) 한 번만 보낸다. 범위를 벗어나면 원래 값으로 돌린다.
// 입력 중이 아닐 때만 서버 수량(다른 참여자의 변경·30초 재조회)으로 맞추고, 보내기에 실패하면 서버 수량으로 되돌린다.
type QuantityInputProps = { quantity: number; label: string; disabled: boolean; onCommit: (quantity: number, onFail: () => void) => void };

function QuantityInput({ quantity, label, disabled, onCommit }: QuantityInputProps) {
    const [value, setValue] = useState(String(quantity));
    const [editing, setEditing] = useState(false);
    // 입력칸이 마지막으로 맞춘 서버 수량. null이면 다음 렌더에서 다시 맞춘다(실패 후 되돌리기).
    const [synced, setSynced] = useState<number | null>(quantity);
    if (!editing && synced !== quantity) {
        setSynced(quantity);
        setValue(String(quantity));
    }

    const commit = () => {
        setEditing(false);
        const next = Number(value);
        if (!Number.isInteger(next) || next < 1 || next > MAX_QUANTITY) {
            setValue(String(quantity));
            return;
        }
        if (next !== quantity) onCommit(next, () => setSynced(null));
    };
    return (
        <input
            className="w-12 h-8 text-center bg-surface-container-lowest font-label-md text-label-md text-primary border-x border-surface-container focus:outline-none disabled:opacity-60"
            inputMode="numeric"
            aria-label={label}
            value={value}
            disabled={disabled}
            onFocus={() => setEditing(true)}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onBlur={commit}
            onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
            }}
        />
    );
}

function itemName(item: SharedGroupPurchaseDetailItemResponse): string {
    return item.productName ?? '삭제된 상품';
}
