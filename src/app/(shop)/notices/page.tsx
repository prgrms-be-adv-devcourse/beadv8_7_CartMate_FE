import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import NoticeBoard, { type Notice } from './_components/NoticeBoard';

export const metadata: Metadata = {
    title: '공지사항 | TEAMBUY',
};

const NOTICES: Notice[] = [
    {
        id: 'pinned-1',
        pinned: true,
        badge: '중요',
        categories: ['긴급/중요', '공동구매/MOQ'],
        title: '[안내] 2025년 상반기 스포츠 단체복 공동구매 MOQ 정책 개편 및 마일리지 적립 안내',
        date: '2025.03.02',
        views: '1,240',
        author: '운영팀',
        attachment: '2025년_상반기_MOQ정책안내서.pdf (2.4MB)',
        content: (
            <>
                <p>안녕하세요. 팀바이커머스입니다.</p>
                <p>항상 저희 팀바이를 이용해 주시는 전국의 축구, 농구, 야구 등 다양한 종목의 팀 리더 및 체육회 관계자 여러분께 진심으로 감사의 말씀을 드립니다.</p>
                <p>
                    2025년 상반기를 맞이하여 팀 단체복 및 장비 공동구매의 효율성을 높이고 더 많은 할인 혜택을 제공하기 위해{' '}
                    <strong>MOQ(최소주문수량) 산정 기준 및 팀 예치금 마일리지 적립 구조</strong>를 개편하게 되었습니다.
                </p>
                <div className="p-space-md bg-surface-container border border-outline-variant my-space-md space-y-2">
                    <div className="font-label-md text-label-md text-on-surface font-bold">[주요 개편 사항 요약]</div>
                    <ul className="list-disc list-inside space-y-1 text-body-sm">
                        <li>
                            <strong>MOQ 달성 기준 완화:</strong> 기존 브랜드별 개별 합산에서 시즌 통합 합산 방식으로 변경
                        </li>
                        <li>
                            <strong>팀 예치금 추가 리워드:</strong> 공동구매 최종 결제액의 최대 3% 즉시 예치금 적립
                        </li>
                        <li>
                            <strong>로스터 인쇄 서비스:</strong> 20벌 이상 주문 시 등번호·이니셜 무료 마킹 적용 기간 연장
                        </li>
                    </ul>
                </div>
                <p>자세한 사항은 첨부된 안내 문서를 참고하여 주시기 바라며, 기타 문의 사항은 고객센터 또는 1:1 문의게시판을 통해 남겨주시면 신속하게 안내해 드리겠습니다.</p>
                <p>감사합니다.</p>
            </>
        ),
    },
    {
        id: 'pinned-2',
        pinned: true,
        badge: '물류',
        categories: ['긴급/중요', '배송/물류'],
        title: '[배송] 3월 삼일절 연휴 물류 센터 휴무 및 택배 출고 마감 일정 안내',
        date: '2025.02.25',
        views: '890',
        author: '물류관리팀',
        content: (
            <>
                <p>안녕하세요, 팀바이커머스 물류팀입니다.</p>
                <p>
                    삼일절 연휴로 인한 물류 센터 휴무 및 택배 출고 마감 일정을 아래와 같이 안내해 드립니다. 주말 경기나 대회 일정이 있으신 팀에서는 일정을 미리
                    확인하시어 주문해 주시기 바랍니다.
                </p>
                <div className="p-space-md bg-surface-container border border-outline-variant my-space-md space-y-2">
                    <div className="font-label-md text-label-md text-on-surface font-bold">[배송 휴무 일정]</div>
                    <ul className="list-disc list-inside space-y-1 text-body-sm">
                        <li>
                            <strong>출고 마감:</strong> 2월 28일(금) 오후 2시 결제 완료 건까지 당일 출고
                        </li>
                        <li>
                            <strong>휴무 기간:</strong> 3월 1일(토) ~ 3월 2일(일)
                        </li>
                        <li>
                            <strong>업무 재개:</strong> 3월 3일(월)부터 순차적 정상 출고 및 배송 시작
                        </li>
                    </ul>
                </div>
                <p>연휴 직후에는 택배 물량 증가로 인해 배송이 1~2일 정도 지연될 수 있는 점 너른 양해 부탁드립니다.</p>
            </>
        ),
    },
    {
        id: 'general-1',
        pinned: false,
        no: 104,
        badge: '일반',
        categories: [],
        title: '축구 유니폼 커스텀 마킹(번호/이름) 폰트 종류 추가 안내 (총 12종)',
        date: '2025.02.18',
        views: '542',
        author: '디자인스튜디오',
        content: (
            <>
                <p>팀바이 로스터 제작 시스템을 이용해 주시는 고객 여러분께 감사드립니다.</p>
                <p>
                    팀원들의 개성을 살리고 프로 유니폼과 같은 정교한 디자인을 연출하실 수 있도록, 등번호 및 이니셜 마킹용 신규 폰트 4종을 추가하여 총 12종의 폰트
                    라인업을 완성했습니다.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md my-space-md">
                    {[
                        { name: 'PREMIER 01', desc: '[ 현대적이고 날렵한 슬림 폰트 ]' },
                        { name: 'SERIE A 02', desc: '[ 클래식한 세리프 스타일 ]' },
                        { name: 'BUNDES 03', desc: '[ 굵고 강렬한 블록 폰트 ]' },
                        { name: 'VARSITY 04', desc: '[ 대학부/클럽 친선 스타일 ]' },
                    ].map((font) => (
                        <div key={font.name} className="p-space-md border border-outline-variant bg-surface-container text-center">
                            <div className="font-bold text-headline-sm mb-1">{font.name}</div>
                            <div className="font-caption text-outline">{font.desc}</div>
                        </div>
                    ))}
                </div>
                <p>지금 바로 &apos;로스터 제작&apos; 메뉴에서 팀 유니폼 시뮬레이션에 적용해 보세요!</p>
            </>
        ),
    },
    {
        id: 'general-2',
        pinned: false,
        no: 103,
        badge: '이벤트',
        categories: ['이벤트/혜택'],
        title: '[제휴 이벤트] 신규 가입 팀 대상 샘플 키트 무료 대여 서비스 연장 안내',
        date: '2025.02.10',
        views: '715',
        author: '마케팅팀',
        content: (
            <>
                <p>안녕하세요. 팀바이커머스입니다.</p>
                <p>
                    실물 원단을 직접 만져보고 사이즈를 피팅한 후 공동구매를 진행하고자 하는 팀 리더분들의 뜨거운 성원에 힘입어,{' '}
                    <strong>&apos;샘플 키트 무료 대여 서비스&apos;</strong>를 올해 상반기까지 연장합니다.
                </p>
                <div className="p-space-md bg-surface-container border border-outline-variant my-space-md space-y-2">
                    <div className="font-label-md text-label-md text-on-surface font-bold">[샘플 대여 신청 방법]</div>
                    <ol className="list-decimal list-inside space-y-1 text-body-sm">
                        <li>마이페이지 및 샘플 신청 메뉴에서 원하는 브랜드/종목 키트 선택</li>
                        <li>왕복 택배비 예치 후 원하는 장소로 수령 (7일간 대여)</li>
                        <li>팀원들과 사이즈 및 퀄리티 확인 후 반납 (예치금 전액 환급)</li>
                    </ol>
                </div>
                <p>단체 유니폼 실패 확률을 제로로 줄이는 팀바이의 무료 샘플 서비스를 지금 경험해 보세요.</p>
            </>
        ),
    },
    {
        id: 'general-3',
        pinned: false,
        no: 102,
        badge: '시스템',
        categories: [],
        title: '팀 예치금 가상계좌 자동 입금 확인 시스템 정기 점검 안내 (02.15 새벽 시간)',
        date: '2025.02.01',
        views: '432',
        author: '시스템운영팀',
        content: (
            <>
                <p>안정적인 결제 및 예치금 관리 서비스를 제공하기 위하여 서버 인프라 정기 점검을 실시합니다.</p>
                <p>점검 시간 동안 가상계좌 입금 확인 및 예치금 충전 서비스가 일시 중단되오니 서비스 이용에 참고하시기 바랍니다.</p>
                <div className="p-space-md bg-surface-container border border-outline-variant my-space-md">
                    <div className="font-label-md text-label-md text-on-surface font-bold mb-1">[점검 일시]</div>
                    <div className="text-body-sm">2025년 2월 15일(토) 02:00 ~ 05:00 (약 3시간 소요)</div>
                </div>
                <p>감사합니다.</p>
            </>
        ),
    },
    {
        id: 'general-4',
        pinned: false,
        no: 101,
        badge: '일반',
        categories: [],
        title: '팀바이커머스 B2C/B2B 통합 회원 가입 혜택 개편 및 이용약관 변경 안내',
        date: '2025.01.20',
        views: '980',
        author: '법무/기획팀',
        content: (
            <>
                <p>팀바이커머스를 이용해 주시는 회원 여러분께 감사드립니다.</p>
                <p>당사는 B2B 단체 구매 고객과 개인(B2C) 스포츠 용품 구매 고객 모두에게 더 나은 혜택을 제공하기 위하여 회원 등급 체계 및 이용약관을 개정합니다.</p>
                <p>개정된 약관은 2025년 2월 1일부터 효력이 발생하며, 변경된 내용은 고객센터 약관 페이지에서 확인하실 수 있습니다.</p>
            </>
        ),
    },
];

