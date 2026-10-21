'use client';

import { useState } from 'react';
import { useApproveClaim, useCompleteClaim } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { claimActionError, type ActionResult } from './claim';

const OUTLINE = 'whitespace-nowrap bg-surface border border-outline-variant text-on-surface text-caption px-space-md py-1 rounded hover:bg-surface-container font-label-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed';
const PRIMARY = 'whitespace-nowrap bg-primary text-on-primary text-caption px-space-md py-1 rounded hover:opacity-90 font-label-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed';

type Props = {
    claim: SellerClaimResponse;
    onResult: (result: ActionResult) => void;
};

// 한 행의 처리 버튼. 승인 대기 → 승인(확인 한 번 더), 승인됨 → 완료 처리.
export default function ClaimActions({ claim, onResult }: Props) {
    if (claim.status === 'REQUESTED') return <ApproveButton claim={claim} onResult={onResult} />;
    if (claim.status === 'APPROVED') return <CompleteButton claim={claim} onResult={onResult} />;
    return <span className="text-caption text-on-surface-variant">{claim.status === 'REJECTED' ? '거절됨' : '처리됨'}</span>;
}

function ApproveButton({ claim, onResult }: Props) {
    const claimId = claim.claimId!;
    const refund = claim.claimType === 'REFUND';
    const [confirming, setConfirming] = useState(false);
    // 결과 콜백은 훅 옵션에 둔다. 재조회로 행이 바뀌어도(언마운트) 결과 안내가 사라지지 않게.
    const approve = useApproveClaim({
        mutation: {
            onSuccess: () =>
                onResult({
                    ok: true,
                    message: refund
                        ? `요청 #${claimId}을(를) 승인했습니다. 환불 금액이 구매자 예치금으로 환불되었습니다. 반품 상품을 받으면 완료 처리해 주세요.`
                        : `요청 #${claimId}을(를) 승인했습니다. 교환 상품을 보낸 뒤 완료 처리해 주세요.`,
                }),
            onError: (error) => onResult({ ok: false, ...claimActionError(error) }),
        },
    });

    if (confirming) {
        return (
            <div className="inline-flex flex-col items-end gap-1">
                <span className="text-caption text-on-surface-variant max-w-[220px] text-right">
                    {refund ? '승인하면 바로 구매자 예치금으로 환불됩니다.' : '교환 요청을 승인합니다.'}
                </span>
                <div className="flex gap-space-xs">
                    <button type="button" className={OUTLINE} disabled={approve.isPending} onClick={() => setConfirming(false)}>
                        취소
                    </button>
                    <button type="button" className={PRIMARY} data-action="approve-confirm" disabled={approve.isPending} onClick={() => approve.mutate({ claimId })}>
                        {approve.isPending ? '승인하는 중...' : refund ? '승인 · 환불' : '승인 확인'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="inline-flex gap-space-xs">
            {/* BE에 거절 API가 없어 비활성으로 둔다. */}
            <button type="button" className={OUTLINE} disabled title="준비 중인 기능입니다">
                거절 (준비 중)
            </button>
            <button type="button" className={PRIMARY} data-action="approve" onClick={() => setConfirming(true)}>
                승인
            </button>
        </div>
    );
}

function CompleteButton({ claim, onResult }: Props) {
    const claimId = claim.claimId!;
    const complete = useCompleteClaim({
        mutation: {
            onSuccess: () => onResult({ ok: true, message: `요청 #${claimId}을(를) 완료 처리했습니다.` }),
            onError: (error) => onResult({ ok: false, ...claimActionError(error) }),
        },
    });
    return (
        <button type="button" className={PRIMARY} data-action="complete" disabled={complete.isPending} onClick={() => complete.mutate({ claimId })}>
            {complete.isPending ? '처리하는 중...' : '완료 처리'}
        </button>
    );
}
