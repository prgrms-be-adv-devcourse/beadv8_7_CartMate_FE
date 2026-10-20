import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import MyGroupPurchaseList from './_components/MyGroupPurchaseList';

export const metadata: Metadata = {
    title: '내 공동구매 | TEAMBUY',
};

export default function GroupPurchasesPage() {
    return (
        <div className="bg-surface-container-lowest">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
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
                            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">내 공동구매</h1>
                            <p className="font-body-sm text-body-sm text-secondary mt-0.5">내가 만들었거나 초대받아 참여한 공동구매입니다.</p>
                        </div>
                        <Link
                            className="h-11 px-6 self-start md:self-auto bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2 hover:opacity-90"
                            href={ROUTES.groupPurchaseNew}
                        >
                            <Icon name="group_add" className="text-[18px]" />
                            공동구매 만들기
                        </Link>
                    </div>
                    <MyGroupPurchaseList />
                </div>
            </div>
        </div>
    );
}
