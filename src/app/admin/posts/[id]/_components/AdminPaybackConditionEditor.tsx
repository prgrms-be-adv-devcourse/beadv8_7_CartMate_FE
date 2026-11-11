'use client';

import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { PaybackConditionResponse, AdminPaybackConditionRequestOverlapPolicy } from '@/api/generated/model';
import { useReleaseAdminPaybackCondition, useSetAdminPaybackCondition } from '@/api/generated/admin-payback-condition-controller/admin-payback-condition-controller';
import { getGetProductPaybackConditionsQueryKey, useGetProductPaybackConditions } from '@/api/generated/payback-condition-controller/payback-condition-controller';
import { ApiError, errorMessage } from '@/api/http';

const policies: { value: AdminPaybackConditionRequestOverlapPolicy; label: string; description: string }[] = [
    { value: 'BOTH', label: '기준을 충족한 조건 모두', description: '각 조건의 기준을 충족하면 둘 다 적용합니다.' },
    { value: 'LARGER', label: '충족한 조건 중 개당 금액이 큰 하나', description: '두 조건이 있으면 금액이 같은 경우 플랫폼 부담 조건을 적용합니다.' },
    { value: 'ADMIN_ONLY', label: '플랫폼 부담만', description: '두 조건이 있으면 판매자 부담 조건은 적용하지 않습니다.' },
    { value: 'SELLER_ONLY', label: '판매자 부담만', description: '두 조건이 있으면 플랫폼 부담 조건은 적용하지 않습니다.' },
];

function validCondition(condition: PaybackConditionResponse, productId: number) {
    return condition != null && (condition.productId === undefined || condition.productId === productId)
        && (condition.funder === 'ADMIN' || condition.funder === 'SELLER')
        && Number.isInteger(condition.minQuantity) && (condition.minQuantity ?? 0) > 0
        && Number.isInteger(condition.amountPerUnit) && (condition.amountPerUnit ?? 0) > 0;
}

function failureMessage(error: unknown) {
    if (error instanceof ApiError && error.status === 403) return '이 상품의 페이백 조건을 관리할 권한이 없습니다.';
    return errorMessage(error, '페이백 조건 처리에 실패했습니다.');
}

export default function AdminPaybackConditionEditor({ productId, productName }: { productId: number; productName: string }) {
    const queryClient = useQueryClient();
    const [notice, setNotice] = useState<string | null>(null);
    const query = useGetProductPaybackConditions(productId);
    const conditions = query.data?.data;
    const invalid = (query.isSuccess || conditions !== undefined) && (!Array.isArray(conditions) || conditions.some((condition) => !validCondition(condition, productId)));
    const hasValidData = Array.isArray(conditions) && !invalid;
    const admin = Array.isArray(conditions) ? conditions.find((condition) => condition.funder === 'ADMIN') : undefined;
    const seller = Array.isArray(conditions) ? conditions.find((condition) => condition.funder === 'SELLER') : undefined;

    if (query.isPending) return <p className="font-body-sm text-body-sm text-outline" role="status">{productName} 페이백 조건을 불러오는 중입니다.</p>;
    if ((query.isError && !hasValidData) || invalid) {
        return (
            <div className="border border-outline-variant p-space-md flex flex-col items-start gap-space-xs" role="alert">
                <p className="font-body-sm text-body-sm text-error">{invalid ? '조건 응답을 표시할 수 없습니다.' : failureMessage(query.error)}</p>
                <button type="button" className="h-9 px-space-sm border border-outline-variant rounded" onClick={() => query.refetch()}>다시 시도</button>
            </div>
        );
    }

    const formKey = `${productId}:${admin?.minQuantity ?? ''}:${admin?.amountPerUnit ?? ''}:${admin?.overlapPolicy ?? 'BOTH'}`;
    return (
        <div className="border border-outline-variant bg-surface-container-low p-space-md flex flex-col gap-space-md">
            <div>
                <h3 className="font-label-md text-label-md font-bold">{productName} 페이백 조건</h3>
                <p className="font-caption text-caption text-outline">상품 #{productId} · 현재 설정된 조건</p>
            </div>
            {query.isError && (
                <div className="border border-error p-space-sm flex items-center gap-space-sm" role="alert">
                    <p className="font-body-sm text-body-sm text-error flex-1">최신 조건을 확인하지 못했습니다. 입력값은 유지됩니다. 다시 조회한 뒤 저장해 주세요.</p>
                    <button type="button" className="h-9 px-space-sm border border-outline-variant rounded" onClick={() => query.refetch()}>다시 조회</button>
                </div>
            )}
            {seller ? (
                <div className="border border-outline-variant bg-surface-container-lowest p-space-sm font-body-sm text-body-sm">
                    <strong>판매자 부담 (읽기 전용)</strong>
                    <p>공동구매 내 구매확정 {seller.minQuantity!.toLocaleString('ko-KR')}개 이상 · 내 구매확정 1개당 {seller.amountPerUnit!.toLocaleString('ko-KR')}원</p>
                </div>
            ) : <p className="font-body-sm text-body-sm text-outline">판매자 부담 조건은 없습니다.</p>}
            {notice && <p className="font-body-sm text-body-sm text-primary" role="status">{notice}</p>}
            <AdminConditionForm key={formKey} productId={productId} admin={admin} hasSeller={Boolean(seller)} blocked={query.isError} onStart={() => setNotice(null)} onDone={setNotice} invalidate={() => queryClient.invalidateQueries({ queryKey: getGetProductPaybackConditionsQueryKey(productId) })} />
            <p className="font-caption text-caption text-outline border-t border-outline-variant pt-space-xs">
                공동구매에 적용되는 조건은 상품이 처음 포함될 때 정해지며, 이후 변경한 조건과 다를 수 있습니다.
            </p>
        </div>
    );
}

