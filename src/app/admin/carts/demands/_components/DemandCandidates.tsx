'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetCandidatesQueryKey,
    useGetCandidates,
    useOpenGroupPurchase,
} from '@/api/generated/admin-cart-demand-controller/admin-cart-demand-controller';
import type { DemandCandidateResponse, GetCandidatesParams } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import { ROUTES } from '@/lib/routes';
import { parseKst } from '@/lib/format';

type DemandFilters = Required<GetCandidatesParams>;

const DEFAULT_FILTERS: DemandFilters = {
    minExactMembers: 3,
    minMembers: 5,
    days: 30,
    size: 20,
    cooldownDays: 14,
};

const FILTER_FIELDS = [
    { key: 'minExactMembers', label: '정확히 같은 상품 최소 인원', min: 1, max: 1000 },
    { key: 'minMembers', label: '전체 최소 인원', min: 1, max: 1000 },
    { key: 'days', label: '최근 장바구니 기간 (일)', min: 1, max: 90 },
    { key: 'size', label: '최대 후보 수', min: 1, max: 100 },
    { key: 'cooldownDays', label: '재개설 제외 기간 (일)', min: 0, max: 90 },
] as const;

function filtersError(filters: DemandFilters): string | null {
    for (const field of FILTER_FIELDS) {
        const value = filters[field.key];
        if (!Number.isInteger(value) || value < field.min || value > field.max) {
            return `${field.label}: ${field.min}~${field.max} 사이의 정수를 입력해 주세요.`;
        }
    }
    if (filters.minExactMembers > filters.minMembers) {
        return '정확히 같은 상품 최소 인원은 전체 최소 인원보다 클 수 없습니다.';
    }
    return null;
}

