import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = {
    title: '회원 상세 정보 | TEAMBUY',
};

const MEMBER_ID = '10492';

const KPIS = [
    { label: '회원 고유 식별 번호', value: 'M-10492', sub: '일반 구매자', truncate: false },
    { label: '공동구매 누적 주문', value: '총 9 건', sub: '완료 8 · 진행 1', truncate: false },
    { label: '보유 예치금 잔액', value: '154,000 원', sub: '동결 45,000원', truncate: false },
    { label: '최근 보안 접속 기록', value: '10-24 09:12', sub: '121.134.xx.xx', truncate: true },
];

const PROFILE_LEFT = [
    { label: '회원번호', value: 'M-10492', mono: true },
    { label: '이메일 계정', value: 'user_soccer@test.com', mono: false },
    { label: '닉네임', value: '축구왕슛돌이', mono: false },
    { label: '휴대폰 번호', value: '010-1234-5678', mono: false },
];

const SANCTIONS = [
    {
        suspendedAt: '2024-01-10 11:00',
        releasedAt: '2024-01-17 11:00',
        type: '욕설 및 비방 행위',
        period: '7일 계정 정지',
        reason: '팀 공동구매 채팅 채널 내 타 참가자 대상 비방 신고 누적 접수 (운영규칙 제14조 2항 위반)',
        admin: 'admin_lee',
        status: '기간 만료 해제',
    },
];

const ACTIVITY = [
    { label: '완료된 주문 건수', value: '8 건', sub: '총 2,430,000원 결제' },
    { label: '진행 중인 공구 건수', value: '1 건', sub: '배송 준비 단계' },
    { label: '개설 팀 로스터 수', value: '2 개', sub: 'FC 슛돌이, 서울 유나이티드' },
];

const SECURITY_LOG = [
    { label: '최근 로그인', value: '2024-10-24 09:12:05', mono: true },
    { label: '접속 IP 주소', value: '121.134.xx.xx (대한민국)', mono: true },
    { label: '접속 환경', value: 'macOS / Chrome 129.0', mono: false },
    { label: '비밀번호 변경일', value: '2024-03-12 (기본 설정)', mono: false },
];

