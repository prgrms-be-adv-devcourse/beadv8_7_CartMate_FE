'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { selectSalesPostAll } from '@/api/generated/sales-post-controller/sales-post-controller';
import { ApiError, http } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import ProductFields from './ProductFields';
import {
    INITIAL_PRODUCT_KEY,
    MAX_PRODUCTS,
    MAX_TEXT,
    MAX_TITLE,
    MAX_TOTAL_IMAGES,
    RegisterUncertainError,
    buildFormData,
    emptyProduct,
    errorId,
    parsePrice,
    submitErrorMessage,
    validate,
    type FormErrors,
    type ProductDraft,
} from './salesPostDraft';

const INPUT_CLASS =
    'h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const PRICE_FORMAT = new Intl.NumberFormat('ko-KR');
const CANCEL_CLASS =
    'w-full h-12 bg-surface border border-outline-variant text-on-surface rounded font-label-md transition-colors flex items-center justify-center gap-space-sm';

type SubmitInput = { sellerId: number; title: string; content: string; products: ProductDraft[] };

// 등록 API(201)는 본문이 없어 새 판매글 id를 주지 않는다.
// 같은 제목으로 검색해 내가 쓴 글 중 가장 큰 id를 구한다. (조회 실패는 throw)
async function latestPostId(sellerId: number, title: string): Promise<number | null> {
    const res = await selectSalesPostAll({ title, page: 0, size: 50, sort: ['id,desc'] });
    const ids = (res.data?.content ?? [])
        .filter((post) => post.sellerId === sellerId && post.title === title && post.id !== undefined)
        .map((post) => post.id as number);
    return ids.length > 0 ? Math.max(...ids) : null;
}

// 제출 전 기준 id(before)보다 큰 id가 생겼을 때만 "이번에 만든 글"로 본다.
// 기준을 못 구했거나(undefined) 새 글이 안 보이면 null → 검색 화면으로 보낸다.
async function createdPostId(sellerId: number, title: string, before: number | null | undefined): Promise<number | null> {
    if (before === undefined) return null;
    try {
        const latest = await latestPostId(sellerId, title);
        return latest !== null && (before === null || latest > before) ? latest : null;
    } catch {
        return null;
    }
}

// 응답을 받지 못했거나 서버 오류면 BE에서 등록이 끝났을 수도 있다.
const isUncertain = (error: unknown) => error instanceof ApiError && (error.status === 0 || error.status >= 500);

