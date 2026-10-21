import type { Metadata } from 'next';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import OrderList from './_components/OrderList';

export const metadata: Metadata = {
    title: '주문 내역 조회 | TEAMBUY',
};

export default function OrdersPage() {
    return (
        <div className="flex flex-col w-full bg-surface">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl w-full">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-xl border-b border-surface-container-highest">
                    <div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-outline uppercase tracking-wider mb-space-xs">
                            <span>MY PAGE</span>
                            <span>/</span>
                            <span>주문 관리</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">주문 내역 조회</h1>
                    </div>
                    <div className="mt-space-md md:mt-0 flex items-center gap-space-sm font-body-sm text-on-surface-variant">
                        <span>개인 주문과 공동구매 주문을 함께 보여 드립니다.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    <div className="lg:col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                    </div>

                    <section className="lg:col-span-9 flex flex-col gap-space-md">
                        <OrderList />

                        <div className="p-space-md bg-surface-container border border-outline-variant rounded flex items-start gap-space-md">
                            <Icon name="info" className="text-outline text-[20px] mt-0.5" />
                            <div className="font-body-sm text-on-surface-variant space-y-1">
                                <div className="font-bold text-on-surface">주문 취소 안내</div>
                                <p>결제 대기 중인 주문은 주문 상세에서 바로 취소할 수 있습니다. 결제가 끝난 주문의 취소 · 환불은 준비 중입니다.</p>
                                <p>공동물품 공구 주문은 공동구매 주문 현황에서 결제와 취소를 진행합니다.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
