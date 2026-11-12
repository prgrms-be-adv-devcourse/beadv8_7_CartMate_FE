import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';

type StatusSource = { status?: 'OPEN' | 'CLOSED'; open?: boolean };

// BE의 status는 마감 처리 여부만 담는다. 기한이 지나도 OPEN으로 남아 있어 open(판매 가능 여부)과 함께 본다.
export function saleState({ status, open }: StatusSource): 'selling' | 'expired' | 'closed' {
    if (status === 'CLOSED') return 'closed';
    return open ? 'selling' : 'expired';
}

const STATE_STYLE = {
    selling: { label: '판매 중', variant: 'success' },
    expired: { label: '기한 지남', variant: 'warning' },
    closed: { label: '마감', variant: 'neutral' },
} as const;

export function StatusBadge(source: StatusSource) {
    const style = STATE_STYLE[saleState(source)];
    return <Badge label={style.label} variant={style.variant} />;
}

export function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="flex items-center gap-space-sm">
            <Icon name={icon} className="text-[20px] text-primary" />
            <Heading level={2}>{title}</Heading>
        </div>
    );
}

type MessageBoxProps = { message: string; onRetry?: () => void; href?: string; linkLabel?: string };

// 에러·빈 상태 안내. 다시 시도 또는 이동 링크를 붙일 수 있다.
export function MessageBox({ message, onRetry, href, linkLabel }: MessageBoxProps) {
    return (
        <EmptyState
            title={message}
            icon={<Icon name={onRetry ? 'error' : 'inventory_2'} className="text-[36px]" />}
            actions={
                <div className="flex flex-wrap justify-center gap-space-sm">
                    {onRetry && <Button label="다시 시도" variant="secondary" onClick={onRetry} />}
                    {href && linkLabel && <Button label={linkLabel} href={href} as={Link} variant="primary" />}
                </div>
            }
        />
    );
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-lg mb-space-xl border-b border-outline-variant">
            <div className="flex flex-col gap-0.5">
                <Text type="supporting" color="accent">INDIVIDUAL GROUP PURCHASE</Text>
                <Heading level={1}>{title}</Heading>
            </div>
            {children}
        </div>
    );
}