export default function DemandCandidates() {
    const queryClient = useQueryClient();
    const [draftFilters, setDraftFilters] = useState<DemandFilters>(DEFAULT_FILTERS);
    const [filters, setFilters] = useState<DemandFilters>(DEFAULT_FILTERS);
    const [filterError, setFilterError] = useState<string | null>(null);
    const [selected, setSelected] = useState<DemandCandidateResponse | null>(null);
    const [title, setTitle] = useState('');
    const [deadlineAt, setDeadlineAt] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selected) titleInputRef.current?.focus();
    }, [selected]);

    const candidates = useGetCandidates(filters, {
        query: { select: (response) => response.data ?? [], staleTime: 0 },
    });
    const open = useOpenGroupPurchase({
        mutation: {
            onSuccess: () => {
                setSelected(null);
            },
            onSettled: async (_data, error) => {
                if (error && !(error instanceof ApiError && error.status === 409)) return;
                const queryKey = getGetCandidatesQueryKey();
                await queryClient.cancelQueries({ queryKey });
                void queryClient.invalidateQueries({ queryKey });
            },
        },
    });
    const created = open.data?.data;

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const error = filtersError(draftFilters);
        setFilterError(error);
        if (error) return;
        if (FILTER_FIELDS.every(({ key }) => draftFilters[key] === filters[key])) {
            void candidates.refetch();
        } else {
            setFilters({ ...draftFilters });
        }
    };

    const selectCandidate = (candidate: DemandCandidateResponse) => {
        setSelected(candidate);
        setTitle(`${candidate.productName ?? `상품 #${candidate.productId}`} 공동구매`.slice(0, 50));
        setDeadlineAt('');
        setFormError(null);
        open.reset();
    };

    const submitOpen = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (selected?.productId == null || open.isPending) return;
        const trimmedTitle = title.trim();
        if (!trimmedTitle || trimmedTitle.length > 50) {
            setFormError('제목을 1~50자로 입력해 주세요.');
            return;
        }
        if (deadlineAt) {
            const deadline = parseKst(deadlineAt)?.getTime();
            const now = Date.now();
            if (deadline === undefined || deadline <= now || deadline > now + 7 * 24 * 60 * 60 * 1000) {
                setFormError('마감일은 현재 이후부터 7일 이내로 설정해 주세요.');
                return;
            }
        }
        setFormError(null);
        open.mutate({
            productId: selected.productId,
            data: { title: trimmedTitle, deadlineAt: deadlineAt || undefined },
        });
    };

    return (
        <div className="flex flex-col gap-space-lg">
            <div>
                <Heading level={1}>장바구니 수요 후보</Heading>
                <Text display="block" color="secondary" className="mt-2">
                    장바구니에 담긴 상품 수요를 확인하고 개인물품 공동구매를 개설합니다.
                </Text>
            </div>

            <Card>
              <form className="flex flex-col gap-space-md" onSubmit={applyFilters}>
                <Heading level={2}>후보 조회 기준</Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-space-md">
                    {FILTER_FIELDS.map((field) => (
                        <label key={field.key} className="flex flex-col gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
                            {field.label}
                            <input
                                className="h-10 px-space-sm bg-surface-container-lowest border border-outline-variant rounded text-on-surface"
                                type="number"
                                min={field.min}
                                max={field.max}
                                step={1}
                                value={draftFilters[field.key]}
                                onChange={(event) => setDraftFilters((current) => ({ ...current, [field.key]: Number(event.target.value) }))}
                            />
                        </label>
                    ))}
                </div>
                <div className="flex items-center justify-between gap-space-sm">
                    <Text className="text-error" role={filterError ? 'alert' : undefined}>{filterError}</Text>
                    <Button label="조회" type="submit" variant="primary" />
                </div>
              </form>
            </Card>

            {open.isSuccess && (
                <Card variant="muted" className="flex flex-col gap-space-xs" role="status">
                    <Heading level={3}>공동구매가 개설되었습니다.{created?.id != null && ` (번호 #${created.id})`}</Heading>
                    {created?.inviteCode && (
                        <>
                            <Text color="secondary">초대 코드: <code>{created.inviteCode}</code></Text>
                            <Button label="초대 페이지 보기" href={ROUTES.groupPurchaseIndividualInvite(created.inviteCode)} as={Link} variant="secondary" size="sm" />
                        </>
                    )}
                    {created?.id != null && (
                        <Button label="관리자 현황판 보기" href={ROUTES.adminIndividualGroupPurchaseDashboard(created.id)} as={Link} variant="primary" size="sm" />
                    )}
                </Card>
            )}

            <section className="flex flex-col gap-space-md" aria-labelledby="demand-list-title">
                <Heading id="demand-list-title" level={2}>수요 후보</Heading>
                {candidates.isPending ? (
                    <Card variant="muted" role="status"><Text color="secondary">후보를 불러오는 중입니다…</Text></Card>
                ) : candidates.isError ? (
                    <Card variant="muted" className="flex flex-col items-center gap-space-sm" role="alert">
                        <Text className="text-error">{errorMessage(candidates.error, '후보를 불러오지 못했습니다.')}</Text>
                        <Button label="다시 시도" type="button" variant="secondary" size="sm" onClick={() => void candidates.refetch()} />
                    </Card>
                ) : candidates.data.length === 0 ? (
                    <Card variant="muted"><Text color="secondary">현재 조회 기준에 맞는 후보가 없습니다.</Text></Card>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
                        {candidates.data.map((candidate) => (
                            <Card key={candidate.productId} className="flex flex-col gap-space-md">
                              <article className="flex flex-col gap-space-md">
                                <div className="flex items-start justify-between gap-space-md">
                                    <div>
                                        <Heading level={3}>{candidate.productName ?? `상품 #${candidate.productId}`}</Heading>
                                        <Text type="supporting" color="secondary">상품 #{candidate.productId}</Text>
                                    </div>
                                    <span>
                                        {candidate.openGroupPurchaseId != null ? (
                                            <Button label={`개설된 공구 #${candidate.openGroupPurchaseId} 현황`} href={ROUTES.adminIndividualGroupPurchaseDashboard(candidate.openGroupPurchaseId)} as={Link} variant="secondary" size="sm" />
                                        ) : <Badge label={candidate.purchasable ? '개설 가능' : '개설 불가'} variant={candidate.purchasable ? 'success' : 'neutral'} />}
                                    </span>
                                </div>
                                <dl className="grid grid-cols-3 gap-space-sm text-center bg-surface-container-low p-space-md rounded">
                                    <div><dt className="font-caption text-caption text-outline">동일 상품</dt><dd><Text weight="semibold">{candidate.exactMemberCount}명</Text></dd></div>
                                    <div><dt className="font-caption text-caption text-outline">유사 상품</dt><dd><Text weight="semibold">{candidate.similarMemberCount}명</Text></dd></div>
                                    <div><dt className="font-caption text-caption text-outline">전체</dt><dd><Text weight="semibold">{candidate.totalMemberCount}명</Text></dd></div>
                                </dl>
                                {!!candidate.similarProducts?.length && (
                                    <Text color="secondary">함께 집계된 유사 상품 {candidate.similarProducts.length}개</Text>
                                )}
                                <Button
                                    label="공동구매 개설"
                                    type="button"
                                    variant="primary"
                                    isDisabled={candidate.productId == null || !candidate.purchasable || candidate.openGroupPurchaseId != null || open.isPending}
                                    onClick={() => selectCandidate(candidate)}
                                />
                              </article>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {selected && (
                <Card className="border border-primary">
                  <form className="flex flex-col gap-space-md" onSubmit={submitOpen}>
                    <div>
                        <Heading level={2}>{selected.productName ?? `상품 #${selected.productId}`} 공동구매 개설</Heading>
                        <Text display="block" color="secondary" className="mt-space-xs">마감일을 비우면 72시간 뒤로 설정됩니다.</Text>
                    </div>
                    <label className="flex flex-col gap-space-xs font-label-sm text-label-sm text-on-surface">
                        공동구매 제목
                        <input ref={titleInputRef} className="h-10 px-space-sm border border-outline-variant rounded" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={50} required />
                    </label>
                    <label className="flex flex-col gap-space-xs font-label-sm text-label-sm text-on-surface">
                        마감일 (선택, 한국 시간)
                        <input className="h-10 px-space-sm border border-outline-variant rounded" type="datetime-local" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} />
                    </label>
                    {(formError || open.isError) && <Text className="text-error" role="alert">{formError ?? errorMessage(open.error, '공동구매를 개설하지 못했습니다.')}</Text>}
                    <div className="flex justify-end gap-space-sm">
                        <Button label="취소" type="button" variant="secondary" onClick={() => setSelected(null)} isDisabled={open.isPending} />
                        <Button label={open.isPending ? '개설 중…' : '개설하기'} type="submit" variant="primary" isDisabled={open.isPending} />
                    </div>
                  </form>
                </Card>
            )}
        </div>
    );
}
