import type { Metadata } from 'next';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import ShippingList from './_components/ShippingList';
import ShippingStatusTabs from './_components/ShippingStatusTabs';

export const metadata: Metadata = { title: '배송 관리 | TEAMBUY' };

export default function SellerShippingPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Section / Title & Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-xl">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface">배송 관리</h1>
                    <p className="font-body-md text-on-surface-variant mt-space-xs">주문된 상품의 배송 상태를 확인하고 운송장 번호를 등록·관리합니다.</p>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-space-md py-space-sm rounded-lg font-label-md transition-all flex items-center gap-space-xs">
                        <Icon name="download" className="text-[18px]" />
                        배송 Excel 다운로드
                    </button>
                    <button className="bg-primary text-on-primary hover:opacity-90 px-space-md py-space-sm rounded-lg font-label-md transition-all flex items-center gap-space-xs">
                        <Icon name="local_shipping" className="text-[18px]" />
                        일괄 송장 등록
                    </button>
                </div>
            </div>
            {/* Status Tabs & Search Filter Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-xl flex flex-col gap-space-md">
                <div className="flex flex-wrap items-center justify-between gap-space-md border-b border-surface-variant pb-space-md">
                    {/* 선택한 상태를 URL 쿼리스트링에서 읽는 부분은 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense>
                        <ShippingStatusTabs />
                    </Suspense>
                    <div className="flex items-center gap-space-sm">
                        <span className="text-body-sm text-on-surface-variant">정렬:</span>
                        <select className="bg-surface border border-outline-variant rounded-lg px-space-sm py-1.5 text-body-sm text-on-surface focus:outline-none focus:border-primary">
                            <option>최신 주문순</option>
                            <option>수량 많은순</option>
                            <option>수령인 가나다순</option>
                        </select>
                    </div>
                </div>
                {/* Search Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md items-end">
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">검색 기간</label>
                        <div className="flex items-center gap-space-xs">
                            <input className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" type="date" defaultValue="2024-10-01" />
                            <span className="text-on-surface-variant">~</span>
                            <input className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" type="date" defaultValue="2024-10-15" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">검색어</label>
                        <div className="relative">
                            <input className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-space-sm py-2 text-body-sm text-on-surface" placeholder="주문번호, 상품명, 수령인 검색" type="text" />
                            <Icon name="search" className="absolute left-2.5 top-2.5 text-outline text-[18px]" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-body-sm text-on-surface-variant mb-space-xs">택배사 선택</label>
                        <select className="w-full bg-surface border border-outline-variant rounded-lg px-space-sm py-2 text-body-sm text-on-surface" defaultValue="">
                            <option value="">전체 택배사</option>
                            <option>CJ대한통운</option>
                            <option>우체국택배</option>
                            <option>롯데택배</option>
                            <option>한진택배</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button className="flex-1 bg-primary text-on-primary hover:opacity-90 py-2 rounded-lg font-label-md transition-all">검색</button>
                        <button className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest px-space-md py-2 rounded-lg font-label-md transition-all">초기화</button>
                    </div>
                </div>
            </div>
            {/* 상태(status)와 페이지(page)를 URL 쿼리스트링에서 읽어 BE 의 판매자 배송 목록을 조회한다 */}
            <Suspense>
                <ShippingList />
            </Suspense>
        </div>
    );
}
