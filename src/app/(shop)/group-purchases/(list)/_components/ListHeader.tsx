'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const TAB = 'inline-flex items-center h-9 px-space-md font-label-sm text-label-sm rounded';
const TAB_ACTIVE = `${TAB} bg-primary text-on-primary`;
const TAB_INACTIVE = `${TAB} bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container`;

const TABS = [
    { label: '공동물품', href: ROUTES.groupPurchases, createHref: ROUTES.groupPurchaseNew },
    { label: '개인물품', href: ROUTES.groupPurchasesIndividual, createHref: ROUTES.groupPurchaseIndividualNew },
];

// 공동물품·개인물품 목록이 함께 쓰는 머리말. 탭을 옮겨도 이 부분은 그대로 두고 아래 목록만 바뀐다.
export default function ListHeader() {
    const pathname = usePathname();
    const current = TABS.find((tab) => tab.href === pathname) ?? TABS[0];

    return (
        <div className="flex flex-col gap-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div>
                    <Heading level={1}>내 공동구매</Heading>
                    <Text display="block" as="p" type="supporting" color="secondary" className="mt-1">
                        내가 만들었거나 초대받아 참여한 공동구매입니다.
                    </Text>
                </div>
                <Button
                    label="공동구매 만들기"
                    className="self-start md:self-auto"
                    href={current.createHref}
                    variant="primary"
                    icon={<Icon name="group_add" className="text-[18px]" />}
                />
            </div>
            <nav className="flex items-center gap-space-xs" aria-label="공동구매 종류">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={tab === current ? TAB_ACTIVE : TAB_INACTIVE}
                        aria-current={tab === current ? 'page' : undefined}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
