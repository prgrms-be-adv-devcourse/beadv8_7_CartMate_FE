'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@astryxdesign/core';
import { getGetSellerClaimsQueryKey, useCompleteClaim } from '@/api/generated/claim-controller/claim-controller';
import type { SellerClaimResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import ClaimReviewDialog from './ClaimReviewDialog';

// 클레임 상태에 맞는 처리 버튼.
// 접수(REQUESTED)는 "검토하기"로 상품마다 승인 · 거절을 정하고, 승인(APPROVED)은 마무리 버튼만 보여 준다.
// 마무리 버튼은 탭 이름("처리완료")과 겹치지 않게 할 일로 부른다: 반품은 "반품 완료", 교환은 "교환 완료".
// 반품은 환불이 끝나야(COMPLETED) 반품 완료할 수 있다. 진행 중 · 실패면 버튼을 막고 이유를 보여 준다.
export default function ClaimActions({ claim }: { claim: SellerClaimResponse }) {
    const queryClient = useQueryClient();
    const [reviewing, setReviewing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const complete = useCompleteClaim({
        mutation: {
            onSuccess: () => {
                setError(null);
                void queryClient.invalidateQueries({ queryKey: getGetSellerClaimsQueryKey() });
            },
            onError: (e) => setError(errorMessage(e, '완료 처리에 실패했습니다.')),
        },
    });

    const isRefund = claim.claimType === 'REFUND';
    const completeLabel = isRefund ? '반품 완료' : '교환 완료';
    const refundBlocked = claim.claimType === 'REFUND' && claim.refundStatus !== 'COMPLETED' && claim.refundStatus !== 'NONE';

    function handleComplete() {
        const question = isRefund ? '반품 상품을 회수했나요?' : '상품을 회수하고 교환 상품을 보냈나요?';
        if (!window.confirm(`${question} ${completeLabel}로 바꾸면 되돌릴 수 없습니다.`)) return;
        setError(null);
        complete.mutate({ claimId: claim.claimId! });
    }

    return (
        <div className="flex flex-col items-center gap-space-xs">
            {claim.status === 'REQUESTED' && <Button label="검토하기" onClick={() => setReviewing(true)} />}
            {claim.status === 'APPROVED' && (
                <Button
                    label={complete.isPending ? '처리 중…' : completeLabel}
                    variant="primary"
                    isDisabled={complete.isPending || refundBlocked}
                    tooltip={refundBlocked ? '환불이 끝난 뒤 반품 완료할 수 있습니다' : undefined}
                    onClick={handleComplete}
                />
            )}
            {error && (
                <p className="text-caption text-error text-center" role="alert">
                    {error}
                </p>
            )}
            {reviewing && <ClaimReviewDialog claim={claim} onClose={() => setReviewing(false)} />}
        </div>
    );
}
