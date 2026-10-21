import type { Metadata } from 'next';
import Link from 'next/link';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import DeliveryList from './_components/DeliveryList';

export const metadata: Metadata = {
    title: '배송 조회 | TEAMBUY',
};

export default function DeliveriesPage() {
    return (
        <div className="flex flex-col w-full bg-surface">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-xl border-b border-surface-container-highest">
                    <div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-outline uppercase tracking-wider mb-space-xs">
                            <span>MY PAGE</span>
                            <span>/</span>
                            <span>주문 관리</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">배송 조회</h1>
                    </div>
                    <div className="mt-space-md md:mt-0 flex items-center gap-space-sm font-body-sm text-on-surface-variant">
                        <span>판매자별로 나뉜 배송의 진행 상황을 확인하고 구매를 확정합니다.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    <div className="lg:col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                    </div>

                    <section className="lg:col-span-9 flex flex-col gap-space-md">
                        <div className="flex gap-space-sm">
                            <Link
                                className="px-space-md py-2 bg-surface text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm rounded transition-colors border border-outline-variant"
                                href={ROUTES.orders}
                            >
                                주문 내역
                            </Link>
                            <span className="px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded" aria-current="page">
                                배송 조회
                            </span>
                        </div>

                        <DeliveryList />

                        <div className="p-space-md bg-surface-container border border-outline-variant rounded flex items-start gap-space-md">
                            <Icon name="info" className="text-outline text-[20px] mt-0.5" />
                            <div className="font-body-sm text-on-surface-variant space-y-1">
                                <div className="font-bold text-on-surface">배송 · 구매 확정 안내</div>
                                <p>배송 요청 → 배송 준비(송장 등록) → 배송 중 → 배송 완료 순서로 진행됩니다.</p>
                                <p>배송 완료 후 구매를 확정하거나 교환 · 환불을 신청할 수 있습니다. 7일이 지나면 자동으로 구매 확정됩니다.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
