import type { Metadata } from 'next';
import { ROUTES } from '@/lib/routes';
import SuspendModal from './_components/SuspendModal';

export const metadata: Metadata = {
    title: '회원 정지 처리 | TEAMBUY',
};

const MEMBER_ID = '09841';

const BUSINESS_INFO = [
    { label: '아이디 / 계정', value: 'sports_gear@biz.co.kr', strong: true, wide: false },
    { label: '사업자등록번호', value: '120-88-99412', strong: false, wide: false },
    { label: '대표자명', value: '김진성', strong: false, wide: false },
    { label: '연락처', value: '02-555-8941', strong: false, wide: false },
    { label: '사업장 소재지', value: '서울특별시 송파구 올림픽로 324 스포츠비즈타워 804호', strong: false, wide: true },
];

const SELLER_POSTS = [
    { title: '[축구] 엘리트 매치볼 프로 5호 단체 공구 (최소 20개)', status: '진행중 (모집률 85%)' },
    { title: '[농구] 프리미엄 커스텀 팀 유니폼 세트 풀패키지', status: '진행중 (모집률 120%)' },
    { title: '[배구] 실내 코트 프로 경기용 지주대 패딩 세트', status: '대기중' },
];

const STATS = [
    { label: '누적 공구 등록', value: '14건', danger: false },
    { label: '누적 거래액', value: '₩ 182,400,000', danger: false },
    { label: '신고 접수 건', value: '5건', danger: true },
    { label: '미배송 분쟁 건', value: '3건', danger: true },
];

export default function AdminMemberSuspendPage() {
    return (
        <div className="flex flex-col w-full relative">
            {/* Underlay: Member Detail Screen Wireframe (M-09841 프로스포츠코리아) */}
            <div className="flex flex-col w-full gap-space-lg select-none opacity-40 pointer-events-none filter blur-[0.5px]">
                {/* Top Action Bar in Detail Screen */}
                <div className="flex items-center justify-between pb-space-md border-b border-outline-variant">
                    <div className="flex items-center gap-space-md">
                        <span className="px-space-sm py-space-xs rounded bg-surface-container-highest text-on-surface font-caption text-caption tracking-wider">
                            M-09841
                        </span>
                        <h1 className="font-headline-lg text-headline-lg text-primary">프로스포츠코리아</h1>
                        <span className="px-space-sm py-space-xs rounded-full bg-primary text-on-primary font-caption text-caption">판매자 회원</span>
                        <span className="px-space-sm py-space-xs rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
                            정상 활동 중
                        </span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button
                            className="px-space-md py-space-sm rounded border border-outline-variant bg-surface-container-lowest font-label-md text-label-md text-primary"
                            type="button"
                        >
                            목록으로
                        </button>
                        <button className="px-space-md py-space-sm rounded bg-primary text-on-primary font-label-md text-label-md" type="button">
                            회원 상태 변경
                        </button>
                    </div>
                </div>
                {/* Wireframe Profile Summary Grid */}
                <div className="grid grid-cols-12 gap-gutter">
                    {/* Left Profile Details Box */}
                    <div className="col-span-8 flex flex-col gap-space-md bg-surface-container-lowest p-space-xl border border-outline-variant rounded">
                        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                            <span className="font-headline-sm text-headline-sm text-primary">기본 사업자 및 회원 정보</span>
                            <span className="font-caption text-caption text-outline">가입일시: 2023.04.12 14:22:01</span>
                        </div>
                        <div className="grid grid-cols-2 gap-space-md text-body-md font-body-md">
                            {BUSINESS_INFO.map((info) => (
                                <div key={info.label} className={info.wide ? 'flex flex-col gap-space-xs col-span-2' : 'flex flex-col gap-space-xs'}>
                                    <span className="text-on-surface-variant font-label-sm text-label-sm">{info.label}</span>
                                    <span className={info.strong ? 'text-primary font-label-md text-label-md' : 'text-primary'}>{info.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-space-md pt-space-md border-t border-outline-variant">
                            <span className="font-label-md text-label-md text-primary mb-space-sm block">등록 판매글 목록 (총 14건)</span>
                            <div className="border border-outline-variant rounded divide-y divide-outline-variant">
                                {SELLER_POSTS.map((post) => (
                                    <div key={post.title} className="p-space-sm flex items-center justify-between font-body-sm text-body-sm">
                                        <span>{post.title}</span>
                                        <span className="text-on-surface-variant font-caption text-caption">{post.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Right Stats Sidebar */}
                    <div className="col-span-4 flex flex-col gap-space-md">
                        <div className="bg-surface-container-lowest p-space-lg border border-outline-variant rounded flex flex-col gap-space-sm">
                            <span className="font-label-md text-label-md text-primary">활동 통계</span>
                            {STATS.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className={
                                        index === STATS.length - 1
                                            ? 'flex justify-between py-space-xs'
                                            : 'flex justify-between py-space-xs border-b border-outline-variant'
                                    }
                                >
                                    <span className="text-on-surface-variant font-body-sm text-body-sm">{stat.label}</span>
                                    <span
                                        className={
                                            stat.danger
                                                ? 'font-label-md text-label-md text-error font-bold'
                                                : 'font-label-md text-label-md text-primary'
                                        }
                                    >
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-surface-container-low p-space-lg border border-outline-variant rounded flex flex-col gap-space-xs">
                            <span className="font-label-sm text-label-sm text-primary">최근 관리자 메모</span>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                                2024.03.18 - 미배송 클레임 접수로 판매자 소명 요청 메일 발송 완료. 3일 경과 후 소명 미접수 시 정지 프로세스 개시 예정.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Backdrop Overlay + Focused Modal */}
            <SuspendModal backHref={ROUTES.adminMember(MEMBER_ID)} />
        </div>
    );
}
