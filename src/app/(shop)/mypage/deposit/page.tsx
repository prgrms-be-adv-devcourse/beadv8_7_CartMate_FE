import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '예치금 관리 | TEAMBUY',
};

const POLICIES = [
    {
        title: '01. 전용 예치금 지갑',
        description: '팀 공동 자산 및 개인 자금을 1원 단위로 분리 보관하며 번거로운 다중 PG 결제 없이 원클릭 공구 참여를 지원합니다.',
    },
    {
        title: '02. 조건부 동결 (Hold) 원리',
        description: "공구 모집 중에는 자금이 이체되지 않고 '동결' 상태로 안전 대기하며, 목표 MOQ 달성 시에만 일괄 승인 결제됩니다.",
    },
    {
        title: '03. 100% 무손실 자동 환원',
        description: '목표 수량 미달, 호스트의 공구 취소, 또는 팀원의 주문 포기 시 위약금 없이 즉시 사용 가능 잔액으로 실시간 전환됩니다.',
    },
];

const TRANSACTIONS = [
    {
        date: '2024.11.24 14:20',
        type: '동결',
        typeClassName: 'bg-secondary-container text-on-secondary-fixed',
        title: '공동구매 참여 (FC 에이스 어웨이)',
        detail: 'MOQ 20벌 달성 시 최종 결제 전환 예정',
        amount: '-33,000원',
        amountClassName: 'text-on-surface',
        amountNote: '(동결)',
        available: '가용: 152,000원',
        total: '(총: 185,000원)',
        rowClassName: '',
    },
    {
        date: '2024.11.20 10:15',
        type: '충전',
        typeClassName: 'bg-surface-container-highest text-on-surface',
        title: '간편 계좌 충전',
        detail: '신한은행 110-***-*** 입금 확인',
        amount: '+100,000원',
        amountClassName: 'text-primary',
        amountNote: null,
        available: '가용: 185,000원',
        total: '(총: 185,000원)',
        rowClassName: 'bg-surface-container-lowest',
    },
    {
        date: '2024.11.15 19:30',
        type: '결제',
        typeClassName: 'bg-surface-container-high text-on-surface-variant',
        title: '개인 구매 (풋살화)',
        detail: '주문번호 #TB-241115-8841',
        amount: '-65,000원',
        amountClassName: 'text-secondary',
        amountNote: null,
        available: '가용: 85,000원',
        total: '(총: 85,000원)',
        rowClassName: '',
    },
    {
        date: '2024.11.10 11:00',
        type: '동결 해제',
        typeClassName: 'bg-surface-container text-on-surface',
        title: '공동구매 기한만료 취소 환원',
        detail: '트레이닝 탑 공동구매 최소 인원(10인) 미달 환원',
        amount: '+35,000원',
        amountClassName: 'text-on-surface',
        amountNote: '(해제)',
        available: '가용: 150,000원',
        total: '(총: 150,000원)',
        rowClassName: 'bg-surface-container-lowest',
    },
    {
        date: '2024.11.01 09:00',
        type: '환불',
        typeClassName: 'bg-surface-container-highest text-on-surface-variant',
        title: '본인 계좌 출금 환불',
        detail: '국민은행 4293-***-*** 송금 완료',
        amount: '-50,000원',
        amountClassName: 'text-secondary',
        amountNote: null,
        available: '가용: 115,000원',
        total: '(총: 115,000원)',
        rowClassName: '',
    },
];

