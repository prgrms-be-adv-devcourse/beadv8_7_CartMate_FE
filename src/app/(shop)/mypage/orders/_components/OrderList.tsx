'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export type OrderType = 'group' | 'personal';

export type OrderRow = {
    id: string;
    date: string;
    orderNo: string;
    productName: string;
    option: string;
    type: OrderType;
    status: string;
    statusClassName: string;
    amount: string;
};

const TABS: { key: 'all' | OrderType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: 12 },
    { key: 'personal', label: '개인구매', count: 4 },
    { key: 'group', label: '공동구매', count: 8 },
];

const TYPE_BADGE: Record<OrderType, { label: string; className: string }> = {
    group: {
        label: '공동구매',
        className: 'inline-flex items-center px-2 py-0.5 rounded border border-outline text-caption font-bold bg-surface-container text-on-surface',
    },
    personal: {
        label: '개인구매',
        className: 'inline-flex items-center px-2 py-0.5 rounded border border-outline-variant text-caption bg-surface text-on-surface-variant',
    },
};

const TAB_ACTIVE = 'px-space-md py-2 bg-primary text-on-primary font-label-sm text-label-sm rounded transition-colors';
const TAB_INACTIVE =
    'px-space-md py-2 bg-surface text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-sm text-label-sm rounded transition-colors border border-outline-variant';

// 주문 내역: 구분 탭 + 검색 필터 + 주문 테이블
export default function OrderList({ orders }: { orders: OrderRow[] }) {
    const [tab, setTab] = useState<'all' | OrderType>('all');
    const visible = tab === 'all' ? orders : orders.filter((order) => order.type === tab);

    return (
        <>
            {/* Tabs & Filter Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-xs border-b md:border-b-0 border-outline-variant pb-space-sm md:pb-0">
                    {TABS.map((item) => (
                        <button
                            key={item.key}
                            className={tab === item.key ? TAB_ACTIVE : TAB_INACTIVE}
                            type="button"
                            onClick={() => setTab(item.key)}
                        >
                            {item.label} <span className="ml-1 opacity-75">{item.count}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-space-xs">
                    <select className="h-9 px-space-sm border border-outline-variant bg-surface-container-lowest font-body-sm text-on-surface outline-none rounded">
                        <option>최근 6개월</option>
                        <option>최근 1년</option>
                        <option>기간 직접 설정</option>
                    </select>
                    <div className="h-9 border border-outline-variant bg-surface-container-lowest flex items-center px-space-xs rounded">
                        <input
                            className="bg-transparent border-none outline-none font-body-sm text-on-surface w-36 px-1"
                            placeholder="상품명/주문번호 검색"
                            type="text"
                        />
                        <button className="text-outline hover:text-on-surface flex items-center" type="button" aria-label="검색">
                            <Icon name="search" className="text-[16px]" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container text-on-surface-variant font-caption text-caption uppercase">
                                <th className="p-space-md font-semibold">주문일 / 주문번호</th>
                                <th className="p-space-md font-semibold">대표 상품명 및 수량</th>
                                <th className="p-space-md font-semibold text-center">구분</th>
                                <th className="p-space-md font-semibold text-center">상태</th>
                                <th className="p-space-md font-semibold text-right">결제 금액</th>
                                <th className="p-space-md font-semibold text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-body-sm text-on-surface">
                            {visible.map((order) => (
                                <tr key={order.orderNo} className="hover:bg-surface-container/50 transition-colors">
                                    <td className="p-space-md align-top">
                                        <div className="font-bold text-on-surface">{order.date}</div>
                                        <div className="font-caption text-outline mt-0.5">{order.orderNo}</div>
                                    </td>
                                    <td className="p-space-md align-top">
                                        <div className="font-bold text-on-surface line-clamp-1">{order.productName}</div>
                                        <div className="font-caption text-on-surface-variant mt-0.5">{order.option}</div>
                                    </td>
                                    <td className="p-space-md align-top text-center">
                                        <span className={TYPE_BADGE[order.type].className}>{TYPE_BADGE[order.type].label}</span>
                                    </td>
                                    <td className="p-space-md align-top text-center">
                                        <span className={order.statusClassName}>{order.status}</span>
                                    </td>
                                    <td className="p-space-md align-top text-right font-bold font-headline-sm text-headline-sm">
                                        {order.amount}
                                    </td>
                                    <td className="p-space-md align-top text-center">
                                        <Link
                                            href={ROUTES.order(order.id)}
                                            className="h-8 px-3 border border-outline-variant bg-surface hover:bg-surface-container hover:border-primary font-label-sm text-label-sm rounded transition-colors inline-flex items-center justify-center"
                                        >
                                            상세보기
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Bar */}
                <div className="p-space-md border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                    <div className="font-caption text-caption text-outline">총 12건 중 1-4건 표시</div>
                    <div className="flex items-center gap-1">
                        <button
                            className="w-8 h-8 border border-outline-variant bg-surface rounded flex items-center justify-center font-caption text-outline disabled:opacity-40"
                            disabled
                            type="button"
                        >
                            &lt;
                        </button>
                        <button
                            className="w-8 h-8 border border-primary bg-primary text-on-primary rounded flex items-center justify-center font-label-sm text-label-sm"
                            type="button"
                        >
                            1
                        </button>
                        <button
                            className="w-8 h-8 border border-outline-variant bg-surface text-on-surface rounded flex items-center justify-center font-label-sm text-label-sm hover:bg-surface-container"
                            type="button"
                        >
                            2
                        </button>
                        <button
                            className="w-8 h-8 border border-outline-variant bg-surface text-on-surface rounded flex items-center justify-center font-label-sm text-label-sm hover:bg-surface-container"
                            type="button"
                        >
                            3
                        </button>
                        <button
                            className="w-8 h-8 border border-outline-variant bg-surface rounded flex items-center justify-center font-caption text-on-surface hover:bg-surface-container"
                            type="button"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
