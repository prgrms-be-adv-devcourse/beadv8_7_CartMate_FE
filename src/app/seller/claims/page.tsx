import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import ClaimActions from './_components/ClaimActions';
import ClaimStatusTabs from './_components/ClaimStatusTabs';

export const metadata: Metadata = { title: '교환·환불 관리 | TEAMBUY' };

const CLAIMS = [
    { id: 'ORD-2024-0891', product: '프로페셔널 축구공 V2 (화이트/블랙)', type: '교환', reason: '사이즈가 너무 커서 한 치수 작은 것으로 교환 원합니다.', date: '2024-10-24', done: false },
    { id: 'ORD-2024-0885', product: '팀 트레이닝 저지 세트 (L)', type: '환불', reason: '상품 마감 불량으로 인한 환불 요청', date: '2024-10-23', done: false },
    { id: 'ORD-2024-0872', product: '농구화 프로 에디션 270', type: '교환', reason: '다른 색상으로 변경하고 싶습니다.', date: '2024-10-21', done: true },
    { id: 'ORD-2024-0860', product: '프리미엄 훈련용 콘 세트 (20개입)', type: '환불', reason: '단순 변심에 의한 환불', date: '2024-10-20', done: true },
    { id: 'ORD-2024-0854', product: '스포츠 테이프 록타이트 롤 (12개)', type: '교환', reason: '배송 도중 박스가 파손되어 상품 확인 요청', date: '2024-10-19', done: false },
];

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
                    <ClaimStatusTabs />
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
            {/* Requests Table */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container border-b border-outline-variant text-on-surface text-label-sm">
                            <th className="py-space-md px-space-lg">주문번호</th>
                            <th className="py-space-md px-space-lg">상품명</th>
                            <th className="py-space-md px-space-lg">요청 유형</th>
                            <th className="py-space-md px-space-lg">사유</th>
                            <th className="py-space-md px-space-lg">신청일</th>
                            <th className="py-space-md px-space-lg">상태</th>
                            <th className="py-space-md px-space-lg text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                        {CLAIMS.map((claim) => (
                            <tr key={claim.id} className="hover:bg-surface-container/50 transition-colors">
                                <td className="py-space-md px-space-lg font-label-sm text-primary">{claim.id}</td>
                                <td className="py-space-md px-space-lg font-body-md">{claim.product}</td>
                                <td className="py-space-md px-space-lg">
                                    <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-surface-container border border-outline-variant">{claim.type}</span>
                                </td>
                                <td className="py-space-md px-space-lg text-on-surface-variant">{claim.reason}</td>
                                <td className="py-space-md px-space-lg text-on-surface-variant">{claim.date}</td>
                                <td className="py-space-md px-space-lg">
                                    {claim.done ? (
                                        <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-surface-container-high text-on-surface-variant font-label-sm">완료</span>
                                    ) : (
                                        <span className="inline-flex items-center px-space-sm py-0.5 rounded-full text-caption bg-primary-fixed text-on-primary-fixed font-label-sm">처리 대기</span>
                                    )}
                                </td>
                                <td className="py-space-md px-space-lg text-right space-x-space-xs">
                                    {claim.done ? <span className="text-caption text-on-surface-variant">처리됨</span> : <ClaimActions />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="px-space-lg py-space-md bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
                    <span className="text-caption text-on-surface-variant">총 12개 중 1-5개 표시</span>
                    <div className="flex items-center gap-space-xs">
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-all" disabled>
                            &lt;
                        </button>
                        <button className="w-8 h-8 rounded bg-primary text-on-primary flex items-center justify-center text-label-sm font-label-sm">1</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container text-label-sm">2</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container text-label-sm">3</button>
                        <button className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container transition-all">&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
