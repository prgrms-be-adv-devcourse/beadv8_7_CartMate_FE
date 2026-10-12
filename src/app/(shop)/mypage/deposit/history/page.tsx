import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import HistoryFilter from './_components/HistoryFilter';

export const metadata: Metadata = {
    title: '예치금 거래 내역 | TEAMBUY',
};

const SUMMARY = [
    {
        label: '조회 기간 총 충전',
        markerClassName: 'bg-primary',
        caption: null,
        value: '+200,000원',
        valueClassName: 'text-primary',
        boxClassName: 'border-b md:border-b-0 md:border-r border-outline-variant pb-space-sm md:pb-0',
    },
    {
        label: '총 결제 (정산 차감)',
        markerClassName: 'bg-outline',
        caption: null,
        value: '-145,000원',
        valueClassName: 'text-on-surface',
        boxClassName: 'border-b md:border-b-0 md:border-r border-outline-variant pb-space-sm md:pb-0',
    },
    {
        label: '동결 중 (공구 보류액)',
        markerClassName: 'border border-primary',
        caption: '참여 완료 공구 정산 대기',
        value: '33,000원',
        valueClassName: 'text-primary',
        boxClassName: '',
    },
];

const TRANSACTIONS = [
    {
        id: 'GP-8831',
        date: '2024.11.24',
        time: '14:20:18',
        type: '동결',
        highlight: true,
        title: '공동구매 참여 [FC 에이스 2024 어웨이 유니폼]',
        meta: ['주문번호: #GP-8831', 'MOQ 달성 대기 인원: 22/30'],
        amount: '-33,000원',
        amountBold: false,
        amountNote: '(보류 동결)',
        balance: '152,000원',
        total: '(총 185,000원)',
        action: '상세보기',
    },
    {
        id: 'CHG-20241120-911',
        date: '2024.11.20',
        time: '10:15:02',
        type: '충전',
        highlight: false,
        title: '간편 계좌 충전 (신한은행)',
        meta: ['승인번호: #CHG-20241120-911', '수수료: 0원'],
        amount: '+100,000원',
        amountBold: true,
        amountNote: '(일반 입금)',
        balance: '185,000원',
        total: '(총 185,000원)',
        action: '영수증',
    },
    {
        id: 'OD-1029',
        date: '2024.11.15',
        time: '19:30:44',
        type: '결제',
        highlight: false,
        title: '일반 개인 구매 [매치코어 팀 저지 외 1건]',
        meta: ['주문번호: #OD-1029', '택배배송 접수완료'],
        amount: '-47,000원',
        amountBold: false,
        amountNote: '(즉시 출금)',
        balance: '85,000원',
        total: '(총 85,000원)',
        action: '영수증',
    },
    {
        id: 'GP-8712',
        date: '2024.11.10',
        time: '11:00:15',
        type: '동결 해제',
        highlight: false,
        title: '공동구매 기한만료 취소에 따른 동결 해제 [매치볼 공구]',
        meta: ['원주문번호: #GP-8712', 'MOQ 미달 자동 취소'],
        amount: '+35,000원',
        amountBold: true,
        amountNote: '(해제 환원)',
        balance: '132,000원',
        total: '(총 132,000원)',
        action: '상세보기',
    },
    {
        id: 'GP-8650',
        date: '2024.11.05',
        time: '16:45:22',
        type: '결제',
        highlight: false,
        title: '공동구매 전원 결제 확정에 따른 최종 차감 [트레이닝복 세트]',
        meta: ['주문번호: #GP-8650', '제작 발주 전환 완료'],
        amount: '-55,000원',
        amountBold: false,
        amountNote: '(확정 차감)',
        balance: '97,000원',
        total: '(총 97,000원)',
        action: '영수증',
    },
    {
        id: 'WDR-20241101-084',
        date: '2024.11.01',
        time: '09:00:51',
        type: '환불',
        highlight: false,
        title: '본인 계좌 출금 환불 (신한은행)',
        meta: ['이체접수번호: #WDR-20241101-084', '계좌: 110-***-910283'],
        amount: '-50,000원',
        amountBold: false,
        amountNote: '(출금 완료)',
        balance: '152,000원',
        total: '(총 152,000원)',
        action: '이체확인',
    },
];

const PAGES = [1, 2, 3, 4, 5];

