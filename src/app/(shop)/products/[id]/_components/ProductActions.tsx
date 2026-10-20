'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey, useAddItem1 } from '@/api/generated/cart-controller/cart-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

type Props = {
    postId: number;
    productId: number | null;
    quantity: number;
    onSale: boolean;
};

const DISABLED_CLASS = 'disabled:cursor-not-allowed disabled:opacity-50';

// 상품 상세의 구매 버튼 영역.
// - 장바구니 담기: BE는 inventoryId 를 받지만 "상품 1개 = 재고 단위 1개"로 정해져 있어 상품 id 를 그대로 넣는다.
//   (BE 상품 조회 연동 전이라 실제 상품 id 는 BE에서 "존재하지 않는 상품 옵션"으로 거절된다)
// - 바로 구매: 주문서 연동(ORD-1) 전이라 비활성
export default function ProductActions({ postId, productId, quantity, onSale }: Props) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isLoggedIn } = useCurrentUser();
    const addToCart = useAddItem1({
        mutation: {
            // 헤더의 장바구니 개수 등이 바로 갱신되도록 장바구니 조회를 다시 불러온다.
            onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
        },
    });

    const canBuy = onSale && productId !== null;
    // 결과 메시지는 지금 고른 상품·수량으로 담았을 때만 보여 준다. (다른 상품을 고르면 이전 결과를 숨긴다)
    const sent = addToCart.variables?.data;
    const isCurrent = sent?.inventoryId === productId && sent?.quantity === quantity;
    // 401은 전역 만료 처리가 로그인 화면으로 보내므로 따로 표시하지 않는다.
    const showError = addToCart.isError && isCurrent && !(addToCart.error instanceof ApiError && addToCart.error.status === 401);

    const handleAddToCart = () => {
        if (productId === null) return;
        if (!isLoggedIn) {
            router.push(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.product(postId))}`);
            return;
        }
        addToCart.mutate({ data: { inventoryId: productId, quantity } });
    };

    return (
        <div className="flex flex-col gap-space-sm pt-space-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                <div className="flex gap-space-xs">
                    <button
                        className={`flex-1 h-11 border border-primary bg-surface-container-lowest text-primary hover:bg-surface-container-low font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors ${DISABLED_CLASS}`}
                        type="button"
                        disabled={!canBuy || addToCart.isPending}
                        onClick={handleAddToCart}
                    >
                        <Icon name="shopping_cart" className="text-[18px]" />
                        <span>{addToCart.isPending ? '담는 중...' : '장바구니 담기'}</span>
                    </button>
                    <button
                        className={`flex-1 h-11 border border-primary bg-surface-container-highest text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 font-bold ${DISABLED_CLASS}`}
                        type="button"
                        disabled
                        title="준비 중입니다"
                    >
                        바로 구매 (준비 중)
                    </button>
                </div>
                {onSale ? (
                    <Link
                        className="h-11 border-2 border-primary bg-primary text-on-primary hover:bg-inverse-surface font-label-md text-label-md flex items-center justify-center gap-1.5 font-bold transition-colors"
                        href={ROUTES.groupPurchaseNew}
                    >
                        <Icon name="group_add" className="text-[20px]" />
                        <span>+ 공동구매 시작하기 (팀 공구방 개설)</span>
                    </Link>
                ) : (
                    <button
                        className={`h-11 border-2 border-primary bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 font-bold ${DISABLED_CLASS}`}
                        type="button"
                        disabled
                        title="판매 중인 상품만 공동구매를 시작할 수 있습니다"
                    >
                        <Icon name="group_add" className="text-[20px]" />
                        <span>+ 공동구매 시작하기 (팀 공구방 개설)</span>
                    </button>
                )}
            </div>
            {addToCart.isSuccess && isCurrent && (
                <p className="font-body-sm text-body-sm text-on-surface flex items-center gap-space-xs" role="status">
                    <Icon name="check_circle" className="text-[16px] text-primary" />
                    장바구니에 담았습니다.
                    <Link className="underline underline-offset-2 hover:text-primary" href={ROUTES.cart}>
                        장바구니 보기
                    </Link>
                </p>
            )}
            {showError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {errorMessage(addToCart.error, '장바구니에 담지 못했습니다.')}
                </p>
            )}
            {!onSale && <p className="font-caption text-caption text-secondary">· 현재 판매하지 않는 상품은 구매할 수 없습니다.</p>}
        </div>
    );
}
