import type { Metadata } from 'next';
import Link from 'next/link';
import CreateForm from '../_components/CreateForm';
import { PageHeader } from '../_components/parts';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '개인물품 공동구매 만들기 | TEAMBUY' };

export default function NewIndividualGroupPurchasePage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <PageHeader title="공동구매 만들기">
                <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary" href={ROUTES.groupPurchasesIndividual}>
                    내가 만든 공동구매
                </Link>
            </PageHeader>
            <CreateForm />
        </div>
    );
}
