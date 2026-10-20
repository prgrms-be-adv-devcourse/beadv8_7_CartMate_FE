'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetDetail1QueryKey,
    getGetMyList1QueryKey,
    useGetDetail1,
    useJoin,
} from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import Notice from '../../../_components/Notice';
import { DetailSkeleton } from '../../../_components/SharedStatusParts';
import { hasErrorCode, INVITE_CODE_PATTERN } from '../../../_lib/sharedGroupPurchase';

const STEPS = [
    { icon: 'group_add', title: '참여 · 상품 담기', desc: '수정 마감 전까지 팀원 누구나 상품을 담고 수량을 바꿀 수 있습니다.' },
    { icon: 'lock_clock', title: '마감', desc: '만든 사람이 마감하거나 수정 기한이 지나면 자동으로 마감되어 공동 주문이 만들어집니다.' },
    { icon: 'account_balance_wallet', title: 'N빵 결제', desc: '총액을 참여 인원 수로 나눠 각자 예치금으로 결제합니다. 전원이 결제하면 주문이 확정됩니다.' },
];

// 초대 링크(/group-purchases/{id}/invite?code=) 진입 화면.
// 참여 API는 초대 코드만 받고, 참여 전에는 상세를 볼 수 없어(403) 공동구매 정보는 참여한 뒤에 보여 준다.
// 이미 참여 중이면(상세 조회 성공) 바로 상세로 보낸다. 비로그인 사용자는 proxy가 로그인 후 이 주소로 돌려보낸다.
export default function InviteJoinView() {
    const { id } = useParams<{ id: string }>();
    const code = useSearchParams().get('code') ?? '';
    const purchaseId = Number(id);
    const validId = Number.isInteger(purchaseId) && purchaseId > 0;
    const validCode = INVITE_CODE_PATTERN.test(code);

    if (!validCode) return <Notice message="유효하지 않은 초대 링크입니다. 받은 링크를 다시 확인해주세요." />;
    return <InviteGate purchaseId={validId ? purchaseId : null} code={code} />;
}

function InviteGate({ purchaseId, code }: { purchaseId: number | null; code: string }) {
    const router = useRouter();
    // 참여 여부 확인용. 다른 사람이 강퇴했을 수 있어 캐시를 쓰지 않는다.
    const detail = useGetDetail1(purchaseId ?? 0, { query: { enabled: purchaseId !== null, staleTime: 0, gcTime: 0 } });
    const alreadyJoined = detail.data?.data !== undefined;

    useEffect(() => {
        if (alreadyJoined && purchaseId !== null) router.replace(ROUTES.groupPurchase(purchaseId));
    }, [alreadyJoined, purchaseId, router]);

    if (purchaseId !== null && detail.isPending) return <DetailSkeleton />;
    if (alreadyJoined) return <Notice message="이미 참여 중인 공동구매입니다. 공동구매 화면으로 이동합니다." />;
    const status = detail.error instanceof ApiError ? detail.error.status : undefined;
    // 403(아직 참여 전)·404(경로의 id가 다름 — 참여는 코드로만 하므로 그대로 진행)가 아니면 조회 자체가 실패한 것이다.
    if (detail.isError && status !== 403 && status !== 404) {
        return <Notice message={errorMessage(detail.error, '초대 정보를 확인하지 못했습니다.')} onRetry={() => void detail.refetch()} />;
    }
    return <JoinCard code={code} />;
}

function JoinCard({ code }: { code: string }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const join = useJoin({
        mutation: {
            onSuccess: (res) => {
                const joined = res.data;
                void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() });
                if (joined?.id === undefined) {
                    router.replace(ROUTES.groupPurchases);
                    return;
                }
                // 참여 응답이 곧 상세라 그대로 넣어 두면 상세 화면에서 다시 받지 않는다.
                queryClient.setQueryData(getGetDetail1QueryKey(joined.id), res);
                router.replace(ROUTES.groupPurchase(joined.id));
            },
        },
    });
    const busy = join.isPending || join.isSuccess;

    return (
        <div className="flex flex-col gap-space-lg">
            <section className="bg-surface-container-lowest rounded-xl shadow-md p-space-xl relative overflow-hidden flex flex-col items-center text-center gap-space-md">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center shadow-sm">
                    <Icon name="mail" className="text-primary text-[40px]" />
                </div>
                <div className="flex flex-col gap-space-xs">
                    <span className="self-center font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-bold">
                        공동물품 (N빵) 공동구매 초대
                    </span>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공동구매에 초대되었습니다</h1>
                    <p className="font-body-md text-body-md text-secondary max-w-[560px]">
                        참여하면 팀원들과 함께 장바구니를 채우고, 마감 후 총액을 인원 수대로 나눠 결제합니다. 공동구매 내용은 참여한 뒤에 볼 수 있습니다.
                    </p>
                </div>
                {join.isError && (
                    <p className="w-full max-w-[480px] p-space-sm rounded bg-error-container text-on-error-container font-body-sm text-body-sm" role="alert">
                        {joinErrorMessage(join.error)}
                    </p>
                )}
                <button
                    className="w-full max-w-[360px] h-14 rounded bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs shadow-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                    disabled={busy}
                    onClick={() => join.mutate({ data: { inviteCode: code } })}
                >
                    <Icon name="group_add" className="text-[22px]" />
                    {busy ? '참여하는 중...' : '공동구매 참여하기'}
                </button>
                <p className="font-caption text-caption text-secondary">수정 마감 전까지는 언제든 나갈 수 있습니다.</p>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <h2 className="font-headline-sm text-headline-sm text-primary mb-space-md">진행 방법</h2>
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className="rounded-lg p-space-md bg-surface-container-low flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-secondary">{i + 1}단계</span>
                                <Icon name={step.icon} className="text-secondary text-[18px]" />
                            </div>
                            <h3 className="font-label-md text-label-md text-primary font-bold mt-1">{step.title}</h3>
                            <p className="font-body-sm text-body-sm text-secondary">{step.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}

function joinErrorMessage(error: unknown): string {
    if (hasErrorCode(error, 'CART_INVALID_INVITE_CODE') || (error instanceof ApiError && error.status === 400)) {
        return '유효하지 않은 초대 링크입니다. 받은 링크를 다시 확인해주세요.';
    }
    if (hasErrorCode(error, 'CART_SHARED_FULL')) return '참여 인원이 가득 찼습니다. 만든 사람에게 최대 인원을 늘려 달라고 요청해주세요.';
    if (hasErrorCode(error, 'CART_SHARED_EDIT_CLOSED')) return '수정 기간이 끝났거나 이미 마감·취소된 공동구매라 참여할 수 없습니다.';
    return errorMessage(error, '참여하지 못했습니다. 잠시 후 다시 시도해주세요.');
}