const GUIDELINES = [
    { term: '동결 (보류):', text: '공동구매 참여 신청 시 목표 수량(MOQ) 도달 전까지 상품 금액이 가용 잔액에서 일시 동결됩니다.' },
    { term: '동결 해제:', text: '모집 기한 내 최소 주문 수량 미달 또는 참여 취소 처리 시 즉시 가용 잔액으로 환원됩니다.' },
    { term: '결제 (확정 차감):', text: '공동구매 확정 및 제작 착수 시점 또는 일반 단품 주문 완료 시 최종 정산 차감됩니다.' },
    { term: '환불:', text: '등록된 팀 전용 환불 계좌(신한은행)로 영업일 기준 익일 내 실시간 이체 환급됩니다.' },
];

export default function DepositHistoryPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* Screen Navigation Breadcrumb & Wireframe Metadata Header */}
                <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-outline-variant">
                    <div className="flex items-center gap-space-sm font-caption text-caption text-on-surface-variant">
                        <Link className="hover:text-on-surface" href={ROUTES.myPage}>
                            마이페이지
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <Link className="hover:text-on-surface" href={ROUTES.deposit}>
                            팀 예치금 관리
                        </Link>
                        <Icon name="chevron_right" className="text-[14px]" />
                        <span className="text-on-surface font-semibold">거래 내역</span>
                    </div>
                    <div className="font-caption text-caption px-space-xs py-0.5 bg-surface-container border border-outline-variant text-on-surface-variant">
                        VIEWPORT: DESKTOP · REF: WF-TRX-004
                    </div>
                </div>

                {/* Primary Header & Section Indicator */}
                <div className="flex items-end justify-between mb-space-xl">
                    <div>
                        <div className="font-caption text-caption uppercase tracking-wider text-outline mb-space-xs">[ESCROW LEDGER ARCHIVE]</div>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">예치금 거래 내역</h1>
                    </div>
                    <div className="flex items-center gap-space-sm font-caption text-caption text-on-surface-variant bg-surface-container px-space-md py-space-xs border border-outline-variant">
                        <Icon name="sync" className="text-[16px]" />
                        <span>실시간 정산 기준 (최근 갱신: 2024-11-25 18:00)</span>
                    </div>
                </div>

                {/* 1. Transaction Type Filter & Date Range Filter Section */}
                <HistoryFilter />

                {/* 2. Transaction Summary Metric Bar */}
                <div className="bg-surface-container border border-outline-variant p-space-md mb-space-lg grid grid-cols-12 gap-space-md items-center">
                    {SUMMARY.map((item) => (
                        <div key={item.label} className={`col-span-12 md:col-span-4 flex items-center justify-between px-space-md ${item.boxClassName}`}>
                            {item.caption ? (
                                <div className="flex flex-col">
                                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                                        <span className={`w-2 h-2 inline-block ${item.markerClassName}`} />
                                        {item.label}
                                    </span>
                                    <span className="font-caption text-caption text-outline">{item.caption}</span>
                                </div>
                            ) : (
                                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                                    <span className={`w-2 h-2 inline-block ${item.markerClassName}`} />
                                    {item.label}
                                </span>
                            )}
                            <span className={`font-headline-sm text-headline-sm font-bold ${item.valueClassName}`}>{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Table Utility Bar (Count & Export) */}
                <div className="flex items-center justify-between pb-space-sm mb-space-xs">
                    <div className="font-body-sm text-body-sm text-on-surface">
                        총 <span className="font-bold text-primary">{TRANSACTIONS.length}</span>건의 거래 내역
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button
                            className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface flex items-center gap-1 hover:border-primary"
                            type="button"
                        >
                            <Icon name="file_download" className="text-[16px]" />
                            엑셀 다운로드 (.CSV)
                        </button>
                        <select className="h-8 px-space-xs bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface outline-none">
                            <option>20개씩 보기</option>
                            <option>50개씩 보기</option>
                            <option>100개씩 보기</option>
                        </select>
                    </div>
                </div>

                {/* 3. Complete Data Table Structure */}
                <div className="w-full bg-surface-container-lowest border border-outline-variant overflow-x-auto">
                    <table className="w-full border-collapse text-left font-body-sm text-body-sm">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                                <th className="py-space-md px-space-md w-36 whitespace-nowrap">일시</th>
                                <th className="py-space-md px-space-sm w-28 text-center whitespace-nowrap">거래 유형</th>
                                <th className="py-space-md px-space-md">거래 내용 / 주문 번호</th>
                                <th className="py-space-md px-space-md w-44 text-right whitespace-nowrap">거래 금액</th>
                                <th className="py-space-md px-space-md w-48 text-right whitespace-nowrap">거래 후 잔액 (가용/총액)</th>
                                <th className="py-space-md px-space-md w-28 text-center whitespace-nowrap">영수증 / 증빙</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                            {TRANSACTIONS.map((tx) => (
                                <tr key={tx.id} className="hover:bg-surface-container-low transition-colors">
                                    <td className="py-space-md px-space-md text-on-surface-variant font-caption text-caption whitespace-nowrap">
                                        <div>{tx.date}</div>
                                        <div className="text-outline">{tx.time}</div>
                                    </td>
                                    <td className="py-space-md px-space-sm text-center">
                                        <span
                                            className={`inline-block px-2 py-0.5 border font-caption text-caption font-semibold ${
                                                tx.highlight
                                                    ? 'border-primary bg-primary text-on-primary'
                                                    : 'border-outline-variant bg-surface-container text-on-surface'
                                            }`}
                                        >
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="py-space-md px-space-md">
                                        <div className="font-label-md text-label-md text-on-surface">{tx.title}</div>
                                        <div className="font-caption text-caption text-outline flex items-center gap-space-xs mt-0.5">
                                            <span>{tx.meta[0]}</span>
                                            <span>·</span>
                                            <span>{tx.meta[1]}</span>
                                        </div>
                                    </td>
                                    <td className="py-space-md px-space-md text-right font-label-md text-label-md text-primary whitespace-nowrap">
                                        <div className={tx.amountBold ? 'font-bold' : undefined}>{tx.amount}</div>
                                        <div className="font-caption text-caption text-outline">{tx.amountNote}</div>
                                    </td>
                                    <td className="py-space-md px-space-md text-right whitespace-nowrap">
                                        <div className="font-label-md text-label-md text-primary font-bold">{tx.balance}</div>
                                        <div className="font-caption text-caption text-outline">{tx.total}</div>
                                    </td>
                                    <td className="py-space-md px-space-md text-center whitespace-nowrap">
                                        <button
                                            className="h-7 px-space-sm bg-surface-container-lowest border border-outline-variant font-caption text-caption text-on-surface hover:border-primary"
                                            type="button"
                                        >
                                            {tx.action}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Pagination Navigation Bar */}
                <div className="flex items-center justify-between pt-space-lg mt-space-md">
                    <div className="font-caption text-caption text-outline">표시 중: 1 - 6 (총 6 항목)</div>
                    <div className="flex items-center gap-1">
                        <button
                            className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant text-outline font-label-sm text-label-sm cursor-not-allowed flex items-center gap-0.5"
                            disabled
                            type="button"
                        >
                            <Icon name="chevron_left" className="text-[16px]" />
                            이전
                        </button>
                        {PAGES.map((page) => (
                            <button
                                key={page}
                                className={
                                    page === 1
                                        ? 'w-8 h-8 bg-primary text-on-primary border border-primary font-label-sm text-label-sm flex items-center justify-center'
                                        : 'w-8 h-8 bg-surface-container-lowest text-on-surface border border-outline-variant font-label-sm text-label-sm hover:border-primary flex items-center justify-center'
                                }
                                type="button"
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm hover:border-primary flex items-center gap-0.5"
                            type="button"
                        >
                            다음
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </div>
                    <div className="w-24" />
                </div>

                {/* Escrow Term & System Guidelines */}
                <div className="mt-space-xl p-space-md bg-surface-container border border-outline-variant">
                    <div className="font-label-sm text-label-sm text-on-surface font-bold mb-space-xs flex items-center gap-1">
                        <Icon name="info" className="text-[16px]" />
                        [시스템 안내] 예치금 및 거래 유형 규정
                    </div>
                    <ul className="font-caption text-caption text-on-surface-variant space-y-1 list-disc list-inside">
                        {GUIDELINES.map((item) => (
                            <li key={item.term}>
                                <strong>{item.term}</strong> {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