export default function SalesPostForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isLoading: userLoading } = useCurrentUser();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [products, setProducts] = useState<ProductDraft[]>(() => [emptyProduct(INITIAL_PRODUCT_KEY)]);
    // 한 번 제출을 시도한 뒤부터는 입력할 때마다 다시 검증해, 고친 칸의 오류가 바로 사라지게 한다.
    const [submitted, setSubmitted] = useState(false);
    const errors: FormErrors = submitted ? validate(title, content, products) : {};
    // 화면 낭독기가 입력할 때마다 읽지 않도록, 오류 요약(role=alert)은 제출할 때만 갱신한다.
    const [summary, setSummary] = useState<string[]>([]);

    const mutation = useMutation({
        mutationFn: async ({ sellerId, title, content, products }: SubmitInput) => {
            const trimmed = title.trim();
            let before: number | null | undefined;
            try {
                before = await latestPostId(sellerId, trimmed);
            } catch {
                before = undefined;
            }
            try {
                await http<void>('/api/sales-posts', { method: 'POST', body: buildFormData(sellerId, title, content, products) });
            } catch (error) {
                // 5xx·네트워크 오류 뒤 다시 누르면 중복 등록될 수 있어, 먼저 이미 올라갔는지 확인한다.
                if (!isUncertain(error)) throw error;
                const found = await createdPostId(sellerId, trimmed, before);
                if (found !== null) return found;
                throw new RegisterUncertainError();
            }
            return createdPostId(sellerId, trimmed, before);
        },
        onSuccess: (postId, { title }) => {
            // 홈·검색의 판매글 목록이 새 글을 바로 보여 주도록 판매글 조회 캐시를 비운다.
            queryClient.invalidateQueries({
                predicate: (query) => typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/sales-posts'),
            });
            router.push(postId !== null ? ROUTES.product(postId) : `${ROUTES.search}?q=${encodeURIComponent(title.trim())}`);
        },
    });

    // 성공 후 화면을 옮기는 동안에도 다시 누르지 못하게 둔다.
    const busy = mutation.isPending || mutation.isSuccess;
    const totalImages = products.reduce((sum, p) => sum + p.images.length, 0);
    const prices = products.map((p) => parsePrice(p.price)).filter((price): price is number => price !== null && price > 0);
    const showSummary = summary.length > 0 && Object.keys(errors).length > 0;

    const updateProduct = (key: number, patch: Partial<ProductDraft>) => {
        setProducts((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (busy || !user?.id) return;
        setSubmitted(true);
        const found = validate(title, content, products);
        const keys = Object.keys(found);
        setSummary(Object.values(found));
        if (keys.length > 0) {
            // 첫 오류 칸으로 포커스. 칸이 없는 오류(이미지 합계 등)는 문구로 옮긴다.
            const target = document.querySelector<HTMLElement>(`[data-field="${keys[0]}"]`) ?? document.getElementById(errorId(keys[0]));
            target?.focus();
            return;
        }
        mutation.mutate({ sellerId: user.id, title, content, products });
    };

    return (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl" onSubmit={handleSubmit} noValidate data-testid="sales-post-form">
            <div className="lg:col-span-2 space-y-space-xl">
                {/* 판매글 기본 정보 */}
                <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
                    <div className="border-b border-outline-variant/30 pb-space-md">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">판매글 정보</h2>
                        <p className="text-body-sm text-on-surface-variant">구매자가 목록과 상세에서 보게 될 판매글 제목과 소개입니다.</p>
                    </div>
                    <div className="space-y-space-lg">
                        <div className="flex flex-col space-y-space-xs">
                            <label className="text-body-sm font-label-sm text-on-surface" htmlFor="post-title">
                                판매글 제목 <span className="text-error">*</span>
                            </label>
                            <input
                                id="post-title"
                                className={INPUT_CLASS}
                                placeholder="예: 24/25 FC 스트라이프 홈 유니폼 세트"
                                type="text"
                                maxLength={MAX_TITLE}
                                value={title}
                                disabled={busy}
                                data-field="title"
                                aria-invalid={Boolean(errors.title)}
                                aria-describedby={errors.title ? errorId('title') : undefined}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {errors.title && (
                                <p id={errorId('title')} className="text-caption text-error">
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        {/* BE 판매글에 종목 필드가 없어 비활성으로 둔다. */}
                        <div className="flex flex-col space-y-space-xs">
                            <label className="text-body-sm font-label-sm text-on-surface-variant" htmlFor="post-sport">
                                종목 (준비 중)
                            </label>
                            <select id="post-sport" className={INPUT_CLASS} disabled defaultValue="" title="준비 중인 기능입니다">
                                <option value="">종목 선택은 준비 중입니다</option>
                            </select>
                        </div>
                        <div className="flex flex-col space-y-space-xs">
                            <label className="text-body-sm font-label-sm text-on-surface flex justify-between" htmlFor="post-content">
                                <span>상세 설명</span>
                                <span className="text-caption text-on-surface-variant">
                                    {content.length} / {MAX_TEXT}
                                </span>
                            </label>
                            <textarea
                                id="post-content"
                                className="w-full p-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors resize-y disabled:opacity-60"
                                placeholder="판매글 소개, 배송·주문 안내 등을 입력하세요."
                                rows={5}
                                maxLength={MAX_TEXT}
                                value={content}
                                disabled={busy}
                                data-field="content"
                                aria-invalid={Boolean(errors.content)}
                                aria-describedby={errors.content ? errorId('content') : undefined}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            {errors.content && (
                                <p id={errorId('content')} className="text-caption text-error">
                                    {errors.content}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 상품 목록 */}
                {products.map((product, index) => (
                    <ProductFields
                        key={product.key}
                        index={index}
                        product={product}
                        errors={errors}
                        canRemove={products.length > 1}
                        totalRemaining={MAX_TOTAL_IMAGES - totalImages}
                        disabled={busy}
                        onChange={(patch) => updateProduct(product.key, patch)}
                        onRemove={() => setProducts((list) => list.filter((p) => p.key !== product.key))}
                    />
                ))}
                {(['imagesCount', 'imagesSize'] as const).map(
                    (key) =>
                        errors[key] && (
                            <p key={key} id={errorId(key)} tabIndex={-1} className="text-body-sm text-error">
                                {errors[key]}
                            </p>
                        ),
                )}
                <button
                    type="button"
                    className="w-full h-12 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant font-label-md hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-space-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={busy || products.length >= MAX_PRODUCTS}
                    onClick={() => setProducts((list) => [...list, emptyProduct()])}
                    data-testid="add-product"
                >
                    <Icon name="add" className="text-[18px]" />
                    {products.length >= MAX_PRODUCTS ? `상품은 ${MAX_PRODUCTS}개까지 등록할 수 있습니다` : '상품 추가 (예: 상의 · 하의를 따로 판매)'}
                </button>
            </div>

            {/* 요약 · 등록 */}
            <div className="space-y-space-xl">
                <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg lg:sticky lg:top-24">
                    <div className="border-b border-outline-variant/30 pb-space-md">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">등록 요약</h2>
                        <p className="text-body-sm text-on-surface-variant">등록하면 바로 판매 중으로 노출됩니다.</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-y-space-sm text-body-sm">
                        <dt className="text-on-surface-variant">상품</dt>
                        <dd className="text-right text-on-surface font-label-md">
                            {products.length} / {MAX_PRODUCTS}개
                        </dd>
                        <dt className="text-on-surface-variant">이미지</dt>
                        <dd className="text-right text-on-surface font-label-md">
                            {totalImages} / {MAX_TOTAL_IMAGES}장
                        </dd>
                        <dt className="text-on-surface-variant">판매가</dt>
                        <dd className="text-right text-on-surface font-label-md">
                            {prices.length === 0
                                ? '-'
                                : prices.length === 1 || Math.min(...prices) === Math.max(...prices)
                                  ? `${PRICE_FORMAT.format(prices[0])}원`
                                  : `${PRICE_FORMAT.format(Math.min(...prices))}원~`}
                        </dd>
                    </dl>

                    <div role="alert">
                        {showSummary && (
                            <div className="rounded-lg bg-error-container text-on-error-container p-space-md text-body-sm">
                                <p className="font-label-md mb-1">입력 내용을 확인해 주세요.</p>
                                <ul className="list-disc pl-5 space-y-0.5">
                                    {summary.slice(0, 4).map((message) => (
                                        <li key={message}>{message}</li>
                                    ))}
                                    {summary.length > 4 && <li>외 {summary.length - 4}건</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                    {mutation.isError && (
                        <div className="rounded-lg bg-error-container text-on-error-container p-space-md text-body-sm" role="alert" data-testid="submit-error">
                            {submitErrorMessage(mutation.error)}
                        </div>
                    )}
                    {mutation.isSuccess && (
                        <div className="rounded-lg bg-primary-fixed text-primary-container p-space-md text-body-sm" role="status">
                            판매글을 등록했습니다. 상품 화면으로 이동합니다.
                        </div>
                    )}

                    <div className="pt-space-md border-t border-outline-variant/30 flex flex-col gap-space-sm">
                        <button
                            className="w-full h-12 bg-primary text-on-primary rounded font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-space-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={busy || userLoading || !user?.id}
                            data-testid="submit-sales-post"
                        >
                            <Icon name={mutation.isPending ? 'progress_activity' : 'check'} className={`text-[18px] ${mutation.isPending ? 'animate-spin' : ''}`} />
                            {mutation.isPending ? '등록 중...' : userLoading ? '사용자 확인 중...' : '판매글 등록'}
                        </button>
                        {busy ? (
                            <button type="button" disabled className={`${CANCEL_CLASS} opacity-60 cursor-not-allowed`}>
                                취소
                            </button>
                        ) : (
                            <Link href={ROUTES.sellerProducts} className={`${CANCEL_CLASS} hover:bg-surface-container`}>
                                취소
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
