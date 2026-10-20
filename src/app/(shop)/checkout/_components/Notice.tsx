import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function Notice({ message }: { message: string }) {
    return (
        <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
            <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={ROUTES.cart}>
                장바구니로 가기
            </Link>
        </div>
    );
}
