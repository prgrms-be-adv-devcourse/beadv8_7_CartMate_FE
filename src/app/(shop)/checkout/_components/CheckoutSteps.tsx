'use client';

import { Fragment } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetDetail } from '@/api/generated/order-controller/order-controller';

const STEPS = ['01 장바구니', '02 주문/결제', '03 주문완료'];

// 결제가 끝난 주문(?order=)이면 마지막 단계를 표시한다. 주문 조회는 OrderStatus와 같은 캐시를 쓴다.
export default function CheckoutSteps() {
    const orderId = Number(useSearchParams().get('order'));
    const valid = Number.isInteger(orderId) && orderId > 0;
    const order = useGetDetail(orderId, { query: { enabled: valid } });
    return <StepList current={valid && order.data?.data?.status === 'PAID' ? 2 : 1} />;
}

export function StepList({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-space-sm font-caption text-caption text-secondary">
            {STEPS.map((label, index) => (
                <Fragment key={label}>
                    {index > 0 && <span>&gt;</span>}
                    <span className={index === current ? 'text-primary font-bold' : 'text-outline'} aria-current={index === current ? 'step' : undefined}>
                        {label}
                    </span>
                </Fragment>
            ))}
        </div>
    );
}