const PAGE_BUTTON = 'w-9 h-9 border border-outline-variant text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center hover:border-primary hover:text-on-surface transition-colors';

export default function NoticesPage() {
    return (
        <div className="flex flex-col w-full max-w-[1200px] mx-auto px-gutter py-space-xl">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg mb-space-xl border-b border-outline-variant gap-space-md">
                <div>
                    <div className="flex items-center gap-space-xs mb-space-xs">
                        <span className="font-caption text-caption text-outline uppercase tracking-wider">SUPPORT CENTER</span>
                        <span className="text-outline">/</span>
                        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">ANNOUNCEMENTS</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">공지사항</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        팀바이커머스의 주요 소식과 단체주문 안내, 물류 일정 및 정책 변경 사항을 안내해 드립니다.
                    </p>
                </div>
                <div className="flex items-center gap-space-sm">
                    <div className="w-64 h-10 border border-outline-variant bg-surface-container-lowest flex items-center px-space-md focus-within:border-primary">
                        <Icon name="search" className="text-outline text-[18px] mr-space-sm" />
                        <input
                            className="w-full bg-transparent border-none outline-none font-body-sm text-body-sm placeholder:text-outline text-on-surface"
                            id="notice-search"
                            placeholder="공지사항 검색"
                            type="text"
                        />
                    </div>
                    <button
                        className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md hover:bg-on-surface transition-colors flex items-center justify-center"
                        type="button"
                    >
                        검색
                    </button>
                </div>
            </div>

            <NoticeBoard notices={NOTICES} />

            {/* Pagination */}
            <div className="flex items-center justify-center gap-space-xs pb-space-xl">
                <button
                    className="w-9 h-9 border border-outline-variant flex items-center justify-center text-outline hover:border-primary hover:text-on-surface transition-colors"
                    disabled
                    type="button"
                >
                    <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <button className="w-9 h-9 bg-primary text-on-primary font-label-sm text-label-sm flex items-center justify-center" type="button">
                    1
                </button>
                {[2, 3, 4, 5].map((page) => (
                    <button key={page} className={PAGE_BUTTON} type="button">
                        {page}
                    </button>
                ))}
                <button
                    className="w-9 h-9 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
                    type="button"
                >
                    <Icon name="chevron_right" className="text-[18px]" />
                </button>
            </div>
        </div>
    );
}
