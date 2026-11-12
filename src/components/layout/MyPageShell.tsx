import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import MyPageSidebar from '@/components/layout/MyPageSidebar';

type MyPageShellProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    children: ReactNode;
    headerActions?: ReactNode;
    showSidebar?: boolean;
};

export default function MyPageShell({
    eyebrow = 'MY PAGE',
    title,
    description,
    children,
    headerActions,
    showSidebar = true,
}: MyPageShellProps) {
    return (
        <div className="mx-auto w-full max-w-[1200px] px-gutter py-8 sm:py-12">
            <header className="mb-7 flex flex-col gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2">
                    <Text type="supporting" color="accent">{eyebrow}</Text>
                    <Heading level={1}>{title}</Heading>
                    {description ? <Text color="secondary">{description}</Text> : null}
                </div>
                {headerActions ? <div className="flex flex-wrap items-center gap-2">{headerActions}</div> : null}
            </header>

            <div className={showSidebar ? 'grid grid-cols-1 items-start gap-6 lg:grid-cols-12' : ''}>
                {showSidebar ? <MyPageSidebar /> : null}
                <section className={showSidebar ? 'min-w-0 lg:col-span-9' : 'min-w-0'}>{children}</section>
            </div>
        </div>
    );
}
