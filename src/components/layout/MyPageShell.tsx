import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';

type MyPageShellProps = {
    title: string;
    description?: string;
    children: ReactNode;
    headerActions?: ReactNode;
};

export default function MyPageShell({
    title,
    description,
    children,
    headerActions,
}: MyPageShellProps) {
    // 왼쪽 메뉴와 바깥 여백은 mypage/layout.tsx 가 그린다. 여기서는 오른쪽 내용 영역만 맡는다.
    return (
        <>
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2">
                    <Heading level={1}>{title}</Heading>
                    {description ? <Text color="secondary">{description}</Text> : null}
                </div>
                {headerActions ? <div className="flex flex-wrap items-center gap-2">{headerActions}</div> : null}
            </header>
            <section className="min-w-0">{children}</section>
        </>
    );
}
