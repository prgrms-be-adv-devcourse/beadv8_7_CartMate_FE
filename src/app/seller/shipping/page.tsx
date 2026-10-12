import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import ShippingStatusTabs from './_components/ShippingStatusTabs';

export const metadata: Metadata = { title: '배송 관리 | TEAMBUY' };

const COURIERS = ['CJ대한통운', '우체국택배', '롯데택배'];

const ORDERS = [
    { id: 'ORD-20241015-001', orderedAt: '2024-10-15 14:22', product: '프로 유니폼 매치 세트 (블랙/화이트)', option: '사이즈: L / 마킹: 7번 (PARK)', quantity: 15, receiver: '김철수 (팀대표)', phone: '010-1234-5678', address: '서울시 강남구 테헤란로 123', courier: 'CJ대한통운', invoice: '658219384910', action: '등록완료' },
    { id: 'ORD-20241015-004', orderedAt: '2024-10-15 11:05', product: '프로페셔널 축구공 (FIFA 공인구)', option: '옵션: 화이트/골드 (5호)', quantity: 10, receiver: '이영희', phone: '010-9876-5432', address: '부산시 해운대구 우동 456', courier: '우체국택배', invoice: '', action: '등록' },
    { id: 'ORD-20241014-012', orderedAt: '2024-10-14 18:40', product: '팀 트레이닝 짚업 피스 (네이비)', option: '사이즈: XL / 팀로고 자수 추가', quantity: 22, receiver: '박민수', phone: '010-5555-4444', address: '대구시 중구 중앙대로 789', courier: '롯데택배', invoice: '', action: '등록' },
    { id: 'ORD-20241014-008', orderedAt: '2024-10-14 15:12', product: '논슬립 스포츠 삭스 (화이트)', option: '사이즈: FREE (250-280mm)', quantity: 50, receiver: '정재훈', phone: '010-3333-2222', address: '인천시 연수구 송도동 321', courier: 'CJ대한통운', invoice: '', action: '등록' },
];

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
                    <ShippingStatusTabs />
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
            {/* Order List Table Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-space-xl">
                <div className="px-space-lg py-space-md border-b border-surface-variant flex items-center justify-between">
                    <div className="font-headline-sm text-on-surface flex items-center gap-space-sm">
                        <span>주문 목록</span>
                        <span className="text-caption bg-surface-container-high text-on-surface px-2 py-0.5 rounded-full">총 12건</span>
                    </div>
                    <div className="text-body-sm text-on-surface-variant">
                        선택된 항목 <span className="font-label-md text-on-surface">0건</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-surface-variant text-caption font-label-md text-on-surface-variant uppercase">
                                <th className="p-space-md w-10 text-center">
                                    <input className="rounded border-outline-variant" type="checkbox" />
                                </th>
                                <th className="p-space-md">주문번호 / 일시</th>
                                <th className="p-space-md">상품명 / 옵션</th>
                                <th className="p-space-md text-center">수량</th>
                                <th className="p-space-md">수령인 / 연락처</th>
                                <th className="p-space-md text-center">배송상태</th>
                                <th className="p-space-md">송장등록 입력</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-variant text-body-md text-on-surface">
                            {ORDERS.map((order) => (
                                <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="p-space-md text-center">
                                        <input className="rounded border-outline-variant" type="checkbox" />
                                    </td>
                                    <td className="p-space-md">
                                        <div className="font-label-md text-primary">{order.id}</div>
                                        <div className="text-caption text-on-surface-variant">{order.orderedAt}</div>
                                    </td>
                                    <td className="p-space-md">
                                        <div className="font-label-md">{order.product}</div>
                                        <div className="text-caption text-on-surface-variant">{order.option}</div>
                                    </td>
                                    <td className="p-space-md text-center font-label-md">{order.quantity}</td>
                                    <td className="p-space-md">
                                        <div className="font-label-md">{order.receiver}</div>
                                        <div className="text-caption text-on-surface-variant">
                                            {order.phone}
                                            <br />
                                            {order.address}
                                        </div>
                                    </td>
                                    <td className="p-space-md text-center">
                                        <span className="inline-block px-2.5 py-1 rounded-full text-caption bg-surface-container-high text-on-surface font-label-md">배송요청</span>
                                    </td>
                                    <td className="p-space-md">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <select className="w-28 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface" defaultValue={order.courier}>
                                                    <option>택배사 선택</option>
                                                    {COURIERS.map((courier) => (
                                                        <option key={courier}>{courier}</option>
                                                    ))}
                                                </select>
                                                <input className="flex-1 bg-surface border border-outline-variant rounded px-2 py-1 text-body-sm text-on-surface" placeholder="송장번호 입력" type="text" defaultValue={order.invoice} />
                                            </div>
                                            <div className="flex justify-end gap-1">
                                                <button className="bg-primary text-on-primary hover:opacity-90 px-3 py-1 rounded text-caption font-label-md">{order.action}</button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-space-md border-t border-surface-variant flex items-center justify-between">
                    <div className="text-body-sm text-on-surface-variant">1-4 of 12 items</div>
                    <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50" disabled>
                            <Icon name="chevron_left" className="text-[16px]" />
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center font-label-md">1</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low font-label-md">2</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low font-label-md">3</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low">
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
