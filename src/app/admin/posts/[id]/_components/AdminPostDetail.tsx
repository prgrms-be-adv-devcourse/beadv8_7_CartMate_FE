'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetAdminSalesPostCountsQueryKey,
    getGetAdminSalesPostDetailQueryKey,
    getGetAdminSalesPostsQueryKey,
    useGetAdminSalesPostDetail,
    useResumeSalesPost,
    useSuspendSalesPost,
} from '@/api/generated/admin-sales-post-controller/admin-sales-post-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { statusOf, won } from '../../_components/postStatus';

const HIDE_REASONS = [
    '부적절한 상품 (체육시설/용품 규격 미달)',
    '허위 정보 표기 및 과장 광고',
    '가격 오류 및 부정 가격 책정',
    '지식재산권 및 상표권 침해',
    '기타 운영 정책 위반',
];

type Mode = 'suspend' | 'resume';

// 관리자 판매글 상세: 기본 정보, 상품, 숨김 이력, 숨김·해제
export default function AdminPostDetail({ postId }: { postId: number }) {
    const queryClient = useQueryClient();
    const query = useGetAdminSalesPostDetail(postId, { query: { staleTime: 0 } });
    const post = query.data?.data;

    const [reasonType, setReasonType] = useState(HIDE_REASONS[0]);
    const [memo, setMemo] = useState('');
    const [confirm, setConfirm] = useState<Mode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: getGetAdminSalesPostDetailQueryKey(postId) });
        void queryClient.invalidateQueries({ queryKey: getGetAdminSalesPostsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getGetAdminSalesPostCountsQueryKey() });
    };
    const onDone = () => {
        refresh();
        setConfirm(null);
        setMemo('');
        setError(null);
    };
    const onFail = (e: unknown) => setError(errorMessage(e, '처리 중 오류가 발생했습니다.'));

    const suspend = useSuspendSalesPost({ mutation: { onSuccess: onDone, onError: onFail } });
    const resume = useResumeSalesPost({ mutation: { onSuccess: onDone, onError: onFail } });
    const pending = suspend.isPending || resume.isPending;

    if (query.isPending) {
        return <div className="h-96 rounded bg-surface-container animate-pulse" aria-hidden />;
    }
    if (!post) {
        return (
            <div className="p-space-xl bg-surface-container-lowest border border-outline-variant rounded flex flex-col items-center gap-space-md">
                <p className="font-body-sm text-body-sm text-error">{errorMessage(query.error, '판매글을 불러오지 못했습니다.')}</p>
                <Link href={ROUTES.adminPosts} className="h-9 px-space-md border border-outline-variant rounded font-label-sm flex items-center">
                    목록으로
                </Link>
            </div>
        );
    }

    const s = statusOf(post.status);
    const suspended = post.status === 'SUSPENDED';
    const canSuspend = post.status === 'ON_SALE' || post.status === 'PAUSED';
    const reason = memo.trim() ? `${reasonType}: ${memo.trim()}` : reasonType;

    const submit = () => {
        setError(null);
        if (confirm === 'suspend') suspend.mutate({ postId, data: { reason } });
        if (confirm === 'resume') resume.mutate({ postId, data: { reason: memo.trim() || '관리자 검토 후 해제' } });
    };

    return (
        <div className="flex flex-col gap-space-lg">
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-space-md pb-space-md border-b border-outline-variant">
                <div className="flex flex-col gap-space-xs">
                    <Link href={ROUTES.adminPosts} className="font-label-sm text-label-sm text-outline hover:text-primary flex items-center gap-1">
                        <Icon name="arrow_back" className="text-[16px]" /> 판매글 관리
                    </Link>
                    <div className="flex items-center gap-space-sm">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">{post.title}</h1>
                        <span className={s.badge}>
                            <span className={s.dot} />
                            {s.label}
                        </span>
                    </div>
                    <div className="font-caption text-caption text-outline">
                        #{post.id} · {post.sellerName ?? `판매자 #${post.sellerId}`} · 등록 {formatDateTime(post.createdAt)} · 조회 {post.viewCount ?? 0}
                    </div>
                </div>
            </div>

            {suspended && (
                <div className="p-space-md rounded border border-error bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-space-sm">
                    <Icon name="visibility_off" className="text-[18px]" />
                    <div>
                        관리자 숨김 상태입니다. 사용자 목록·상세에 보이지 않고 구매할 수 없습니다.
                        {post.sanctions?.[0] && <div className="mt-1 font-semibold">사유: {post.sanctions[0].reason}</div>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-space-lg items-start">
                {/* 왼쪽: 상품·본문 */}
                <div className="col-span-8 flex flex-col gap-space-lg">
                    <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                        <h2 className="font-headline-sm text-headline-sm font-bold mb-space-md">상품 {post.products?.length ?? 0}개</h2>
                        <div className="flex flex-col divide-y divide-surface-container">
                            {(post.products ?? []).map((p) => (
                                <div key={p.id} className="py-space-sm flex items-center gap-space-md">
                                    {p.imageUrls?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={p.imageUrls[0]} alt="" className="w-16 h-16 object-cover rounded border border-outline-variant" />
                                    ) : (
                                        <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center">
                                            <Icon name="image" className="text-outline" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-label-md text-label-md text-on-surface">{p.name}</div>
                                        <div className="font-caption text-caption text-outline">상품 #{p.id} · 옵션 {p.optionCount ?? 0}개 · 이미지 {p.imageUrls?.length ?? 0}장</div>
                                    </div>
                                    <div className="font-label-md text-label-md">{won(p.basePrice)}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {post.content && (
                        <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                            <h2 className="font-headline-sm text-headline-sm font-bold mb-space-md">판매글 내용</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-wrap">{post.content}</p>
                        </section>
                    )}
                </div>

                {/* 오른쪽: 숨김 관리·이력 */}
                <div className="col-span-4 flex flex-col gap-space-lg">
                    <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                        <h2 className="font-headline-sm text-headline-sm font-bold">{suspended ? '숨김 해제' : '판매글 숨김'}</h2>

                        {suspended ? (
                            <>
                                <textarea
                                    className="w-full min-h-20 p-space-sm border border-outline-variant rounded font-body-sm text-body-sm outline-none focus:border-primary"
                                    placeholder="해제 사유 (선택)"
                                    maxLength={300}
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                                <p className="font-caption text-caption text-outline">해제해도 숨김 중 취소·환불된 주문은 되돌아오지 않습니다.</p>
                                <button
                                    type="button"
                                    className="h-10 bg-primary text-on-primary rounded font-label-md disabled:opacity-50"
                                    onClick={() => setConfirm('resume')}
                                    disabled={pending}
                                >
                                    숨김 해제
                                </button>
                            </>
                        ) : canSuspend ? (
                            <>
                                <select
                                    className="h-10 px-space-sm border border-outline-variant rounded font-body-sm text-body-sm bg-surface-container-lowest"
                                    value={reasonType}
                                    onChange={(e) => setReasonType(e.target.value)}
                                >
                                    {HIDE_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <textarea
                                    className="w-full min-h-20 p-space-sm border border-outline-variant rounded font-body-sm text-body-sm outline-none focus:border-primary"
                                    placeholder="상세 사유 (선택, 판매자에게 안내됩니다)"
                                    maxLength={300}
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                                <div className="p-space-sm rounded bg-surface-container font-caption text-caption text-on-surface-variant">
                                    숨기면 <strong>새 구매가 즉시 막히고</strong>, 발송 전 진행 중인 주문·공동구매는 <strong>자동 취소·환불</strong>됩니다.
                                </div>
                                <button
                                    type="button"
                                    className="h-10 bg-error text-on-error rounded font-label-md disabled:opacity-50"
                                    onClick={() => setConfirm('suspend')}
                                    disabled={pending}
                                >
                                    판매글 숨기기
                                </button>
                            </>
                        ) : (
                            <p className="font-body-sm text-body-sm text-outline">현재 상태({s.label})에서는 숨김·해제를 할 수 없습니다.</p>
                        )}

                        {error && <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p>}
                    </section>

                    <section className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg">
                        <h2 className="font-headline-sm text-headline-sm font-bold mb-space-md">처리 이력</h2>
                        {(post.sanctions ?? []).length === 0 ? (
                            <p className="font-body-sm text-body-sm text-outline">이력이 없습니다.</p>
                        ) : (
                            <ol className="flex flex-col gap-space-sm">
                                {(post.sanctions ?? []).map((h) => (
                                    <li key={h.id} className="border-l-2 pl-space-sm border-outline-variant">
                                        <div className="flex items-center gap-space-xs font-label-sm text-label-sm">
                                            <span className={h.action === 'SUSPEND' ? 'text-error font-semibold' : 'text-primary font-semibold'}>
                                                {h.action === 'SUSPEND' ? '숨김' : '해제'}
                                            </span>
                                            <span className="text-outline">관리자 #{h.adminId} · {formatDateTime(h.createdAt)}</span>
                                        </div>
                                        <div className="font-body-sm text-body-sm text-on-surface-variant">{h.reason}</div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                </div>
            </div>

            {/* 확인 모달 */}
            {confirm && (
                <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg w-[440px] p-space-xl shadow-xl flex flex-col gap-space-md">
                        <h3 className="font-headline-md text-headline-md font-bold">
                            {confirm === 'suspend' ? '판매글을 숨길까요?' : '숨김을 해제할까요?'}
                        </h3>
                        {confirm === 'suspend' ? (
                            <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-space-xs">
                                <p>· 사용자 목록·상세에서 사라지고 새 구매가 막힙니다.</p>
                                <p>· 결제 대기·결제 중인 주문과 공동구매는 취소되고, 이미 결제한 금액은 <strong>각자 낸 만큼</strong> 환불됩니다.</p>
                                <p>· 이미 발송된 주문은 그대로 진행됩니다.</p>
                                <p className="mt-space-xs p-space-sm rounded bg-surface-container">사유: {reason}</p>
                            </div>
                        ) : (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                판매 중으로 돌아갑니다. 숨김 중 취소된 주문은 복구되지 않습니다.
                            </p>
                        )}
                        <div className="flex justify-end gap-space-sm pt-space-sm">
                            <button
                                type="button"
                                className="h-10 px-space-md border border-outline-variant rounded font-label-md"
                                onClick={() => setConfirm(null)}
                                disabled={pending}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={`h-10 px-space-md rounded font-label-md disabled:opacity-50 ${
                                    confirm === 'suspend' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
                                }`}
                                onClick={submit}
                                disabled={pending}
                            >
                                {pending ? '처리 중…' : confirm === 'suspend' ? '숨기기' : '해제하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}