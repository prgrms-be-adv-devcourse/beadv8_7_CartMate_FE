'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    getGetDetail2QueryKey,
    getGetMyList2QueryKey,
    useAddProduct,
    useChangeDeadline,
    useClose1,
    useGetDetail2,
    useRemoveProduct,
} from '@/api/generated/individual-group-purchase-controller/individual-group-purchase-controller';
import type { IndividualGroupPurchaseDetailResponse, ProductResponse } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, parseKst } from '@/lib/format';
import { formatPrice } from '@/lib/salesPost';
import { MAX_SALE_HOURS, deadlineBounds, remainingText, toBeLocalDateTime, toLocalInputValue } from '../_lib/deadline';
import { MessageBox, SectionTitle, StatusBadge, saleState } from './parts';
import ProductPicker from './ProductPicker';
import Thumb from './Thumb';
import { ROUTES } from '@/lib/routes';

type Detail = IndividualGroupPurchaseDetailResponse;

// 내가 만든 개인물품 공동구매 관리. 상세 조회부터 생성자만 할 수 있다(남의 공구는 403).
export default function ManageView() {
    const { id } = useParams<{ id: string }>();
    const purchaseId = Number(id);
    const validId = Number.isInteger(purchaseId) && purchaseId > 0;
    const query = useGetDetail2(purchaseId, { query: { enabled: validId } });
    const detail = query.data?.data;

    const status = query.error instanceof ApiError ? query.error.status : undefined;
    if (!validId || status === 404) {
        return <MessageBox message="존재하지 않는 공동구매입니다." href={ROUTES.groupPurchasesIndividual} linkLabel="내 개인물품 공동구매 목록" />;
    }
    if (status === 403) {
        return <MessageBox message="내가 만든 공동구매만 관리할 수 있습니다." href={ROUTES.groupPurchasesIndividual} linkLabel="내 개인물품 공동구매 목록" />;
    }
    if (query.isPending) return <ManageSkeleton />;
    if (!detail) return <MessageBox message={errorMessage(query.error, '공동구매 정보를 불러오지 못했습니다.')} onRetry={() => query.refetch()} />;

    return <ManageContent purchaseId={purchaseId} detail={detail} />;
}

export function ManageSkeleton() {
    return <div className="h-96 bg-surface-container-low animate-pulse" aria-hidden />;
}

// 남은 시간 표시와 기한 지남 판단에 쓰는 현재 시각. 30초마다 갱신한다.
function useNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30_000);
        return () => clearInterval(timer);
    }, []);
    return now;
}

function useRefreshDetail(purchaseId: number) {
    const queryClient = useQueryClient();
    return () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: getGetDetail2QueryKey(purchaseId) }),
            queryClient.invalidateQueries({ queryKey: getGetMyList2QueryKey() }),
        ]);
}