export default function AdminMemberDetailPage() {
    return (
        <div className="flex flex-col w-full gap-space-lg">
            {/* Top Navigation & Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-md border-b border-outline-variant">
                <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                        <span>회원 관리</span>
                        <span className="text-outline">/</span>
                        <span>회원 목록</span>
                        <span className="text-outline">/</span>
                        <span className="text-primary font-semibold">회원 상세 (M-10492)</span>
                    </div>
                    <div className="flex items-center gap-space-md">
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">회원 상세 정보</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-caption text-caption border border-primary bg-primary text-on-primary">
                            정상 회원
                        </span>
                    </div>
                </div>
                {/* Contextual Actions */}
                <div className="flex items-center gap-space-sm">
                    <Link
                        href={ROUTES.adminMembers}
                        className="inline-flex items-center gap-space-xs px-space-md h-11 rounded border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-primary hover:bg-surface-container transition-colors"
                    >
                        <Icon name="arrow_back" className="text-[18px]" />
                        목록으로 돌아가기
                    </Link>
                    <Link
                        href={ROUTES.adminMemberSuspend(MEMBER_ID)}
                        className="inline-flex items-center gap-space-xs px-space-md h-11 rounded bg-primary text-on-primary border border-primary font-label-md text-label-md hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                    >
                        <Icon name="block" className="text-[18px]" />
                        <span>회원 정지 처리</span>
                    </Link>
                </div>
            </div>
            {/* KPI / Micro Activity Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {KPIS.map((kpi) => (
                    <div
                        key={kpi.label}
                        className="p-space-md bg-surface-container-lowest border border-outline-variant rounded flex flex-col justify-between"
                    >
                        <span className="font-caption text-caption text-on-surface-variant">{kpi.label}</span>
                        <div className="flex items-baseline justify-between mt-space-xs">
                            <span
                                className={
                                    kpi.truncate
                                        ? 'font-headline-sm text-headline-sm text-primary truncate'
                                        : 'font-headline-sm text-headline-sm text-primary tracking-tight'
                                }
                            >
                                {kpi.value}
                            </span>
                            <span className="font-caption text-caption text-secondary">{kpi.sub}</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Main Member Info Bento Container */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
                <div className="px-space-lg py-space-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="badge" className="text-primary text-[20px]" />
                        <h2 className="font-headline-sm text-headline-sm text-primary">회원 기본 프로필</h2>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">[DATA ID: USR_2024_10492_AUTH]</span>
                </div>
                {/* 2-Column Key Value Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
                    {/* Left Column */}
                    <div className="flex flex-col divide-y divide-outline-variant">
                        {PROFILE_LEFT.map((row) => (
                            <div key={row.label} className="flex items-center px-space-lg py-space-md">
                                <span className="w-36 font-label-md text-label-md text-on-surface-variant">{row.label}</span>
                                <span
                                    className={
                                        row.mono
                                            ? 'font-body-md text-body-md text-primary font-mono font-medium'
                                            : 'font-body-md text-body-md text-primary'
                                    }
                                >
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Right Column */}
                    <div className="flex flex-col divide-y divide-outline-variant">
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">가입일시</span>
                            <span className="font-body-md text-body-md text-primary">2024-03-12 14:22:10</span>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">회원 구분</span>
                            <div className="flex items-center gap-space-xs">
                                <span className="font-body-md text-body-md text-primary">일반 (팀 구매자)</span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant border border-outline-variant">
                                    축구/풋살 부문
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">예치금 잔액</span>
                            <div className="flex items-center gap-space-sm font-body-md text-body-md text-primary">
                                <span className="font-semibold">154,000원</span>
                                <span className="font-caption text-caption text-error">(동결: 45,000원)</span>
                            </div>
                        </div>
                        <div className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">현재 계정 상태</span>
                            <div className="flex items-center gap-space-xs">
                                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                <span className="font-body-md text-body-md text-primary font-medium">
                                    정상 이용 중 (로그인 및 공동구매 주문 가능)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Suspension & Penalty History Section */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
                <div className="px-space-lg py-space-md border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="gavel" className="text-primary text-[20px]" />
                        <h2 className="font-headline-sm text-headline-sm text-primary">계정 제재 및 정지 이력</h2>
                        <span className="font-caption text-caption px-2 py-0.5 rounded border border-outline-variant bg-surface-container text-on-surface">
                            총 1건 기록
                        </span>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">최근 12개월간 운영 원칙 위반 제재 내역</span>
                </div>
                {/* History Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse font-body-sm text-body-sm">
                        <thead>
                            <tr className="bg-surface border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
                                <th className="py-space-sm px-space-md whitespace-nowrap">처리 일시 (정지)</th>
                                <th className="py-space-sm px-space-md whitespace-nowrap">해제 일시 (만료)</th>
                                <th className="py-space-sm px-space-md whitespace-nowrap">제재 유형 / 기간</th>
                                <th className="py-space-sm px-space-md min-w-[240px]">상세 제재 사유</th>
                                <th className="py-space-sm px-space-md whitespace-nowrap">처리 관리자</th>
                                <th className="py-space-sm px-space-md whitespace-nowrap text-right">처리 상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant text-primary">
                            {SANCTIONS.map((sanction) => (
                                <tr key={sanction.suspendedAt} className="hover:bg-surface-container-low transition-colors">
                                    <td className="py-space-md px-space-md font-mono whitespace-nowrap">{sanction.suspendedAt}</td>
                                    <td className="py-space-md px-space-md font-mono whitespace-nowrap">{sanction.releasedAt}</td>
                                    <td className="py-space-md px-space-md whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sanction.type}</span>
                                            <span className="font-caption text-caption text-secondary">{sanction.period}</span>
                                        </div>
                                    </td>
                                    <td className="py-space-md px-space-md">
                                        <span className="text-on-surface-variant">{sanction.reason}</span>
                                    </td>
                                    <td className="py-space-md px-space-md font-mono whitespace-nowrap">{sanction.admin}</td>
                                    <td className="py-space-md px-space-md whitespace-nowrap text-right">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded border border-outline-variant bg-surface font-caption text-caption text-secondary">
                                            {sanction.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Empty/Previous Records Guide Footer */}
                <div className="px-space-lg py-space-sm bg-surface text-center border-t border-outline-variant">
                    <span className="font-caption text-caption text-on-surface-variant">
                        이전 추가 제재 이력이 존재하지 않습니다. 모든 정책 변경 및 징계 기록은 영구 보존됩니다.
                    </span>
                </div>
            </div>
            {/* Lower Section / Activity Summary & Wireframe References */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
                {/* Activity & Orders Metric */}
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                        <h3 className="font-headline-sm text-headline-sm text-primary">공동구매 참가 및 활동 현황</h3>
                        <span className="font-caption text-caption text-on-surface-variant">최근 30일 데이터 기준</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                        {ACTIVITY.map((item) => (
                            <div key={item.label} className="border border-outline-variant p-space-md rounded bg-surface flex flex-col justify-between">
                                <span className="font-caption text-caption text-on-surface-variant">{item.label}</span>
                                <span className="font-headline-md text-headline-md text-primary mt-space-xs">{item.value}</span>
                                <span className="font-caption text-caption text-secondary mt-1">{item.sub}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border border-outline-variant rounded p-space-md bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                            <Icon name="info" className="text-outline text-[20px]" />
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-primary">진행 중인 공동구매: [축구] 나이키 팀 매치 유니폼 20벌</span>
                                <span className="font-caption text-caption text-secondary">주문번호 ORD-202410-8812 | 최소 수량(MOQ) 달성 완료</span>
                            </div>
                        </div>
                        <button
                            className="px-space-sm py-1 rounded border border-outline-variant bg-surface-container-lowest font-caption text-caption text-primary hover:bg-surface-container"
                            type="button"
                        >
                            주문 내역 보기
                        </button>
                    </div>
                </div>
                {/* Device & Security Log Wireframe */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col justify-between">
                    <div className="flex flex-col gap-space-md">
                        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
                            <h3 className="font-headline-sm text-headline-sm text-primary">최근 접속 &amp; 기기 정보</h3>
                            <Icon name="security" className="text-outline text-[18px]" />
                        </div>
                        <div className="flex flex-col gap-space-sm">
                            {SECURITY_LOG.map((row, index) => (
                                <div
                                    key={row.label}
                                    className={
                                        index === 0
                                            ? 'flex justify-between items-center py-1'
                                            : 'flex justify-between items-center py-1 border-t border-outline-variant'
                                    }
                                >
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">{row.label}</span>
                                    <span
                                        className={
                                            row.mono
                                                ? 'font-mono font-body-sm text-body-sm text-primary'
                                                : 'font-body-sm text-body-sm text-primary'
                                        }
                                    >
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-space-md pt-space-md border-t border-outline-variant flex items-center justify-between">
                        <span className="font-caption text-caption text-secondary">이상 로그인 징후 미발견</span>
                        <button className="text-primary font-caption text-caption underline hover:text-outline" type="button">
                            접속 세션 강제 종료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
