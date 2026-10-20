'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SharedGroupPurchaseDetailResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import { hasErrorCode, inviteUrl, managePermissions, MAX_PARTICIPANTS } from '../_lib/sharedGroupPurchase';
import { useSharedPurchaseActions } from '../_lib/useSharedPurchaseActions';
import CopyLinkButton from './CopyLinkButton';

type Props = {
    id: number;
    purchase: SharedGroupPurchaseDetailResponse;
    deadlinePassed: boolean;
    // 참여자 표의 강퇴와 진행 상태를 공유하려고 상세 화면이 만든 것을 받는다.
    actions: ReturnType<typeof useSharedPurchaseActions>;
};

const BUTTON = 'h-11 px-space-md rounded font-label-md text-label-md flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed';
const PRIMARY = `${BUTTON} bg-primary text-on-primary hover:opacity-90`;
const SECONDARY = `${BUTTON} bg-surface-container text-on-surface hover:bg-surface-container-high`;
const DANGER = `${BUTTON} border border-error text-error hover:bg-error-container/40`;

// 상세 하단의 초대·관리 영역. 참여자: 초대 링크·나가기 / 만든 사람: 초대 링크·마감·인원 늘리기·취소·다시 만들기.
// 마감된 공동구매는 공동 주문(N빵 결제) 화면으로 안내한다.
export default function SharedManagePanel({ id, purchase, deadlinePassed, actions }: Props) {
    const router = useRouter();
    const perm = managePermissions(purchase, deadlinePassed);
    const [error, setError] = useState<string | null>(null);
    const [maxFormOpen, setMaxFormOpen] = useState(false);
    const editableNow = purchase.editable === true && !deadlinePassed;
    const isActive = purchase.status === 'OPEN' || purchase.status === 'FROZEN';
    // 강퇴·인원 변경 중에 마감하면 마감 시점의 참여자 구성이 불확실해지므로 함께 막는다.
    // 마감·나가기 성공 후 화면을 옮기는 사이 다시 누르지 못하도록 성공 상태도 막는다.
    const busy = [actions.leave, actions.close, actions.cancel, actions.duplicate, actions.kick, actions.increaseMax].some((m) => m.isPending) || actions.close.isSuccess || actions.leave.isSuccess;
    const itemCount = purchase.items?.length ?? 0;

    const onError = (fallback: string) => (e: unknown) => setError(actionErrorMessage(e, fallback));

    const leave = () => {
        if (!window.confirm('공동구매에서 나갈까요?\n내가 담은 상품은 공동 장바구니에 그대로 남고, 다시 참여하려면 초대 링크가 필요합니다.')) return;
        setError(null);
        actions.leave.mutate({ id }, {
                onSuccess: () => {
                    router.replace(ROUTES.groupPurchases);
                    actions.removeDetail();
                },
                onError: onError('나가지 못했습니다.'),
            });
    };

    const close = () => {
        const count = purchase.participantCount ?? 0;
        if (!window.confirm(`지금 마감할까요?\n참여자 ${count}명, 상품 ${itemCount}종으로 공동 주문이 만들어지고 각자 결제가 시작됩니다. 마감 후에는 품목과 인원을 바꿀 수 없습니다.`)) return;
        setError(null);
        // 마감되면 BE가 같은 요청 안에서 공동 주문을 만든다. 바로 결제 화면으로 보낸다.
        actions.close.mutate({ id }, { onSuccess: () => router.push(ROUTES.groupPurchaseResult(id)), onError: onError('마감하지 못했습니다.') });
    };

    const cancel = () => {
        if (!window.confirm('공동구매를 취소할까요?\n취소하면 다시 열 수 없습니다. 같은 구성으로 다시 만들 수는 있습니다.')) return;
        setError(null);
        actions.cancel.mutate({ id }, { onError: onError('취소하지 못했습니다.') });
    };

    const duplicate = () => {
        if (!window.confirm('같은 제목·인원·상품으로 새 공동구매를 만들까요?\n참여자는 옮겨지지 않으니 새 초대 링크를 다시 공유해야 합니다.')) return;
        setError(null);
        actions.duplicate.mutate(
            { id },
            {
                onSuccess: (res) => {
                    const created = res.data;
                    const excluded = created?.excludedInventoryIds?.length ?? 0;
                    if (excluded > 0) window.alert(`지금 구매할 수 없는 상품 ${excluded}종은 빼고 만들었습니다.`);
                    router.push(created?.id !== undefined ? `${ROUTES.groupPurchaseCreated}?id=${created.id}` : ROUTES.groupPurchases);
                },
                onError: onError('다시 만들지 못했습니다.'),
            },
        );
    };

    if (!isActive && purchase.status !== 'CLOSED' && !perm.canDuplicate) return null;

    return (
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <h2 className="font-headline-sm text-headline-sm text-primary">{purchase.viewerIsCreator ? '공동구매 관리' : '참여 관리'}</h2>

            {purchase.status === 'CLOSED' && (
                <div className="bg-surface-container-high rounded-lg p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-start gap-space-xs">
                        <Icon name="account_balance_wallet" className="text-primary text-[22px] shrink-0" />
                        <p className="font-body-md text-body-md text-on-surface">
                            마감되어 공동 주문이 만들어졌습니다. 공동 주문 화면에서 내 몫을 결제하고 팀원들의 결제 현황을 확인하세요.
                            {purchase.viewerIsCreator && ' 만든 사람은 결제할 때 팀 배송지를 함께 입력합니다.'}
                        </p>
                    </div>
                    <Link className={`${PRIMARY} shrink-0`} href={ROUTES.groupPurchaseResult(id)}>
                        <Icon name="arrow_forward" className="text-[18px]" />
                        공동 주문 · 결제로
                    </Link>
                </div>
            )}

            {(isActive || perm.canDuplicate) && (
                <div className="flex flex-wrap gap-space-sm">
                    {editableNow && purchase.inviteCode && (
                        <CopyLinkButton
                            url={inviteUrl(window.location.origin, id, purchase.inviteCode)}
                            label="초대 링크 복사"
                            icon="link"
                            className={PRIMARY}
                            copiedClassName="opacity-90"
                        />
                    )}
                    {perm.canClose && (
                        <button className={SECONDARY} type="button" onClick={close} disabled={busy || itemCount === 0} title={itemCount === 0 ? '상품을 담아야 마감할 수 있습니다.' : undefined}>
                            <Icon name="lock_clock" className="text-[18px]" />
                            {actions.close.isPending ? '마감하는 중...' : '지금 마감하기'}
                        </button>
                    )}
                    {perm.canIncreaseMax && !maxFormOpen && (
                        <button className={SECONDARY} type="button" onClick={() => setMaxFormOpen(true)} disabled={busy}>
                            <Icon name="group_add" className="text-[18px]" />
                            최대 인원 늘리기
                        </button>
                    )}
                    {perm.canLeave && (
                        <button className={DANGER} type="button" onClick={leave} disabled={busy}>
                            <Icon name="logout" className="text-[18px]" />
                            {actions.leave.isPending ? '나가는 중...' : '공동구매 나가기'}
                        </button>
                    )}
                    {perm.canCancel && (
                        <button className={DANGER} type="button" onClick={cancel} disabled={busy}>
                            <Icon name="cancel" className="text-[18px]" />
                            {actions.cancel.isPending ? '취소하는 중...' : '공동구매 취소'}
                        </button>
                    )}
                    {perm.canDuplicate && (
                        <button className={SECONDARY} type="button" onClick={duplicate} disabled={busy}>
                            <Icon name="content_copy" className="text-[18px]" />
                            {actions.duplicate.isPending ? '만드는 중...' : '같은 구성으로 다시 만들기'}
                        </button>
                    )}
                </div>
            )}

            {perm.canIncreaseMax && maxFormOpen && (
                <MaxParticipantsForm
                    id={id}
                    increaseMax={actions.increaseMax}
                    current={purchase.maxParticipants ?? 2}
                    joined={purchase.participantCount ?? 0}
                    onDone={() => setMaxFormOpen(false)}
                    onError={(e) => setError(actionErrorMessage(e, '최대 인원을 바꾸지 못했습니다.'))}
                />
            )}

            {error && (
                <p className="p-space-sm rounded bg-error-container text-on-error-container font-body-sm text-body-sm" role="alert">
                    {error}
                </p>
            )}

            {isActive && (
                <ul className="font-caption text-caption text-secondary list-disc pl-space-md space-y-0.5">
                    {purchase.viewerIsCreator ? (
                        <>
                            <li>마감하면 지금 참여자·상품으로 공동 주문이 만들어지고, 결제 기한(48시간) 안에 전원이 결제해야 주문이 확정됩니다.</li>
                            <li>참여자 내보내기와 최대 인원 늘리기는 수정 마감 전까지만 할 수 있습니다.</li>
                        </>
                    ) : (
                        <li>수정 마감 전까지는 언제든 나갈 수 있습니다. 마감되면 내 몫을 결제해야 합니다.</li>
                    )}
                </ul>
            )}
        </section>
    );
}