function ManageContent({ purchaseId, detail }: { purchaseId: number; detail: Detail }) {
    const now = useNow();
    const refresh = useRefreshDetail(purchaseId);
    const state = saleState(detail);
    // 화면을 띄워 둔 사이 기한이 지나면 BE는 변경을 거절하므로 미리 막는다.
    const deadline = parseKst(detail.deadlineAt);
    const deadlinePassed = deadline !== null && deadline.getTime() <= now.getTime();
    const editable = state === 'selling' && !deadlinePassed;

    const close = useClose1({ mutation: { onSettled: () => void refresh() } });
    const onClose = () => {
        if (close.isPending) return;
        if (window.confirm('공동구매를 마감할까요? 마감하면 다시 열 수 없고 더 이상 주문을 받지 않습니다.')) close.mutate({ id: purchaseId });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                    <div className="flex items-start justify-between gap-space-md">
                        <h2 className="font-headline-md text-headline-md text-on-surface break-all">{detail.title}</h2>
                        <StatusBadge status={detail.status} open={editable} />
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-space-md gap-y-1 font-body-sm text-body-sm">
                        <dt className="text-on-surface-variant">판매 기한</dt>
                        <dd className="text-on-surface">
                            {formatDateTime(detail.deadlineAt)}
                            {state === 'selling' && (
                                <span className="ml-space-xs text-secondary">({remainingText(detail.deadlineAt, now) ?? '기한 지남'})</span>
                            )}
                        </dd>
                        {detail.closedAt && (
                            <>
                                <dt className="text-on-surface-variant">마감 처리</dt>
                                <dd className="text-on-surface">{formatDateTime(detail.closedAt)}</dd>
                            </>
                        )}
                    </dl>
                    {detail.status === 'OPEN' && !editable && (
                        <p className="p-space-sm bg-surface-container-low font-body-sm text-body-sm text-on-surface" role="status">
                            판매 기한이 지나 더 이상 주문을 받지 않습니다. 상품·기한은 바꿀 수 없고 마감 처리만 할 수 있습니다.
                        </p>
                    )}
                </section>

                <ProductsSection purchaseId={purchaseId} products={detail.products ?? []} editable={editable} refresh={refresh} />
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-36 flex flex-col gap-gutter">
                <InviteSection inviteCode={detail.inviteCode} closed={state === 'closed'} />
                {editable && <DeadlineSection purchaseId={purchaseId} deadlineAt={detail.deadlineAt} now={now} refresh={refresh} />}
                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                    <SectionTitle icon="monitoring" title="주문 현황" />
                    <button
                        className="w-full h-10 border border-outline-variant font-label-md text-label-md text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        disabled
                    >
                        주문 현황판 보기 (준비 중)
                    </button>
                    {detail.status === 'OPEN' && (
                        <>
                            <button
                                className="w-full h-10 bg-error text-on-error font-label-md text-label-md hover:opacity-90 disabled:opacity-60"
                                type="button"
                                disabled={close.isPending}
                                onClick={onClose}
                            >
                                {close.isPending ? '마감하는 중...' : '공동구매 마감하기'}
                            </button>
                            <p className="font-caption text-caption text-secondary">마감하면 다시 열 수 없습니다. 기한 전에 판매를 멈출 때 씁니다.</p>
                        </>
                    )}
                    {close.isError && (
                        <p className="font-body-sm text-body-sm text-error" role="alert">
                            {errorMessage(close.error, '공동구매를 마감하지 못했습니다.')}
                        </p>
                    )}
                </section>
            </aside>
        </div>
    );
}

function InviteSection({ inviteCode, closed }: { inviteCode?: string; closed: boolean }) {
    const [copy, setCopy] = useState<'idle' | 'done' | 'failed'>('idle');
    const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (copyTimer.current) clearTimeout(copyTimer.current);
    }, []);
    if (!inviteCode) return null;
    // 링크는 이 앱 주소로 만든다. 서버 렌더링 중에는 window가 없어 경로만 쓴다.
    const path = ROUTES.groupPurchaseIndividualInvite(inviteCode);
    const url = typeof window === 'undefined' ? path : new URL(path, window.location.origin).href;

    const onCopy = () => {
        if (!navigator.clipboard) {
            setCopy('failed');
            return;
        }
        // "복사됨"만 잠시 보여 주고, 실패 안내는 직접 복사할 수 있도록 남겨 둔다. 연달아 누르면 이전 타이머를 지운다.
        if (copyTimer.current) clearTimeout(copyTimer.current);
        navigator.clipboard.writeText(url).then(
            () => {
                setCopy('done');
                copyTimer.current = setTimeout(() => setCopy('idle'), 2000);
            },
            () => setCopy('failed'),
        );
    };

    return (
        <section className="bg-surface-container-lowest border border-primary p-space-lg flex flex-col gap-space-sm">
            <SectionTitle icon="link" title="초대 링크" />
            <div className="flex items-stretch gap-space-xs">
                <input
                    className="min-w-0 flex-1 h-10 px-space-sm border border-outline-variant bg-surface-container-low font-caption text-caption text-on-surface"
                    value={url}
                    readOnly
                    aria-label="초대 링크"
                    onFocus={(e) => e.currentTarget.select()}
                />
                <button
                    className="h-10 px-space-md shrink-0 bg-primary text-on-primary font-label-sm text-label-sm flex items-center gap-1 hover:opacity-90"
                    type="button"
                    onClick={onCopy}
                >
                    <Icon name={copy === 'done' ? 'check' : 'content_copy'} className="text-[16px]" />
                    {copy === 'done' ? '복사됨' : '복사'}
                </button>
            </div>
            {copy === 'failed' && <p className="font-caption text-caption text-error">복사하지 못했습니다. 링크를 직접 선택해 복사해주세요.</p>}
            <p className="font-caption text-caption text-secondary">
                {closed ? '마감된 공동구매입니다. 링크로 들어와도 주문할 수 없습니다.' : '링크를 받은 사람은 담긴 상품을 각자 주문합니다. 참여 화면은 준비 중입니다.'}
            </p>
        </section>
    );
}

