'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
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
        <div className="flex flex-col gap-3 pt-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                    label="장바구니 담기"
                    variant="secondary"
                    size="lg"
                    width="100%"
                    icon={<Icon name="shopping_cart" />}
                    isDisabled={!canBuy}
                    isLoading={addToCart.isPending}
                    onClick={handleAddToCart}
                />
                {onSale ? <Button label="공동구매 시작하기" href={ROUTES.groupPurchaseNew} as={Link} variant="primary" size="lg" width="100%" icon={<Icon name="group_add" />} /> : <Button label="공동구매 시작하기" variant="primary" size="lg" width="100%" icon={<Icon name="group_add" />} isDisabled tooltip="판매 중인 상품만 공동구매를 시작할 수 있습니다" />}
            </div>
            {addToCart.isSuccess && isCurrent && (
                <div className="flex items-center gap-2" role="status">
                    <Icon name="check_circle" className="text-[16px] text-primary" />
                    <Text type="supporting">장바구니에 담았습니다.</Text>
                    <Link className="underline underline-offset-2 hover:text-primary" href={ROUTES.cart}>
                        장바구니 보기
                    </Link>
                </div>
            )}
            {showError && (
                <p className="font-body-sm text-body-sm text-error" role="alert">
                    {errorMessage(addToCart.error, '장바구니에 담지 못했습니다.')}
                </p>
            )}
            {!onSale && <Text type="supporting" color="secondary">현재 판매하지 않는 상품은 구매할 수 없습니다.</Text>}
        </div>
    );
}
