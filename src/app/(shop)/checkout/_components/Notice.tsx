import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { ROUTES } from '@/lib/routes';

export default function Notice({ message }: { message: string }) {
    return (
        <EmptyState
            title={message}
            description="장바구니에서 주문할 상품을 다시 확인해 주세요."
            actions={<Button label="장바구니로 가기" href={ROUTES.cart} as={Link} variant="primary" />}
        />
    );
}