type ProductsSectionProps = { purchaseId: number; products: ProductResponse[]; editable: boolean; refresh: () => Promise<unknown> };

function ProductsSection({ purchaseId, products, editable, refresh }: ProductsSectionProps) {
    const [adding, setAdding] = useState(false);
    // 요청 중인 상품 id. 한 번에 하나씩만 바꾼다.
    const [busyId, setBusyId] = useState<number | null>(null);
    const add = useAddProduct({ mutation: { onSettled: () => refresh().finally(() => setBusyId(null)) } });
    const remove = useRemoveProduct({ mutation: { onSettled: () => refresh().finally(() => setBusyId(null)) } });
    const fallback = '상품을 바꾸지 못했습니다.';
    const errorText = add.isError ? errorMessage(add.error, fallback) : remove.isError ? errorMessage(remove.error, fallback) : null;
    const productIds = new Set(products.map((p) => p.productId).filter((id): id is number => id !== undefined));
    // BE는 마지막 상품은 빼지 못하게 한다. 판매를 멈추려면 마감한다.
    const onlyOne = products.length <= 1;

    const onRemove = (product: ProductResponse) => {
        if (product.productId === undefined || busyId !== null) return;
        if (!window.confirm(`${product.productName ?? '이 상품'}을(를) 공동구매에서 뺄까요?`)) return;
        add.reset();
        setBusyId(product.productId);
        remove.mutate({ id: purchaseId, productId: product.productId });
    };

    return (
        <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-md">
                <SectionTitle icon="inventory_2" title="판매 상품" />
                <span className="font-caption text-caption text-secondary">총 {products.length}개</span>
            </div>
            {products.length === 0 ? (
                <p className="p-space-md bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">담긴 상품이 없습니다.</p>
            ) : (
                <ul className="flex flex-col divide-y divide-surface-container">
                    {products.map((product) => (
                        <ProductRow
                            key={product.productId}
                            product={product}
                            removable={editable && !onlyOne}
                            removeHint={onlyOne ? '상품이 하나뿐이라 뺄 수 없습니다. 판매를 멈추려면 마감해주세요.' : undefined}
                            busy={busyId === product.productId}
                            disabled={busyId !== null}
                            onRemove={() => onRemove(product)}
                        />
                    ))}
                </ul>
            )}
            {editable && onlyOne && (
                <p className="font-caption text-caption text-secondary">상품이 하나뿐이라 뺄 수 없습니다. 판매를 멈추려면 마감해주세요.</p>
            )}
            {errorText && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {errorText}
                </p>
            )}
            {editable && (
                <div className="flex flex-col gap-space-md border-t border-outline-variant pt-space-md">
                    <button
                        className="self-start h-9 px-space-md border border-outline-variant font-label-sm text-label-sm flex items-center gap-1 hover:border-primary"
                        type="button"
                        aria-expanded={adding}
                        onClick={() => setAdding((v) => !v)}
                    >
                        <Icon name={adding ? 'expand_less' : 'add'} className="text-[18px]" />
                        {adding ? '상품 추가 닫기' : '상품 추가'}
                    </button>
                    {adding && (
                        <ProductPicker
                            selectedIds={new Set()}
                            lockedIds={productIds}
                            busyId={busyId}
                            actionLabel="추가"
                            onToggle={(product) => {
                                if (busyId !== null) return;
                                remove.reset();
                                setBusyId(product.id);
                                add.mutate({ id: purchaseId, data: { productId: product.id } });
                            }}
                        />
                    )}
                </div>
            )}
        </section>
    );
}

type ProductRowProps = { product: ProductResponse; removable: boolean; removeHint?: string; busy: boolean; disabled: boolean; onRemove: () => void };

