import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import CreateGroupPurchaseForm from './_components/CreateGroupPurchaseForm';

export const metadata: Metadata = {
    title: '공동구매 만들기 | TEAMBUY',
};

export default function GroupPurchaseNewPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex flex-col gap-space-xs mb-space-lg">
                    <div className="flex items-center gap-space-xs text-secondary font-caption text-caption">
                        <Link className="hover:text-primary" href={ROUTES.home}>
                            홈
                        </Link>
                        <span>/</span>
                        <Link className="hover:text-primary" href={ROUTES.groupPurchases}>
                            팀 공동구매
                        </Link>
                        <span>/</span>
                        <span className="text-primary font-bold">공동구매 만들기</span>
                    </div>
                    <div className="mt-space-xs">
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공동물품 공동구매 만들기</h1>
                        <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                            팀원들과 하나의 장바구니에 상품을 함께 담고, 금액은 참여 인원 수로 나눠 결제합니다.
                        </p>
                    </div>
                </div>
                <CreateGroupPurchaseForm />
            </div>
        </div>
    );
}
