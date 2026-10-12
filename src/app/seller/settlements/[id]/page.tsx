import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';

export const metadata: Metadata = { title: '정산 상세 | TEAMBUY' };

const SUMMARY_CARDS = [
    { label: '총 판매 금액', icon: 'payments', value: '₩ 14,850,000', note: '전월 대비 +12.4%' },
    { label: '플랫폼 수수료 (5%)', icon: 'receipt_long', value: '₩ 742,500', note: '부가세 포함' },
];

const WEEKS = ['2024년 10월 4주차 (10.21 ~ 10.27)', '2024년 10월 3주차 (10.14 ~ 10.20)', '2024년 10월 2주차 (10.07 ~ 10.13)'];

const SALES = [
    { orderedAt: '2024-10-25 14:32:10', product: '[프로팀] 프리미엄 매쉬 축구 유니폼 상하세트 (L)', quantity: 30, paid: '₩ 4,500,000', settled: '₩ 4,275,000' },
    { orderedAt: '2024-10-24 11:15:42', product: '스타디움 구스다운 롱패딩 블랙 (XL)', quantity: 15, paid: '₩ 3,750,000', settled: '₩ 3,562,500' },
    { orderedAt: '2024-10-23 09:40:18', product: '프로 그립 축구 양말 화이트 (Free)', quantity: 100, paid: '₩ 1,600,000', settled: '₩ 1,520,000' },
    { orderedAt: '2024-10-22 16:55:03', product: '팀 트레이닝 집업 자켓 네이비 (M)', quantity: 25, paid: '₩ 5,000,000', settled: '₩ 4,750,000' },
];

export default function SellerSettlementDetailPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Top Summary Cards Section */}
            <div className="grid grid-cols-4 gap-gutter mb-space-xl">
                {SUMMARY_CARDS.map((card) => (
                    <div key={card.label} className="bg-surface-container-lowest p-space-lg rounded-lg border border-[#D1D5DB] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-space-md">
                            <span className="text-body-sm text-on-surface-variant">{card.label}</span>
                            <Icon name={card.icon} className="text-[#374151]" />
                        </div>
                        <div>
                            <div className="text-headline-lg font-headline-lg text-primary tracking-tight">{card.value}</div>
                            <div className="text-caption text-on-surface-variant mt-space-xs">{card.note}</div>
                        </div>
                    </div>
                ))}
                {/* Final Payout Amount */}
                <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-[#D1D5DB] flex flex-col justify-between bg-[#F9FAFB]">
                    <div className="flex items-center justify-between mb-space-md">
                        <span className="text-body-sm font-label-md text-primary">최종 지급액</span>
                        <Icon name="account_balance_wallet" className="text-[#111827]" />
                    </div>
                    <div>
                        <div className="text-headline-lg font-headline-lg text-primary tracking-tight">₩ 14,107,500</div>
                        <div className="text-caption text-[#111827] mt-space-xs font-label-sm">지급 예정일: 2024.11.10</div>
                    </div>
                </div>
                {/* Payout Account Info */}
                <div className="bg-surface-container-lowest p-space-lg rounded-lg border border-[#D1D5DB] flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-space-md">
                        <span className="text-body-sm text-on-surface-variant">지급 계좌 정보</span>
                        <Icon name="credit_card" className="text-[#374151]" />
                    </div>
                    <div>
                        <div className="text-headline-sm font-headline-sm text-primary">국민은행</div>
                        <div className="text-body-sm text-on-surface-variant mt-space-xs font-mono">123-456-78-901234</div>
                        <div className="text-caption text-[#6B7280] mt-0.5">예금주: (주)스포츠컴퍼니</div>
                    </div>
                </div>
            </div>
            {/* Period & Filter Bar */}
            <div className="bg-surface-container-lowest p-space-md rounded-lg border border-[#D1D5DB] mb-space-lg flex items-center justify-between">
                <div className="flex items-center gap-space-md">
                    <span className="text-label-md text-primary">정산 주차:</span>
                    <select className="h-[42px] px-3 border border-[#D1D5DB] rounded-[4px] bg-white text-body-md text-primary focus:outline-none focus:border-[#111827]">
                        {WEEKS.map((week) => (
                            <option key={week}>{week}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-space-sm">
                    <button className="h-[42px] px-4 border border-[#D1D5DB] bg-white text-primary text-label-md rounded-[4px] hover:bg-[#F9FAFB] transition-colors flex items-center gap-2">
                        <Icon name="download" className="text-[18px]" />
                        정산 내역서 다운로드 (Excel)
                    </button>
                </div>
            </div>
            {/* Settlement Table Section */}
            <div className="bg-surface-container-lowest rounded-lg border border-[#D1D5DB] overflow-hidden">
                <div className="px-space-lg py-space-md border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
                    <div>
                        <h2 className="text-headline-sm font-headline-sm text-primary">포함된 판매 건 목록</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">선택된 정산 기간 동안 완료된 총 4건의 거래 내역입니다.</p>
                    </div>
                    <div className="text-body-sm text-on-surface-variant">
                        총 건수: <span className="font-label-md text-primary">4건</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#E5E7EB] bg-[#F3F4F6] text-caption text-[#374151]">
                                <th className="py-3 px-6 font-label-md">주문일시</th>
                                <th className="py-3 px-6 font-label-md">상품명</th>
                                <th className="py-3 px-6 font-label-md text-center">수량</th>
                                <th className="py-3 px-6 font-label-md text-right">결제금액</th>
                                <th className="py-3 px-6 font-label-md text-right">정산금액 (수수료 제외)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB] text-body-md text-primary">
                            {SALES.map((sale) => (
                                <tr key={sale.orderedAt} className="hover:bg-[#F9FAFB] transition-colors">
                                    <td className="py-4 px-6 text-body-sm text-[#4B5563]">{sale.orderedAt}</td>
                                    <td className="py-4 px-6 font-medium">{sale.product}</td>
                                    <td className="py-4 px-6 text-center">{sale.quantity}</td>
                                    <td className="py-4 px-6 text-right font-mono">{sale.paid}</td>
                                    <td className="py-4 px-6 text-right font-mono font-medium text-primary">{sale.settled}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#F9FAFB] border-t border-[#D1D5DB] font-label-md text-primary">
                                <td className="py-4 px-6 text-right" colSpan={2}>합계</td>
                                <td className="py-4 px-6 text-center">170</td>
                                <td className="py-4 px-6 text-right font-mono">₩ 14,850,000</td>
                                <td className="py-4 px-6 text-right font-mono text-[#111827]">₩ 14,107,500</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* Pagination Footer */}
                <div className="px-space-lg py-space-md border-t border-[#E5E7EB] flex items-center justify-between bg-white">
                    <div className="text-body-sm text-on-surface-variant">Showing 1 to 4 of 4 entries</div>
                    <div className="flex items-center gap-1">
                        <button className="px-3 h-8 border border-[#D1D5DB] bg-white text-on-surface-variant text-caption rounded-[4px] disabled:opacity-50" disabled>Prev</button>
                        <button className="px-3 h-8 border border-[#111827] bg-[#111827] text-white text-caption rounded-[4px]">1</button>
                        <button className="px-3 h-8 border border-[#D1D5DB] bg-white text-on-surface-variant text-caption rounded-[4px] disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
