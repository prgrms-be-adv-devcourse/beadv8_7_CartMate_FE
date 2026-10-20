import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

type NoticeProps = { message: string; href?: string; linkLabel?: string; onRetry?: () => void };

export default function Notice({ message, href = ROUTES.groupPurchases, linkLabel = '내 공동구매 목록으로', onRetry }: NoticeProps) {
    return (
        <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
            <div className="flex flex-wrap items-center justify-center gap-space-sm">
                {onRetry && (
                    <button
                        className="h-10 px-space-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container"
                        type="button"
                        onClick={onRetry}
                    >
                        다시 시도
                    </button>
                )}
                <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={href}>
                    {linkLabel}
                </Link>
            </div>
        </div>
    );
}
