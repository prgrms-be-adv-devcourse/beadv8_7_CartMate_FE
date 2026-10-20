'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
    getGetDetail1QueryKey,
    getGetMyList1QueryKey,
    useAddItem,
    useChangeItemQuantity,
    useRemoveItem1,
} from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';

// 공동물품 품목 담기·수량 변경·빼기. BE는 결과 본문을 주지 않으므로 성공·실패 모두 상세를 다시 받는다.
// 실패도 다시 받는 이유: 수정 마감(CART_SHARED_EDIT_CLOSED)·다른 참여자가 먼저 뺀 품목(CART_SHARED_ITEM_NOT_FOUND)처럼
// 화면이 낡아서 생기는 실패가 대부분이기 때문이다.
export function useSharedItemMutations(id: number) {
    const queryClient = useQueryClient();
    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: getGetDetail1QueryKey(id) });
        // 목록 카드에는 금액·품목이 없지만 상태(마감 등)가 바뀌었을 수 있다.
        void queryClient.invalidateQueries({ queryKey: getGetMyList1QueryKey() });
    };
    const mutation = { onSettled: refresh };

    return {
        add: useAddItem({ mutation }),
        changeQuantity: useChangeItemQuantity({ mutation }),
        remove: useRemoveItem1({ mutation }),
    };
}
