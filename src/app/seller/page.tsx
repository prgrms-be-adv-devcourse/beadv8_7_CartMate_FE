import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: '판매자 대시보드 | TEAMBUY' };

const SUMMARY_CARDS = [
    { label: '배송 요청 건수', icon: 'local_shipping', value: '12', unit: '건', note: '전일 대비 동일', status: '진행률 100%' },
    { label: '교환·환불 대기 건수', icon: 'sync_alt', value: '3', unit: '건', note: '신규 접수 1건 포함', status: '조치 필요' },
    { label: '이번 정산 예정 금액', icon: 'payments', value: '2,450,000', unit: '원', note: '정산 예정일: 10월 25일', status: '확정 완료' },
];

const RECENT_ORDERS = [
    { id: 'ORD-20241024-001', product: '프로페셔널 축구공 세트 (20개입)', team: 'FC서울동호회 (20개)', amount: '650,000원', status: '배송준비중', done: false },
    { id: 'ORD-20241024-002', product: '드라이핏 팀 유니폼 상하의', team: '연세대 농구동아리 (15벌)', amount: '450,000원', status: '배송요청', done: false },
    { id: 'ORD-20241023-019', product: '카본 배드민턴 라켓 2p 패키지', team: '마포 셔틀콕 클럽 (8세트)', amount: '320,000원', status: '배송완료', done: true },
    { id: 'ORD-20241023-015', product: '프로 그립 농구공', team: '강남 스트리트볼 (5개)', amount: '175,000원', status: '배송완료', done: true },
];

const NOTICES = [
    { date: '2024.10.22', tag: '중요', important: true, title: '10월 정산 일정 변경 안내 (근로자의 날 관련)', desc: '상반기 정산 주기 조정에 따른 이번 달 지급일 사전 공지 확인 부탁드립니다.' },
    { date: '2024.10.18', tag: '일반', important: false, title: '공동구매 최소주문수량(MOQ) 정책 개정 사항', desc: '팀 빌딩 및 단체 주문 등록 시 적용되는 새로운 할인 티어 기준입니다.' },
    { date: '2024.10.10', tag: '일반', important: false, title: '택배사 연동 시스템 점검 안내', desc: '심야 시간대 송장 자동 입력 및 배송 추적 기능 일시 중단 안내.' },
];

export default function SellerDashboardPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-space-xl">
                <div>
                    <h1 className="text-headline-lg font-headline-lg text-on-surface">대시보드</h1>
                    <p className="text-body-md text-on-surface-variant mt-space-xs">스포츠 용품 공동구매 판매자 센터 실시간 현황 요약입니다.</p>
                </div>
                <div className="flex items-center gap-space-md">
                    <span className="text-caption text-on-surface-variant px-space-md py-space-sm bg-surface-container rounded-lg">기준일시: 2024년 10월 24일 14:00</span>
                    <button className="px-space-md py-space-sm bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-opacity flex items-center gap-space-xs">
                        <Icon name="refresh" className="text-[18px]" />
                        데이터 새로고침
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-space-lg mb-space-xl">
                {SUMMARY_CARDS.map((card) => (
                    <div key={card.label} className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between relative overflow-hidden group hover:border-outline transition-all">
                        <div className="flex items-center justify-between mb-space-md">
                            <span className="text-label-md text-on-surface-variant">{card.label}</span>
                            <Icon name={card.icon} className="text-on-surface-variant" />
                        </div>
                        <div className="flex items-baseline gap-space-sm">
                            <span className="text-display-xl font-display-xl text-on-surface">{card.value}</span>
                            <span className="text-body-sm text-on-surface-variant">{card.unit}</span>
                        </div>
                        <div className="mt-space-md pt-space-md border-t border-outline-variant/20 flex items-center justify-between text-caption text-on-surface-variant">
                            <span>{card.note}</span>
                            <span className="text-on-surface font-label-sm">{card.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-3 gap-space-lg">
                <div className="col-span-2 bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/40 flex flex-col">
                    <div className="flex items-center justify-between mb-space-lg">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">최근 주문 및 배송 현황</h2>
                        <Link className="text-label-sm text-on-surface underline hover:text-outline" href={ROUTES.sellerShipping}>전체보기</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant/30 text-caption text-on-surface-variant">
                                    <th className="py-space-sm px-space-md">주문번호</th>
                                    <th className="py-space-sm px-space-md">상품명</th>
                                    <th className="py-space-sm px-space-md">구매팀/수량</th>
                                    <th className="py-space-sm px-space-md">결제금액</th>
                                    <th className="py-space-sm px-space-md">상태</th>
                                </tr>
                            </thead>
                            <tbody className="text-body-md text-on-surface">
                                {RECENT_ORDERS.map((order) => (
                                    <tr key={order.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50">
                                        <td className="py-space-md px-space-md font-mono text-caption text-on-surface-variant">{order.id}</td>
                                        <td className="py-space-md px-space-md">{order.product}</td>
                                        <td className="py-space-md px-space-md">{order.team}</td>
                                        <td className="py-space-md px-space-md">{order.amount}</td>
                                        <td className="py-space-md px-space-md">
                                            <span className={`px-space-sm py-1 text-caption rounded-full ${order.done ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'}`}>{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="col-span-1 bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/40 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-space-lg">
                            <h2 className="text-headline-sm font-headline-sm text-on-surface">판매자 공지사항</h2>
                            <Link className="text-label-sm text-on-surface underline hover:text-outline" href={ROUTES.notices}>더보기</Link>
                        </div>
                        <div className="space-y-space-md">
                            {NOTICES.map((notice) => (
                                <div key={notice.title} className="p-space-md bg-surface-container-low/60 rounded-lg border border-outline-variant/20">
                                    <div className="flex items-center justify-between mb-space-xs">
                                        <span className="text-caption text-on-surface-variant">{notice.date}</span>
                                        <span className={notice.important ? 'text-caption font-label-sm text-on-surface' : 'text-caption text-on-surface-variant'}>{notice.tag}</span>
                                    </div>
                                    <p className="text-body-md font-headline-sm text-on-surface line-clamp-1">{notice.title}</p>
                                    <p className="text-body-sm text-on-surface-variant line-clamp-2 mt-1">{notice.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-space-lg pt-space-md border-t border-outline-variant/25 text-center">
                        <span className="text-caption text-on-surface-variant">
                            문제가 발생하셨나요?{' '}
                            <Link className="underline text-on-surface" href={ROUTES.inquiries}>판매자 고객센터</Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
