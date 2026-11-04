'use client';

import Link from 'next/link';
import { useGetMyList3 } from '@/api/generated/shared-group-order-controller/shared-group-order-controller';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

// 마감된 공동구매 상세에서 쓰는 "내 몫 결제하기" 버튼.
// 공동구매 ID만 알고 있으므로 내 공동 주문 목록에서 해당 공동구매의 주문을 찾아 결제 화면으로 보낸다.
export default function SharedPayLink({ sharedGroupPurchaseId, className = '' }: { sharedGroupPurchaseId: number; className?: string }) {
    const query = useGetMyList3();
    const order = query.data?.data?.find((o) => o.sharedGroupPurchaseId === sharedGroupPurchaseId);

    const base = `h-12 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-space-xs hover:opacity-90 ${className}`;

    if (query.isPending) {
        return <div className={`${base} opacity-50`} aria-hidden />;
    }
    // 마감 직후 공동 주문이 아직 만들어지지 않았거나 조회에 실패한 경우
    if (!order?.id) {
        return (
            <button className={`${base} opacity-50 cursor-not-allowed`} type="button" disabled>
                결제 정보를 준비하고 있습니다
            </button>
        );
    }

    const paid = order.myPaymentStatus === 'PAID';
    return (
        <Link className={base} href={ROUTES.checkoutShared(order.id)}>
            <Icon name="account_balance_wallet" className="text-[18px]" />
            {paid ? '결제 현황 보기' : '내 몫 결제하기'}
        </Link>
    );
}