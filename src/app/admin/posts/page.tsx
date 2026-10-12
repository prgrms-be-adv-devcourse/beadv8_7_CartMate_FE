import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ClickableRow from './_components/ClickableRow';
import PostFilters from './_components/PostFilters';

export const metadata: Metadata = {
    title: '판매글 목록 | TEAMBUY',
};

type PostStatus = '판매 중' | '관리자 숨김' | '판매자 내림';

type Post = {
    id: string;
    name: string;
    desc: string;
    flag?: { label: string; className: string };
    seller: string;
    price: string;
    status: PostStatus;
    createdAt: string;
    striped: boolean;
};

const METRICS = [
    { label: '전체 등록 상품', icon: 'inventory_2', value: '384', unit: '건', danger: false },
    { label: '정상 판매 중', icon: 'visibility', value: '347', unit: '건 (90.3%)', danger: false },
    { label: '판매자 내림', icon: 'pause_circle', value: '25', unit: '건', danger: false },
    { label: '관리자 숨김 제재', icon: 'visibility_off', value: '12', unit: '건 검토필요', danger: true },
];

const POSTS: Post[] = [
    {
        id: 'P-202410-091',
        name: '프로페셔널 축구 유니폼 세트',
        desc: '[축구 > 유니폼/의류] 커스텀 팀 마킹 가능 / MOQ 15벌',
        seller: '프로스포츠코리아',
        price: '45,000원',
        status: '판매 중',
        createdAt: '2024-10-24',
        striped: false,
    },
    {
        id: 'P-202410-085',
        name: '피파공인 매치 축구공 (5호)',
        desc: '[축구 > 용품/장비] 정품 인증 미제출로 인한 제재',
        flag: { label: '규정 위반 소명중', className: 'px-1.5 py-0.2 bg-error text-on-error font-caption text-caption rounded-xs text-[10px]' },
        seller: '서울스포츠상사',
        price: '32,000원',
        status: '관리자 숨김',
        createdAt: '2024-10-20',
        striped: true,
    },
    {
        id: 'P-202409-042',
        name: '드라이핏 농구 유니폼 상하의',
        desc: '[농구 > 유니폼/의류] 통기성 매쉬 / 단체 넘버링 무료',
        seller: '바스켓볼클럽',
        price: '42,000원',
        status: '판매 중',
        createdAt: '2024-09-15',
        striped: false,
    },
    {
        id: 'P-202408-019',
        name: '동계 기모 훈련용 윈드브레이커',
        desc: '[축구/풋살 > 유니폼/의류] 방풍 발수 / 단체 로고 자수',
        seller: '올스포츠팀웨어',
        price: '68,000원',
        status: '판매자 내림',
        createdAt: '2024-08-30',
        striped: false,
    },
    {
        id: 'P-202407-003',
        name: '논슬립 스포츠 양말 10켤레 팩',
        desc: '[기타 > 보호대/잡화] KC 인증 미기재 상태',
        flag: { label: '가격오표기 의심', className: 'px-1.5 py-0.2 bg-outline text-surface-container-lowest font-caption text-caption rounded-xs text-[10px]' },
        seller: '프로스포츠코리아',
        price: '15,000원',
        status: '관리자 숨김',
        createdAt: '2024-07-12',
        striped: true,
    },
];

const STATUS_STYLE: Record<PostStatus, { badge: string; dot: string }> = {
    '판매 중': {
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-primary bg-primary text-on-primary font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-surface-bright',
    },
    '관리자 숨김': {
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-error bg-error-container text-on-error-container font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-error',
    },
    '판매자 내림': {
        badge: 'inline-flex items-center gap-1 px-space-sm py-0.5 rounded border border-outline-variant bg-surface-container text-secondary font-caption text-caption font-semibold',
        dot: 'w-1.5 h-1.5 rounded-full bg-outline',
    },
};

const PAGES = [2, 3, 4, 5];

