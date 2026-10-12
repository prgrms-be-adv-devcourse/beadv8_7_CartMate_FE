import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import FilledIcon from './_components/FilledIcon';
import NoticeManager, { type Notice } from './_components/NoticeManager';

export const metadata: Metadata = {
    title: '공지사항 관리 | TEAMBUY',
};

const STATS = [
    { label: '전체 공지 수', value: '12건', icon: 'description', filled: false, small: false },
    { label: '상단 고정 공지', value: '2건', icon: 'push_pin', filled: true, small: false },
    { label: '이벤트성 안내', value: '3건', icon: 'celebration', filled: false, small: false },
    { label: '최근 게시일', value: '2024-10-25', icon: 'schedule', filled: false, small: true },
];

const NOTICES: Notice[] = [
    {
        no: 12,
        category: '공지',
        title: '[안내] 2024년 11월 시스템 정기 점검 안내',
        pinned: true,
        author: '최고관리자',
        createdAt: '2024-10-25',
        content:
            '시스템 인프라 최적화 및 보안 패치 적용을 위한 정기 점검이 진행될 예정입니다.\n\n일시: 2024년 11월 03일 02:00 ~ 06:00 (총 4시간)\n영향 범위: 서비스 전반 접근 일시 중단\n\n문의 사항은 고객센터를 통해 접수해 주시기 바랍니다.',
    },
    {
        no: 11,
        category: '공지',
        title: '공동구매 결제 예치금 동결 및 환불 규정 개정 안내',
        pinned: true,
        author: '최고관리자',
        createdAt: '2024-10-18',
        content: '공동구매 진행 시 결제 안정성을 높이기 위한 신규 환불 규정 개정안입니다.\n상세 약관을 확인하시어 불이익이 없도록 유의 바랍니다.',
    },
    {
        no: 10,
        category: '안내',
        title: '부정 거래 방지 정책 강화 안내',
        pinned: false,
        author: '운영관리자',
        createdAt: '2024-09-30',
        content: '비인가 제3자 대리 결제 차단 및 모니터링 체계를 고도화하였습니다.',
    },
    {
        no: 9,
        category: '이벤트',
        title: '가을 시즌 축구/농구 유니폼 공동구매 프로모션 공지',
        pinned: false,
        author: '최고관리자',
        createdAt: '2024-09-15',
        content: '동호회 및 클럽 단체팀 대상 브랜드 유니폼 추가 10% 적립 프로모션입니다.',
    },
];

export default function AdminNoticesPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col gap-space-lg w-full">
                <NoticeManager notices={NOTICES}>
                    {/* Quick Status Metas (Bento Row) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                                    <p className={stat.small ? 'font-label-md text-label-md text-primary mt-2' : 'font-headline-md text-headline-md text-primary mt-1'}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                    {stat.filled ? <FilledIcon name={stat.icon} /> : <Icon name={stat.icon} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </NoticeManager>
                {/* Wireframe Note & Guidelines */}
                <div className="p-space-md rounded bg-surface-container-low flex items-start gap-space-sm">
                    <Icon name="info" className="text-outline text-[20px] mt-0.5" />
                    <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-primary">운영 가이드 안내</span>
                        <span className="font-caption text-caption text-on-surface-variant">
                            상단 고정 공지는 최대 3개까지 권장되며, 중요도에 따라 사용자 메인 화면 상단 배너 영역과 공지사항 게시판 상단에 우선적으로 강조되어 노출됩니다.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
