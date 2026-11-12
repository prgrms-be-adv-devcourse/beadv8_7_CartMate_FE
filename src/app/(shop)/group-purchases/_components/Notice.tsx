import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { ROUTES } from '@/lib/routes';

type NoticeProps = { message: string; href?: string; linkLabel?: string; onRetry?: () => void };

export default function Notice({ message, href = ROUTES.groupPurchases, linkLabel = '내 공동구매 목록으로', onRetry }: NoticeProps) {
    return (
        <EmptyState
            title={message}
            description="공동구매 목록으로 돌아가거나 다시 시도해 주세요."
            actions={<div className="flex flex-wrap items-center justify-center gap-space-sm">
                {onRetry && (
                    <Button label="다시 시도" variant="secondary" onClick={onRetry} />
                )}
                <Button label={linkLabel} href={href} as={Link} variant="primary" />
            </div>}
        />
    );
}
