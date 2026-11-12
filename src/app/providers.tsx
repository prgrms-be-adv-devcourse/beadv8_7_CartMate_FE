'use client';

import Link from 'next/link';
import { LinkProvider } from '@astryxdesign/core/Link';
import { Theme } from '@astryxdesign/core/theme';
import { teambuyTheme } from '@/theme/teambuy';
import QueryProvider from './query-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Theme theme={teambuyTheme}>
            <LinkProvider component={Link}>
                <QueryProvider>{children}</QueryProvider>
            </LinkProvider>
        </Theme>
    );
}
