import type { Metadata } from 'next';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import Icon from '@/components/ui/Icon';
import OrderList, { type OrderRow } from './_components/OrderList';

export const metadata: Metadata = {
    title: '주문 내역 조회 | TEAMBUY',
};

const ORDERS: OrderRow[] = [
    {
        id: 'ORD-20250324-0012',
        date: '2025.03.24',
        orderNo: 'ORD-20250324-0012',
        productName: '[FC서울 스타일] 프로 매치 유니폼 상하트 세트',
        option: '옵션: 블루/블랙, L (외 14건) + 로스터 인쇄 포함',
        type: 'group',
        status: '제작 대기중',
        statusClassName: 'inline-flex items-center px-2 py-0.5 rounded text-caption font-bold bg-primary text-on-primary',
        amount: '₩ 840,000',
    },
    {
        id: 'ORD-20250318-0094',
        date: '2025.03.18',
        orderNo: 'ORD-20250318-0094',
        productName: '나이키 매치 풋살공 스페셜 에디션',
        option: '옵션: 화이트/블랙 (수량: 5개)',
        type: 'personal',
        status: '배송완료',
        statusClassName:
            'inline-flex items-center px-2 py-0.5 rounded text-caption border border-outline text-on-surface bg-surface-container-highest font-bold',
        amount: '₩ 225,000',
    },
    {
        id: 'ORD-20250302-0041',
        date: '2025.03.02',
        orderNo: 'ORD-20250302-0041',
        productName: '[강남 타이거즈] 윈드브레이커 단체 팀복',
        option: '옵션: 블랙/그레이, 2XL (외 19건)',
        type: 'group',
        status: '배송중',
        statusClassName: 'inline-flex items-center px-2 py-0.5 rounded text-caption border border-outline text-outline bg-surface',
        amount: '₩ 1,450,000',
    },
    {
        id: 'ORD-20250215-0118',
        date: '2025.02.15',
        orderNo: 'ORD-20250215-0118',
        productName: '스타스포츠 프로 골키퍼 장갑 세트',
        option: '옵션: 네온그린, 10호 (수량: 2개)',
        type: 'personal',
        status: '구매확정',
        statusClassName: 'inline-flex items-center px-2 py-0.5 rounded text-caption border border-outline text-outline bg-surface',
        amount: '₩ 84,000',
    },
];

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
                        <span>최근 6개월간의 주문 내역입니다.</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    {/* Left: 마이페이지 메뉴 + 고객센터 안내 */}
                    <div className="lg:col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                        <div className="p-space-md bg-surface-container border border-outline-variant rounded">
                            <div className="font-caption text-caption text-outline mb-1">TEAMBUY SUPPORT</div>
                            <div className="font-body-sm font-bold text-on-surface mb-2">단체주문/커스텀 전용 고객센터</div>
                            <div className="font-headline-sm text-headline-sm text-primary font-bold mb-3">1644-0000</div>
                            <div className="font-caption text-caption text-on-surface-variant">평일 09:30 - 18:30</div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <section className="lg:col-span-9 flex flex-col gap-space-md">
                        <OrderList orders={ORDERS} />

                        {/* Information Notice Box */}
                        <div className="p-space-md bg-surface-container border border-outline-variant rounded flex items-start gap-space-md">
                            <Icon name="info" className="text-outline text-[20px] mt-0.5" />
                            <div className="font-body-sm text-on-surface-variant space-y-1">
                                <div className="font-bold text-on-surface">공동구매 주문 및 커스텀 인쇄 안내</div>
                                <p>
                                    공동구매 주문은 최소 수량(MOQ) 달성 후 일괄 제작에 착수합니다. 제작 대기 중 단계에서는 팀 로스터 수정 및 옵션 변경이 가능하며, 제작 시작
                                    이후에는 취소 및 변경이 제한됩니다.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
