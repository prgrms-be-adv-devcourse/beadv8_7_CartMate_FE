'use client';

import { useQueryClient } from '@tanstack/react-query';
import { getGetMyList3QueryKey } from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import {
    getGetDetail1QueryKey,
    getGetMyList1QueryKey,
    useCancel1,
    useClose,
    useDuplicate,
    useIncreaseMaxParticipants,
    useKick,
    useLeave,
} from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';

// 공동구매 참여자·상태 변경(나가기·강퇴·인원 증가·마감·취소·복제). BE는 대부분 결과 본문을 주지 않으므로
// 성공·실패 모두 상세와 내 목록을 다시 받는다. 실패도 다시 받는 이유는 수정 마감·이미 나간 참여자처럼
// 화면이 낡아서 생기는 실패가 대부분이기 때문이다.
export function useSharedPurchaseActions(id: number) {
    const queryClient = useQueryClient();
    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: getGetDetail1QueryKey(id) });
        void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() });
    };
    const mutation = { onSettled: refresh };

    return {
        // 나간 뒤에는 상세를 볼 수 없으므로(403) 목록만 다시 받는다. 상세 캐시는 화면이 목록으로 이동한 뒤
        // 호출하는 쪽에서 removeDetail로 지운다(떠 있는 상세 쿼리를 먼저 지우면 이동 전 화면이 잠깐 비어 보인다).
        leave: useLeave({
            mutation: {
                onSuccess: () => void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() }),
                onError: refresh,
            },
        }),
        removeDetail: () => queryClient.removeQueries({ queryKey: getGetDetail1QueryKey(id) }),
        kick: useKick({ mutation }),
        increaseMax: useIncreaseMaxParticipants({ mutation }),
        // 마감되면 BE가 같은 요청 안에서 공동 주문을 만든다. 내 공동 주문 목록도 함께 다시 받는다.
        close: useClose({
            mutation: {
                onSettled: () => {
                    refresh();
                    void queryClient.invalidateQueries({ queryKey: getGetMyList3QueryKey() });
                },
            },
        }),
        cancel: useCancel1({ mutation }),
        duplicate: useDuplicate({ mutation: { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() }) } }),
    };
}
