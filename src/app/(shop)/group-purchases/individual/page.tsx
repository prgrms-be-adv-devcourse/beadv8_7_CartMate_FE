import type { Metadata } from 'next';
import { Button } from '@astryxdesign/core/Button';
import Icon from '@/components/ui/Icon';
import MyList from './_components/MyList';
import { PageHeader } from './_components/parts';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '내 개인물품 공동구매 | TEAMBUY' };

export default function IndividualGroupPurchasesPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-8 sm:py-12">
            <PageHeader title="내가 만든 공동구매">
                <div className="flex items-center gap-space-sm">
                    <Button
                        label="공동물품 공동구매"
                        variant="secondary"
                        href={ROUTES.groupPurchases}
                    />
                    <Button
                        label="공동구매 만들기"
                        variant="primary"
                        href={ROUTES.groupPurchaseIndividualNew}
                        icon={<Icon name="add" className="text-[18px]" />}
                    />
                </div>
            </PageHeader>
            <MyList />
        </div>
    );
}
