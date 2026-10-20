'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useGetDetail1 } from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import type { SharedGroupPurchaseDetailResponse } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import { parseKst } from '@/lib/format';
import Notice from './Notice';

export type SharedDetailContext = {
    id: number;
    purchase: SharedGroupPurchaseDetailResponse;
    // 수정 마감까지 남은 시간(ms). 서버 시각 기준으로 보정한다.
    remainingMs: number | null;
    // 화면을 보는 동안 마감 시각이 지났는지. BE가 editable을 다시 내려주기 전에도 편집을 막는다.
    deadlinePassed: boolean;
    refreshing: boolean;
    refresh: () => void;
};

// 다른 참여자가 품목을 바꿀 수 있어 화면을 보는 동안 주기적으로 다시 받는다.
const REFRESH_MS = 30_000;

// 경로의 공동구매 id로 상세를 받아 로딩·403(비참여자)·404를 처리하고, 받은 상세만 children에 넘긴다.
export default function SharedDetailGate({ children, skeleton }: { children: (ctx: SharedDetailContext) => ReactNode; skeleton: ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const purchaseId = Number(id);
    const validId = Number.isInteger(purchaseId) && purchaseId > 0;
    const query = useGetDetail1(purchaseId, { query: { enabled: validId, refetchInterval: REFRESH_MS } });
    const purchase = query.data?.data;

    // 브라우저 시계가 틀려도 마감이 맞도록, 응답을 받은 순간(dataUpdatedAt = 수신 시점의 Date.now())의
    // 서버 시각과의 차이만큼 마감 시각을 브라우저 시계로 옮겨 둔다.
    const serverTime = parseKst(purchase?.serverTime)?.getTime();
    const deadline = parseKst(purchase?.editDeadlineAt)?.getTime();
    const offset = serverTime === undefined ? 0 : serverTime - query.dataUpdatedAt;
    const localDeadline = deadline === undefined ? null : deadline - offset;
    const now = useDeadlineClock(localDeadline);

    const status = query.error instanceof ApiError ? query.error.status : undefined;
    if (!validId || status === 404) return <Notice message="존재하지 않는 공동구매입니다." />;
    // 403은 참여자가 아닌 경우다(CART_SHARED_PARTICIPANT_ONLY_VIEW). 참여는 초대 링크로만 할 수 있다.
    if (status === 403) return <Notice message="참여한 사람만 볼 수 있는 공동구매입니다. 받은 초대 링크로 먼저 참여해주세요." />;
    if (query.isPending && validId) return skeleton;
    if (!purchase) {
        return <Notice message={errorMessage(query.error, '공동구매 정보를 불러오지 못했습니다.')} onRetry={() => void query.refetch()} />;
    }

    const remainingMs = localDeadline === null ? null : localDeadline - now;

    return (
        <>
            {/* 다시 받기에 실패하면 이전에 받은 내용을 그대로 보여 주므로, 최신이 아닐 수 있음을 알린다 */}
            {query.isRefetchError && (
                <div className="mb-space-md p-space-sm rounded bg-error-container/40 flex flex-wrap items-center gap-space-xs" role="status">
                    <span className="font-body-sm text-body-sm text-on-surface">
                        최신 정보를 불러오지 못해 이전 내용을 보여 주고 있습니다. ({errorMessage(query.error, '연결 오류')})
                    </span>
                    <button className="font-label-sm text-label-sm text-primary underline" type="button" onClick={() => void query.refetch()}>
                        다시 시도
                    </button>
                </div>
            )}
            {children({
                id: purchaseId,
                purchase,
                remainingMs,
                deadlinePassed: purchase.status === 'OPEN' && remainingMs !== null && remainingMs <= 0,
                refreshing: query.isFetching,
                refresh: () => void query.refetch(),
            })}
        </>
    );
}

// 남은 시간 표시용 현재 시각. 표시는 분 단위라 15초마다 갱신하고,
// 마감 시각에는 따로 맞춘 타이머로 한 번 더 갱신해 마감 순간 바로 편집을 막는다.
const MAX_TIMEOUT_MS = 2_147_483_647;

function useDeadlineClock(localDeadline: number | null) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 15_000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (localDeadline === null) return;
        // 이미 지났으면 바로(0ms) 갱신한다. 1ms를 더해 깨어났을 때 확실히 마감 뒤가 되게 한다.
        const wait = Math.min(Math.max(0, localDeadline - Date.now() + 1), MAX_TIMEOUT_MS);
        const timer = setTimeout(() => setNow(Date.now()), wait);
        return () => clearTimeout(timer);
    }, [localDeadline]);
    return now;
}