export default function AdminPostsPage() {
    return (
        <div className="flex flex-col w-full">
            {/* Header Area */}
            <header className="flex flex-col gap-space-xs mb-space-xl">
                <div className="flex items-center gap-space-sm">
                    <span className="inline-block w-2.5 h-6 bg-primary rounded-none"></span>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">판매글 목록</h1>
                    <span className="px-space-sm py-0.5 bg-surface-container-high text-on-surface font-caption text-caption rounded">WIREFRAME v0.9</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant pl-space-md">입점 판매자의 등록 판매글을 검토하고 노출 상태를 관리합니다.</p>
            </header>
            {/* Metrics / Snapshot Row */}
            <div className="grid grid-cols-4 gap-space-md mb-space-lg">
                {METRICS.map((metric) => (
                    <div key={metric.label} className="bg-surface-container-lowest p-space-md border border-outline-variant rounded flex flex-col gap-space-xs">
                        <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant uppercase">
                            <span>{metric.label}</span>
                            <Icon name={metric.icon} className="text-[16px]" />
                        </div>
                        <div className="flex items-baseline gap-space-xs">
                            <span className={metric.danger ? 'font-headline-md text-headline-md text-error font-bold' : 'font-headline-md text-headline-md text-primary font-bold'}>
                                {metric.value}
                            </span>
                            <span className={metric.danger ? 'font-caption text-caption text-error font-semibold' : 'font-caption text-caption text-secondary'}>
                                {metric.unit}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Search & Filter Area Container */}
            <PostFilters />
            {/* Table Summary Bar */}
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-baseline gap-space-xs text-body-sm font-body-sm text-on-surface">
                    <span className="font-semibold text-primary">총 384개 상품</span>
                    <span className="text-on-surface-variant">
                        (관리자 숨김 <strong className="text-error font-semibold underline decoration-dashed">12개</strong>)
                    </span>
                </div>
                <div className="flex items-center gap-space-sm">
                    <span className="font-caption text-caption text-on-surface-variant">정렬 기준:</span>
                    <select className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-on-surface focus:outline-none">
                        <option>최신 등록순</option>
                        <option>가격 높은순</option>
                        <option>가격 낮은순</option>
                        <option>제재 상태순</option>
                    </select>
                    <select className="h-8 px-space-sm bg-surface-container-lowest border border-outline-variant rounded font-label-sm text-label-sm text-on-surface focus:outline-none">
                        <option>20개씩 보기</option>
                        <option>50개씩 보기</option>
                        <option>100개씩 보기</option>
                    </select>
                </div>
            </div>
            {/* Product Posts Table Area */}
            <div className="w-full bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm select-none">
                            <th className="py-space-md px-space-md w-32 font-semibold" scope="col">상품번호</th>
                            <th className="py-space-md px-space-sm w-20 text-center font-semibold" scope="col">대표 이미지</th>
                            <th className="py-space-md px-space-md font-semibold" scope="col">상품명</th>
                            <th className="py-space-md px-space-md w-40 font-semibold" scope="col">판매자 (상호명)</th>
                            <th className="py-space-md px-space-md w-32 text-right font-semibold" scope="col">가격</th>
                            <th className="py-space-md px-space-md w-32 text-center font-semibold" scope="col">노출 상태</th>
                            <th className="py-space-md px-space-md w-28 text-center font-semibold" scope="col">등록일</th>
                            <th className="py-space-md px-space-md w-24 text-center font-semibold" scope="col">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm text-on-surface">
                        {POSTS.map((post) => (
                            <ClickableRow
                                key={post.id}
                                href={ROUTES.adminPost(post.id)}
                                className={`hover:bg-surface-container-low transition-colors cursor-pointer group${post.striped ? ' bg-surface-container-low/40' : ''}`}
                            >
                                <td className="py-space-md px-space-md font-mono text-secondary group-hover:text-primary">{post.id}</td>
                                <td className="py-space-md px-space-sm text-center">
                                    {/* Wireframe Image Box (48x48) */}
                                    <div
                                        className="w-12 h-12 mx-auto bg-surface-container border border-outline-variant relative flex items-center justify-center select-none overflow-hidden"
                                        title="상품 대표 이미지 자리"
                                    >
                                        <svg
                                            className="absolute inset-0 w-full h-full stroke-outline-variant"
                                            preserveAspectRatio="none"
                                            strokeWidth="1"
                                            viewBox="0 0 100 100"
                                        >
                                            <line x1="0" x2="100" y1="0" y2="100"></line>
                                            <line x1="100" x2="0" y1="0" y2="100"></line>
                                        </svg>
                                        <span className="relative z-10 font-caption text-caption text-secondary font-bold tracking-tighter bg-surface/80 px-1 py-0.5 border border-outline-variant">
                                            [IMG]
                                        </span>
                                    </div>
                                </td>
                                <td className="py-space-md px-space-md">
                                    <div className="flex flex-col">
                                        {post.flag ? (
                                            <div className="flex items-center gap-space-xs">
                                                <span className="font-label-md text-label-md text-primary font-semibold group-hover:underline">{post.name}</span>
                                                <span className={post.flag.className}>{post.flag.label}</span>
                                            </div>
                                        ) : (
                                            <span className="font-label-md text-label-md text-primary font-semibold group-hover:underline">{post.name}</span>
                                        )}
                                        <span className="font-caption text-caption text-on-surface-variant">{post.desc}</span>
                                    </div>
                                </td>
                                <td className="py-space-md px-space-md font-medium text-on-surface">{post.seller}</td>
                                <td className="py-space-md px-space-md text-right font-mono font-semibold text-primary">{post.price}</td>
                                <td className="py-space-md px-space-md text-center">
                                    <span className={STATUS_STYLE[post.status].badge}>
                                        <span className={STATUS_STYLE[post.status].dot}></span>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="py-space-md px-space-md text-center font-mono text-secondary">{post.createdAt}</td>
                                <td className="py-space-md px-space-md text-center">
                                    <Link
                                        href={ROUTES.adminPost(post.id)}
                                        className="inline-flex items-center h-8 px-space-sm border border-outline-variant bg-surface-container-lowest text-primary rounded font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap"
                                    >
                                        상세보기
                                    </Link>
                                </td>
                            </ClickableRow>
                        ))}
                    </tbody>
                </table>
                {/* Table Footer / Action Bulk Bar */}
                <div className="flex items-center justify-between p-space-md bg-surface-container-low border-t border-outline-variant text-body-sm font-body-sm">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="info" className="text-[16px] text-secondary" />
                        <span className="text-on-surface-variant font-caption text-caption">행 전체를 클릭하면 해당 판매글의 상세 검토/수정 화면으로 이동합니다.</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                        <button
                            className="h-8 px-space-md bg-surface-container-lowest border border-outline-variant text-primary rounded font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                            type="button"
                        >
                            선택 상품 일괄 상태변경
                        </button>
                        <button
                            className="h-8 px-space-md bg-surface-container-lowest border border-outline-variant text-primary rounded font-label-sm text-label-sm hover:bg-surface-container transition-colors"
                            type="button"
                        >
                            엑셀(CSV) 다운로드
                        </button>
                    </div>
                </div>
            </div>
            {/* Pagination Area */}
            <nav aria-label="Page navigation" className="flex items-center justify-between mt-space-lg pt-space-md border-t border-outline-variant">
                <div className="font-caption text-caption text-on-surface-variant">
                    표시: <strong>1 - 5</strong> / 384 건 (페이지당 20개 기준)
                </div>
                <ul className="flex items-center gap-space-xs list-none m-0 p-0">
                    <li>
                        <button
                            aria-label="이전 페이지"
                            className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface text-outline cursor-not-allowed select-none"
                            disabled
                            type="button"
                        >
                            <Icon name="chevron_left" className="text-[16px]" />
                        </button>
                    </li>
                    <li>
                        <button
                            aria-current="page"
                            className="w-8 h-8 flex items-center justify-center border border-primary rounded bg-primary text-on-primary font-label-sm text-label-sm font-bold shadow-sm"
                            type="button"
                        >
                            1
                        </button>
                    </li>
                    {PAGES.map((page) => (
                        <li key={page}>
                            <button
                                className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-sm text-label-sm hover:bg-surface-container hover:border-secondary transition-colors"
                                type="button"
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            aria-label="다음 페이지"
                            className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container hover:border-secondary transition-colors"
                            type="button"
                        >
                            <Icon name="chevron_right" className="text-[16px]" />
                        </button>
                    </li>
                </ul>
                {/* Quick Page Jump */}
                <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                    <span>페이지 이동:</span>
                    <input
                        className="w-12 h-7 px-1 text-center bg-surface-container-lowest border border-outline-variant rounded font-mono text-body-sm focus:outline-none"
                        max="20"
                        min="1"
                        type="number"
                        defaultValue="1"
                    />
                    <button className="h-7 px-2 border border-outline-variant rounded bg-surface-container-low font-label-sm text-label-sm hover:bg-surface-container" type="button">
                        이동
                    </button>
                </div>
            </nav>
        </div>
    );
}