function MaxParticipantsForm({
    id,
    increaseMax,
    current,
    joined,
    onDone,
    onError,
}: {
    id: number;
    increaseMax: ReturnType<typeof useSharedPurchaseActions>['increaseMax'];
    current: number;
    joined: number;
    onDone: () => void;
    onError: (error: unknown) => void;
}) {
    const [value, setValue] = useState(String(Math.min(current + 1, MAX_PARTICIPANTS)));
    const next = Number(value);
    const valid = Number.isInteger(next) && next > current && next <= MAX_PARTICIPANTS;

    return (
        <form
            className="bg-surface-container-low rounded-lg p-space-md flex flex-col sm:flex-row sm:items-end gap-space-sm"
            onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                increaseMax.mutate({ id, data: { maxParticipants: next } }, { onSuccess: onDone, onError });
            }}
        >
            <label className="flex flex-col gap-space-xs flex-1">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                    새 최대 인원 (지금 {joined}명 참여 / 최대 {current}명 → {current + 1}~{MAX_PARTICIPANTS}명)
                </span>
                <input
                    className="w-full h-10 px-space-md rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none"
                    type="number"
                    inputMode="numeric"
                    min={current + 1}
                    max={MAX_PARTICIPANTS}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    aria-invalid={!valid}
                />
                {!valid && <span className="font-caption text-caption text-error">최대 인원은 늘리는 것만 가능합니다 ({current + 1}~{MAX_PARTICIPANTS}명).</span>}
            </label>
            <div className="flex gap-space-xs">
                <button className={PRIMARY} type="submit" disabled={!valid || increaseMax.isPending}>
                    {increaseMax.isPending ? '저장 중...' : '늘리기'}
                </button>
                <button className={SECONDARY} type="button" onClick={onDone}>
                    닫기
                </button>
            </div>
        </form>
    );
}

