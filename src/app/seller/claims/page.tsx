import type { Metadata } from 'next';
import { Suspense } from 'react';
import Icon from '@/components/ui/Icon';
import ClaimList from './_components/ClaimList';
import ClaimStatusTabs from './_components/ClaimStatusTabs';

export const metadata: Metadata = { title: '교환·환불 관리 | TEAMBUY' };

export default function SellerClaimsPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto pb-space-xl">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-space-xl">
                <div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">교환·환불 관리</h1>
                    <p className="text-body-sm text-on-surface-variant mt-space-xs">고객이 신청한 교환 및 환불 요청을 확인하고 처리 상태를 관리합니다.</p>
                </div>
                <div className="flex items-center gap-space-md">
                    {/* 선택한 탭을 URL 쿼리스트링에서 읽는 부분은 클라이언트에서 렌더링되도록 Suspense로 감싼다 */}
                    <Suspense>
                        <ClaimStatusTabs />
                    </Suspense>
                </div>
            </div>
            {/* Filters & Search Toolbar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-space-md mb-space-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <span className="text-caption text-on-surface-variant font-label-sm">유형</span>
                        <select className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded px-space-md py-space-xs outline-none focus:border-primary">
                            <option>전체 유형</option>
                            <option>교환</option>
                            <option>환불</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <span className="text-caption text-on-surface-variant font-label-sm">기간</span>
                        <select className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded px-space-md py-space-xs outline-none focus:border-primary">
                            <option>최근 7일</option>
                            <option>최근 1개월</option>
                            <option>최근 3개월</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-space-sm">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]" />
                        <input className="bg-surface border border-outline-variant text-on-surface text-body-sm rounded pl-10 pr-space-md py-space-xs outline-none focus:border-primary w-64" placeholder="주문번호 또는 상품명 검색" type="text" />
                    </div>
                    <button className="bg-primary text-on-primary text-label-sm px-space-md py-space-xs rounded font-label-sm hover:opacity-90 transition-all">검색</button>
                </div>
            </div>
            {/* 탭(tab)과 페이지(page)를 URL 쿼리스트링에서 읽어 BE 의 판매자 교환·환불 목록을 조회한다 */}
            <Suspense>
                <ClaimList />
            </Suspense>
        </div>
    );
}
