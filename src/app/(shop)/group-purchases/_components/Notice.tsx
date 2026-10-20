import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

type NoticeProps = { message: string; href?: string; linkLabel?: string };

export default function Notice({ message, href = ROUTES.groupPurchases, linkLabel = '내 공동구매 목록으로' }: NoticeProps) {
    return (
        <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
            <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={href}>
                {linkLabel}
            </Link>
        </div>
    );
}
