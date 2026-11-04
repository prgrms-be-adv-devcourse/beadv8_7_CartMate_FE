'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetSellerClaimsQueryKey, useApproveClaim, useCompleteClaim } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';

const APPROVE_BUTTON = 'whitespace-nowrap bg-surface border border-outline-variant text-on-surface text-caption px-space-md py-1 rounded hover:bg-surface-container font-label-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed';
const COMPLETE_BUTTON = 'whitespace-nowrap bg-primary text-on-primary text-caption px-space-md py-1 rounded hover:opacity-90 font-label-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed';

// 클레임 상태에 맞는 처리 버튼. 접수(REQUESTED)는 "수락", 처리 중(APPROVED)은 "처리 완료"만 보여 준다.
// 수락 후에만 완료할 수 있고, 순서를 어기면 BE 가 409 를 돌려준다.
export default function ClaimActions({ claim }: { claim: SellerClaimResponse }) {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    // 성공하면 목록을 다시 조회한다. 상태가 바뀐 클레임은 현재 탭에서 빠지고 다음 상태의 탭에 나타난다.
    function onSuccess() {
        setError(null);
        void queryClient.invalidateQueries({ queryKey: getGetSellerClaimsQueryKey() });
    }
    const approve = useApproveClaim({ mutation: { onSuccess, onError: (e) => setError(errorMessage(e, '수락 처리에 실패했습니다.')) } });
    const complete = useCompleteClaim({ mutation: { onSuccess, onError: (e) => setError(errorMessage(e, '처리 완료 변경에 실패했습니다.')) } });
    const busy = approve.isPending || complete.isPending;

    function handleApprove() {
        // 환불은 수락하는 순간 결제 환불이 실행되고, 환불이 실패하면 수락도 취소된다.
        const message = claim.claimType === 'REFUND' ? '수락하면 환불이 바로 진행되고 되돌릴 수 없습니다. 수락할까요?' : '교환 요청을 수락할까요?';
        if (!window.confirm(message)) return;
        setError(null);
        approve.mutate({ claimId: claim.claimId! });
    }

    function handleComplete() {
        if (!window.confirm('처리 완료로 변경할까요? 변경 후에는 되돌릴 수 없습니다.')) return;
        setError(null);
        complete.mutate({ claimId: claim.claimId! });
    }

    return (
        <div className="flex flex-col items-end gap-space-xs">
            {claim.status === 'REQUESTED' && (
                <button className={APPROVE_BUTTON} type="button" disabled={busy} onClick={handleApprove}>
                    {approve.isPending ? '처리 중…' : '수락'}
                </button>
            )}
            {claim.status === 'APPROVED' && (
                <button className={COMPLETE_BUTTON} type="button" disabled={busy} onClick={handleComplete}>
                    {complete.isPending ? '처리 중…' : '처리 완료'}
                </button>
            )}
            {error && (
                <p className="text-caption text-error text-right" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