function AdminConditionForm({ productId, admin, hasSeller, blocked, onStart, onDone, invalidate }: {
    productId: number;
    admin: PaybackConditionResponse | undefined;
    hasSeller: boolean;
    blocked: boolean;
    onStart: () => void;
    onDone: (message: string) => void;
    invalidate: () => Promise<unknown>;
}) {
    const [minQuantity, setMinQuantity] = useState(admin?.minQuantity?.toString() ?? '');
    const [amountPerUnit, setAmountPerUnit] = useState(admin?.amountPerUnit?.toString() ?? '');
    const [policy, setPolicy] = useState<AdminPaybackConditionRequestOverlapPolicy>(admin?.overlapPolicy ?? 'BOTH');
    const [error, setError] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const save = useSetAdminPaybackCondition({ mutation: {
        onSuccess: async () => {
            onDone('플랫폼 부담 조건을 저장했습니다.');
            await invalidate();
        },
        onError: (cause) => setError(failureMessage(cause)),
    } });
    const remove = useReleaseAdminPaybackCondition({ mutation: {
        onSuccess: async () => {
            setConfirmDelete(false);
            onDone('플랫폼 부담 조건을 삭제했습니다.');
            await invalidate();
        },
        onError: (cause) => setError(failureMessage(cause)),
    } });
    const pending = save.isPending || remove.isPending;
    const disabled = pending || blocked;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onStart();
        setError(null);
        const quantity = Number(minQuantity);
        const amount = Number(amountPerUnit);
        if (!Number.isInteger(quantity) || quantity < 2 || quantity > 100000 || !Number.isInteger(amount) || amount < 1 || amount > 100000) {
            setError('기준 수량은 2~100,000개, 개당 금액은 1~100,000원으로 입력해 주세요.');
            return;
        }
        save.mutate({ productId, data: { minQuantity: quantity, amountPerUnit: amount, overlapPolicy: policy } });
    };

    const deleteCondition = () => {
        onStart();
        setError(null);
        remove.mutate({ productId });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-space-sm">
            <h4 className="font-label-md text-label-md font-bold">플랫폼 부담 조건 {admin ? '수정' : '설정'}</h4>
            <div className="grid grid-cols-2 gap-space-sm">
                <label className="font-label-sm text-label-sm flex flex-col gap-space-xs">공동구매 내 구매확정 기준 수량
                    <input type="number" min={2} max={100000} step={1} required disabled={disabled} value={minQuantity} onChange={(event) => setMinQuantity(event.target.value)} className="h-10 px-space-sm border border-outline-variant rounded bg-surface-container-lowest" />
                </label>
                <label className="font-label-sm text-label-sm flex flex-col gap-space-xs">내 구매확정 1개당 금액 (원)
                    <input type="number" min={1} max={100000} step={1} required disabled={disabled} value={amountPerUnit} onChange={(event) => setAmountPerUnit(event.target.value)} className="h-10 px-space-sm border border-outline-variant rounded bg-surface-container-lowest" />
                </label>
            </div>
            <label className="font-label-sm text-label-sm flex flex-col gap-space-xs">두 조건의 중복 적용 방식
                <select value={policy} disabled={disabled} onChange={(event) => setPolicy(event.target.value as AdminPaybackConditionRequestOverlapPolicy)} className="h-10 px-space-sm border border-outline-variant rounded bg-surface-container-lowest">
                    {policies.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
            </label>
            <p className="font-caption text-caption text-outline">{policies.find((item) => item.value === policy)?.description} {hasSeller ? '' : '판매자 부담 조건이 없으면 현재는 플랫폼 부담 조건 하나만 적용됩니다.'}</p>
            {error && <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p>}
            <div className="flex gap-space-sm">
                <button type="submit" disabled={disabled} className="h-10 px-space-md bg-primary text-on-primary rounded font-label-sm text-label-sm disabled:opacity-50">{pending ? '처리 중…' : '조건 저장'}</button>
                {admin && !confirmDelete && <button type="button" disabled={disabled} onClick={() => setConfirmDelete(true)} className="h-10 px-space-md border border-error text-error rounded font-label-sm text-label-sm disabled:opacity-50">조건 삭제</button>}
            </div>
            {admin && confirmDelete && (
                <div className="border border-error p-space-sm flex flex-col gap-space-xs">
                    <p className="font-body-sm text-body-sm">플랫폼 부담 조건을 삭제할까요? 기존 공동구매에 적용된 조건은 그대로 남을 수 있습니다.</p>
                    <div className="flex gap-space-sm">
                        <button type="button" disabled={disabled} onClick={deleteCondition} className="h-9 px-space-sm bg-error text-on-error rounded disabled:opacity-50">삭제 확인</button>
                        <button type="button" disabled={disabled} onClick={() => setConfirmDelete(false)} className="h-9 px-space-sm border border-outline-variant rounded">취소</button>
                    </div>
                </div>
            )}
        </form>
    );
}