export default function DepositPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl grid grid-cols-12 gap-gutter items-start">
            <MyPageSidebar />

            <div className="col-span-9 flex flex-col w-full">
                {/* Top Meta / Section Overline */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-lg mb-space-xl">
                    <div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-secondary uppercase tracking-widest mb-1">
                            <span>ACCOUNT &amp; WALLET</span>
                            <span>/</span>
                            <span>SYS.DEP-0924</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">예치금 관리 메인 (와이어프레임)</h1>
                        <p className="font-body-sm text-body-sm text-secondary mt-1">
                            공동구매 결제 예약 및 에스크로 자금의 실시간 동결/가용 현황을 관리합니다.
                        </p>
                    </div>
                    {/* Action Button Group */}
                    <div className="flex items-center gap-space-sm self-start md:self-auto">
                        <button
                            className="h-11 px-space-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md rounded shadow-sm flex items-center gap-space-xs transition-colors"
                            type="button"
                        >
                            <Icon name="currency_exchange" className="text-[18px]" />
                            <span>예치금 환불/출금 신청</span>
                        </button>
                        <Link
                            className="h-11 px-space-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md rounded shadow-md flex items-center gap-space-xs transition-colors"
                            href={ROUTES.depositCharge}
                        >
                            <Icon name="add_circle" className="text-[18px]" />
                            <span>+ 예치금 충전</span>
                        </Link>
                    </div>
                </div>

                {/* 3-Way Balance Matrix Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-xl">
                    {/* Card 1: Total Holding Balance */}
                    <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div>
                            <div className="flex items-center justify-between text-secondary mb-space-md">
                                <span className="font-caption text-caption tracking-wider uppercase">[전체 보유 잔액]</span>
                                <Icon name="account_balance" className="text-[20px] text-secondary" />
                            </div>
                            <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-xs">
                                185,000 <span className="font-body-md text-body-md font-normal text-secondary">원</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                                계좌 내 총 자산 합계 (사용 가능 잔액 + 현재 진행 중인 공구 동결액)
                            </p>
                        </div>
                        <div className="mt-space-lg pt-space-md flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded">
                            <span className="font-caption text-caption text-secondary">자산 상태:</span>
                            <span className="font-caption text-caption font-bold text-on-surface">정상 보호 중 (100%)</span>
                        </div>
                    </div>

                    {/* Card 2: Available Amount (Primary Emphasis) */}
                    <div className="bg-primary text-on-primary p-space-xl rounded shadow-md flex flex-col justify-between relative">
                        <div>
                            <div className="flex items-center justify-between text-primary-fixed mb-space-md">
                                <div className="flex items-center gap-space-xs">
                                    <span className="font-caption text-caption tracking-wider uppercase">[사용 가능 금액]</span>
                                    <span className="px-1.5 py-0.5 bg-primary-container text-on-primary-fixed font-caption text-caption rounded">
                                        실시간 가용
                                    </span>
                                </div>
                                <Icon name="lock_open" className="text-[20px] text-primary-fixed" />
                            </div>
                            <div className="font-display-xl text-display-xl font-bold tracking-tight mb-space-xs text-on-primary">
                                152,000 <span className="font-headline-sm text-headline-sm font-normal text-primary-fixed">원</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-primary-fixed leading-relaxed">
                                즉시 개인 구매 및 등록 계좌로 100% 당일 출금 가능한 순수 여유 자금
                            </p>
                        </div>
                        <div className="mt-space-lg pt-space-md flex items-center justify-between bg-surface-container-lowest/10 px-space-md py-space-xs rounded">
                            <span className="font-caption text-caption text-primary-fixed">즉시 출금 한도:</span>
                            <span className="font-caption text-caption font-bold text-on-primary">1회 2,000,000원 / 일 10,000,000원</span>
                        </div>
                    </div>

                    {/* Card 3: Frozen Escrow Amount */}
                    <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col justify-between relative">
                        <div>
                            <div className="flex items-center justify-between text-secondary mb-space-md">
                                <div className="flex items-center gap-space-xs">
                                    <span className="font-caption text-caption tracking-wider uppercase">[동결 중 금액]</span>
                                    <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant font-caption text-caption rounded">
                                        공구 에스크로
                                    </span>
                                </div>
                                <Icon name="lock" className="text-[20px] text-secondary" />
                            </div>
                            <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-xs">
                                33,000 <span className="font-body-md text-body-md font-normal text-secondary">원</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                                진행 중인 공동구매 <strong className="text-on-surface font-semibold">&apos;FC 에이스 유니폼 공구&apos;</strong>로 인해 묶인 돈.
                                전원 결제 완료 시 자동 차감되며, 인원 미달/취소 시 즉시 자동 동결 해제됩니다.
                            </p>
                        </div>
                        <div className="mt-space-lg pt-space-md flex items-center justify-between bg-surface-container-low px-space-md py-space-xs rounded">
                            <span className="font-caption text-caption text-secondary">공구 마감 기한:</span>
                            <span className="font-caption text-caption font-bold text-on-surface">D-3 (2024.11.27 23:59)</span>
                        </div>
                    </div>
                </div>

                {/* Deposit & Escrow Policy Architecture Strip */}
                <div className="bg-surface-container-low p-space-lg rounded mb-space-xl">
                    <div className="flex items-center gap-space-sm mb-space-md">
                        <Icon name="verified_user" className="text-[18px] text-primary" />
                        <h2 className="font-label-md text-label-md text-primary uppercase tracking-wide">예치금 시스템 및 공동구매 에스크로 안내</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg font-body-sm text-body-sm text-secondary">
                        {POLICIES.map((policy) => (
                            <div key={policy.title} className="bg-surface-container-lowest p-space-md rounded">
                                <div className="font-label-sm text-label-sm text-on-surface font-bold mb-1">{policy.title}</div>
                                <p className="leading-relaxed">{policy.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions Table Section */}
                <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm">
                    <div className="flex items-center justify-between pb-space-md mb-space-md">
                        <div className="flex items-center gap-space-sm">
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">최근 거래 내역</h3>
                            <span className="px-2 py-0.5 bg-surface-container font-caption text-caption text-secondary rounded">최근 5건</span>
                        </div>
                        <div className="flex items-center gap-space-xs font-caption text-caption text-secondary">
                            <span>기준 통화: KRW (₩)</span>
                            <span>·</span>
                            <span>실시간 동기화 완료</span>
                        </div>
                    </div>
                    {/* Wireframe Data Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left font-body-sm text-body-sm">
                            <thead>
                                <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm">
                                    <th className="py-space-sm px-space-md w-44">거래 일시</th>
                                    <th className="py-space-sm px-space-md w-28">거래 유형</th>
                                    <th className="py-space-sm px-space-md">상세 내용</th>
                                    <th className="py-space-sm px-space-md text-right w-40">금액</th>
                                    <th className="py-space-sm px-space-md text-right w-56">거래 후 잔액</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0 text-on-surface">
                                {TRANSACTIONS.map((tx) => (
                                    <tr key={tx.date} className={`hover:bg-surface-container-low/50 transition-colors ${tx.rowClassName}`}>
                                        <td className="py-space-md px-space-md text-secondary font-mono text-body-sm">{tx.date}</td>
                                        <td className="py-space-md px-space-md">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded font-caption text-caption font-bold ${tx.typeClassName}`}
                                            >
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="py-space-md px-space-md">
                                            <div className="font-label-md text-label-md text-on-surface">{tx.title}</div>
                                            <div className="font-caption text-caption text-secondary">{tx.detail}</div>
                                        </td>
                                        <td className={`py-space-md px-space-md text-right font-mono font-bold ${tx.amountClassName}`}>
                                            {tx.amount}
                                            {tx.amountNote && (
                                                <span className="font-caption text-caption font-normal text-secondary block">{tx.amountNote}</span>
                                            )}
                                        </td>
                                        <td className="py-space-md px-space-md text-right font-mono">
                                            <span className="font-bold text-on-surface">{tx.available}</span>
                                            <span className="block font-caption text-caption text-secondary">{tx.total}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Table Footer Navigation */}
                    <div className="mt-space-lg pt-space-md flex items-center justify-between">
                        <div className="font-caption text-caption text-secondary">
                            [조회 범위: 최근 30일 / 전체 기간 내역은 거래 내역 관리 탭에서 확인 가능]
                        </div>
                        <Link
                            className="h-10 px-space-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center gap-space-xs transition-colors"
                            href={ROUTES.depositHistory}
                        >
                            <span>전체 거래 내역 보기</span>
                            <Icon name="chevron_right" className="text-[16px]" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
