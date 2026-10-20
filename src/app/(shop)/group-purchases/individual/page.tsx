import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyList from './_components/MyList';
import { PageHeader } from './_components/parts';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '내 개인물품 공동구매 | TEAMBUY' };

export default function IndividualGroupPurchasesPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <PageHeader title="내가 만든 공동구매">
                <div className="flex items-center gap-space-sm">
                    <Link
                        className="h-10 px-space-md border border-outline-variant font-label-md text-label-md flex items-center gap-1 hover:bg-surface-container"
                        href={ROUTES.groupPurchases}
                    >
                        공동물품 공동구매
                    </Link>
                    <Link
                        className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1 hover:opacity-90"
                        href={ROUTES.groupPurchaseIndividualNew}
                    >
                        <Icon name="add" className="text-[18px]" />
                        공동구매 만들기
                    </Link>
                </div>
            </PageHeader>
            <MyList />
        </div>
    );
}
