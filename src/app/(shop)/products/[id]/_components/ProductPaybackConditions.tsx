'use client';

import type { PaybackConditionResponse } from '@/api/generated/model';
import { useGetProductPaybackConditions } from '@/api/generated/payback-condition-controller/payback-condition-controller';
import { errorMessage } from '@/api/http';

const funderLabels = { ADMIN: '플랫폼 부담', SELLER: '판매자 부담' } as const;

const policyDescriptions = {
    BOTH: '기준을 충족한 조건을 모두 적용합니다.',
    LARGER: '기준을 충족한 조건 중 개당 금액이 큰 조건 하나만 적용합니다. 금액이 같으면 플랫폼 부담 조건을 적용합니다.',
    ADMIN_ONLY: '플랫폼 부담 조건의 기준을 충족한 경우에만 플랫폼 부담 조건을 적용합니다. 판매자 부담 조건은 적용하지 않습니다.',
    SELLER_ONLY: '판매자 부담 조건의 기준을 충족한 경우에만 판매자 부담 조건을 적용합니다. 플랫폼 부담 조건은 적용하지 않습니다.',
} as const;

function validCondition(condition: PaybackConditionResponse, productId: number) {
    return (condition.productId === undefined || condition.productId === productId)
        && (condition.funder === 'ADMIN' || condition.funder === 'SELLER')
        && Number.isInteger(condition.minQuantity) && (condition.minQuantity ?? 0) > 0
        && Number.isInteger(condition.amountPerUnit) && (condition.amountPerUnit ?? 0) > 0;
}

export default function ProductPaybackConditions({ productId }: { productId: number }) {
    const query = useGetProductPaybackConditions(productId);
    const conditions = query.data?.data;
    const invalid = query.isSuccess && (!Array.isArray(conditions) || conditions.some((condition) => !validCondition(condition, productId)));
    const ordered = Array.isArray(conditions)
        ? [...conditions].sort((a, b) => (a.funder === 'ADMIN' ? 0 : 1) - (b.funder === 'ADMIN' ? 0 : 1))
        : [];
    const hasBoth = ordered.some((condition) => condition.funder === 'ADMIN')
        && ordered.some((condition) => condition.funder === 'SELLER');
    const policy = ordered.find((condition) => condition.funder === 'ADMIN')?.overlapPolicy ?? 'BOTH';

    return (
        <section className="border border-outline-variant bg-surface-container-low p-space-md flex flex-col gap-space-sm" aria-label="페이백 조건">
            <h2 className="font-label-md text-label-md text-on-surface font-bold">페이백 조건</h2>
            {query.isPending ? (
                <p className="font-body-sm text-body-sm text-secondary" role="status">조건을 불러오는 중입니다.</p>
            ) : query.isError || invalid ? (
                <div className="flex flex-col items-start gap-space-xs" role="alert">
                    <p className="font-body-sm text-body-sm text-error">
                        {invalid ? '페이백 조건을 표시할 수 없습니다.' : errorMessage(query.error, '페이백 조건을 불러오지 못했습니다.')}
                    </p>
                    <button type="button" className="h-9 px-space-sm border border-outline-variant bg-surface-container-lowest font-label-sm text-label-sm hover:bg-surface-container" onClick={() => query.refetch()}>
                        다시 시도
                    </button>
                </div>
            ) : ordered.length === 0 ? (
                <p className="font-body-sm text-body-sm text-secondary">현재 설정된 페이백 조건이 없습니다.</p>
            ) : (
                <>
                    <ul className="flex flex-col gap-space-xs">
                        {ordered.map((condition) => (
                            <li key={condition.funder} className="border border-outline-variant bg-surface-container-lowest p-space-sm">
                                <span className="font-label-sm text-label-sm text-on-surface font-bold">{funderLabels[condition.funder!]}</span>
                                <p className="font-body-sm text-body-sm text-on-surface mt-1">
                                    공동구매 내 해당 상품 구매확정 수량이 {condition.minQuantity!.toLocaleString('ko-KR')}개 이상이면,
                                    내 구매확정 수량 1개당 {condition.amountPerUnit!.toLocaleString('ko-KR')}원
                                </p>
                            </li>
                        ))}
                    </ul>
                    {hasBoth && (
                        <p className="font-body-sm text-body-sm text-secondary">
                            중복 조건: {policy in policyDescriptions
                                ? policyDescriptions[policy]
                                : '적용 방식은 현재 확인할 수 없습니다.'}
                        </p>
                    )}
                </>
            )}
            <p className="font-caption text-caption text-secondary border-t border-outline-variant pt-space-xs">
                공동구매에 적용되는 조건은 상품이 처음 포함될 때 정해지며, 이후 변경한 조건과 다를 수 있습니다.
            </p>
        </section>
    );
}