// 참여자 관리·마감·취소 실패 안내. 대부분 화면이 낡아서(마감됨·이미 처리됨) 생기므로 다음에 할 일을 함께 알려 준다.
export function actionErrorMessage(error: unknown, fallback: string): string {
    if (hasErrorCode(error, 'CART_SHARED_EDIT_CLOSED')) return '수정 기간이 끝나 더 이상 참여자를 바꿀 수 없습니다.';
    if (hasErrorCode(error, 'CART_SHARED_EMPTY_ITEMS')) return '담긴 상품이 없어 마감할 수 없습니다. 상품을 먼저 담아주세요.';
    if (hasErrorCode(error, 'CART_SHARED_HAS_UNAVAILABLE_ITEMS')) return '구매할 수 없는 상품이 있어 마감할 수 없습니다. 품목 편집에서 해당 상품을 빼고 다시 마감해주세요.';
    if (hasErrorCode(error, 'CART_SHARED_NOT_CLOSABLE')) return '지금은 마감할 수 없는 상태입니다. 화면을 새로고침해 상태를 확인해주세요.';
    if (hasErrorCode(error, 'CART_SHARED_NOT_CANCELABLE')) return '이미 마감되었거나 취소된 공동구매라 취소할 수 없습니다.';
    if (hasErrorCode(error, 'CART_SHARED_MEMBER_NOT_FOUND')) return '이미 공동구매에서 나간 참여자입니다.';
    return errorMessage(error, fallback);
}