function ProductRow({ product, removable, removeHint, busy, disabled, onRemove }: ProductRowProps) {
    const prices = (product.options ?? []).map((o) => o.price).filter((p): p is number => typeof p === 'number');
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const optionCount = product.options?.filter((o) => o.optionName).length ?? 0;

    return (
        <li className="py-space-sm flex items-center gap-space-md">
            <Thumb src={product.imageUrl} className="w-14 h-14" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-space-xs">
                    <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                        {/* 상품이 삭제되면 BE가 이름 없이 id만 돌려준다 */}
                        {product.productName ?? `상품 #${product.productId}`}
                    </span>
                    {!product.purchasable && (
                        <span className="shrink-0 px-space-xs py-0.5 bg-error-container text-on-error-container font-caption text-caption">구매 불가</span>
                    )}
                </div>
                <div className="font-caption text-caption text-secondary">
                    {minPrice === null ? '가격 정보 없음' : `${formatPrice(minPrice)}${prices.length > 1 ? '~' : ''}`}
                    {optionCount > 0 && ` · 옵션 ${optionCount}개`}
                </div>
            </div>
            <button
                className="h-9 px-space-md shrink-0 border border-outline-variant font-label-sm text-label-sm text-on-surface-variant hover:border-error hover:text-error disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
                type="button"
                disabled={!removable || disabled}
                title={removable ? undefined : removeHint}
                onClick={onRemove}
            >
                {busy ? '빼는 중...' : '빼기'}
            </button>
        </li>
    );
}

const deadlineSchema = z.object({
    deadlineAt: z
        .string()
        .min(1, '판매 기한을 입력해주세요.')
        .superRefine((value, ctx) => {
            // 입력값은 한국 시간이다.
            const date = parseKst(value);
            const { min, max } = deadlineBounds();
            if (!date) ctx.addIssue({ code: 'custom', message: '날짜와 시간을 다시 확인해주세요.' });
            else if (date <= min) ctx.addIssue({ code: 'custom', message: '판매 기한은 지금 이후여야 합니다.' });
            else if (date > max) ctx.addIssue({ code: 'custom', message: `판매 기한은 지금부터 ${MAX_SALE_HOURS}시간 이내여야 합니다.` });
        }),
});

type DeadlineValues = z.infer<typeof deadlineSchema>;

type DeadlineSectionProps = { purchaseId: number; deadlineAt?: string; now: Date; refresh: () => Promise<unknown> };

function DeadlineSection({ purchaseId, deadlineAt, now, refresh }: DeadlineSectionProps) {
    const change = useChangeDeadline({ mutation: { onSettled: () => void refresh() } });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DeadlineValues>({
        resolver: zodResolver(deadlineSchema),
        // BE 값은 초 단위까지 오므로 입력 칸 형식(분 단위)에 맞춰 자른다.
        defaultValues: { deadlineAt: deadlineAt?.slice(0, 16) ?? '' },
    });
    const { min, max } = deadlineBounds(now);

    const onSubmit = (values: DeadlineValues) => {
        if (change.isPending) return;
        change.mutate({ id: purchaseId, data: { deadlineAt: toBeLocalDateTime(values.deadlineAt) } });
    };

    return (
        <form className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm" onSubmit={handleSubmit(onSubmit)} noValidate>
            <SectionTitle icon="schedule" title="판매 기한 변경" />
            <label className="flex flex-col gap-space-xs">
                <span className="font-body-sm text-body-sm text-on-surface-variant">새 판매 기한</span>
                <input
                    className="w-full h-10 px-space-md border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none"
                    type="datetime-local"
                    min={toLocalInputValue(min)}
                    max={toLocalInputValue(max)}
                    {...register('deadlineAt', { onChange: () => change.reset() })}
                />
                {errors.deadlineAt && <span className="font-caption text-caption text-error">{errors.deadlineAt.message}</span>}
            </label>
            <p className="font-caption text-caption text-secondary">지금부터 {MAX_SALE_HOURS}시간 이내로 정할 수 있습니다. 앞당기거나 늦출 수 있습니다.</p>
            {change.isError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {errorMessage(change.error, '판매 기한을 바꾸지 못했습니다.')}
                </p>
            )}
            {change.isSuccess && (
                <p className="font-body-sm text-body-sm text-primary" role="status">
                    판매 기한을 바꿨습니다.
                </p>
            )}
            <button
                className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 disabled:opacity-60"
                type="submit"
                disabled={change.isPending}
            >
                {change.isPending ? '변경 중...' : '기한 변경'}
            </button>
        </form>
    );
}
