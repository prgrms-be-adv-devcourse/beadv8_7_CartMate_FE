import Link from 'next/link';
import Icon from '@/components/ui/Icon';

type StatusSource = { status?: 'OPEN' | 'CLOSED'; open?: boolean };

// BE의 status는 마감 처리 여부만 담는다. 기한이 지나도 OPEN으로 남아 있어 open(판매 가능 여부)과 함께 본다.
export function saleState({ status, open }: StatusSource): 'selling' | 'expired' | 'closed' {
    if (status === 'CLOSED') return 'closed';
    return open ? 'selling' : 'expired';
}

const STATE_STYLE = {
    selling: { label: '판매 중', className: 'bg-primary text-on-primary' },
    expired: { label: '기한 지남', className: 'bg-surface-container-highest text-on-surface' },
    closed: { label: '마감', className: 'bg-surface-container text-outline' },
} as const;

export function StatusBadge(source: StatusSource) {
    const style = STATE_STYLE[saleState(source)];
    return <span className={`shrink-0 px-space-xs py-0.5 font-caption text-caption font-semibold ${style.className}`}>{style.label}</span>;
}

export function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="flex items-center gap-space-sm">
            <Icon name={icon} className="text-[20px] text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
        </div>
    );
}

type MessageBoxProps = { message: string; onRetry?: () => void; href?: string; linkLabel?: string };

// 에러·빈 상태 안내. 다시 시도 또는 이동 링크를 붙일 수 있다.
export function MessageBox({ message, onRetry, href, linkLabel }: MessageBoxProps) {
    return (
        <div className="border border-outline-variant bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center" role={onRetry ? 'alert' : undefined}>
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
            {onRetry && (
                <button
                    className="h-10 px-space-lg border border-outline-variant bg-surface-container-lowest font-label-md text-label-md hover:bg-surface-container"
                    type="button"
                    onClick={onRetry}
                >
                    다시 시도
                </button>
            )}
            {href && linkLabel && (
                <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={href}>
                    {linkLabel}
                </Link>
            )}
        </div>
    );
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-lg mb-space-xl border-b border-outline-variant">
            <div className="flex flex-col gap-0.5">
                <span className="font-caption text-caption uppercase text-outline tracking-wider">개인물품 공동구매</span>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">{title}</h1>
            </div>
            {children}
        </div>
    );
}
