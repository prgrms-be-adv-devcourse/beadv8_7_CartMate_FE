import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import MyGroupPurchaseList from './_components/MyGroupPurchaseList';

export const metadata: Metadata = {
    title: '내 공동구매 | TEAMBUY',
};

export default function GroupPurchasesPage() {
    return (
        <div className="bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-8 sm:py-12">
                <div className="flex flex-col w-full gap-space-lg">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-md border-b border-outline-variant">
                        <div>
                            <div className="flex items-center gap-space-xs font-caption text-caption text-outline mb-space-xs">
                                <Link className="hover:text-primary" href={ROUTES.home}>
                                    홈
                                </Link>
                                <span>/</span>
                                <span>팀 공동구매</span>
                            </div>
                            <Text type="supporting" color="accent">GROUP PURCHASE</Text>
                            <Heading level={1}>내 공동구매</Heading>
                            <Text as="p" type="supporting" color="secondary" className="mt-1">내가 만들었거나 초대받아 참여한 공동구매입니다.</Text>
                        </div>
                        <Button label="공동구매 만들기" className="self-start md:self-auto" href={ROUTES.groupPurchaseNew} variant="primary" icon={<Icon name="group_add" className="text-[18px]" />} />
                    </div>
                    <MyGroupPurchaseList />
                </div>
            </div>
        </div>
    );
}
