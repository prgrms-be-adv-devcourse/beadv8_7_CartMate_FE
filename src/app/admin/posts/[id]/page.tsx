import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import PostHideManager from './_components/PostHideManager';

export const metadata: Metadata = {
    title: '판매글 상세 정보 | TEAMBUY',
};

const POST_ID = 'P-202410-091';

const OPTIONS = [
    { id: 'OPT-01', size: '95 (M)', color: '블랙/화이트', extra: '+0원', stock: '100벌', soldOut: false },
    { id: 'OPT-02', size: '100 (L)', color: '블랙/화이트', extra: '+0원', stock: '150벌', soldOut: false },
    { id: 'OPT-03', size: '105 (XL)', color: '블랙/화이트', extra: '+0원', stock: '80벌', soldOut: false },
    { id: 'OPT-04', size: '100 (L)', color: '레드/네이비', extra: '+2,000원', stock: '0벌', soldOut: true },
];

export default function AdminPostDetailPage() {
    return (
        <div className="flex flex-col w-full gap-space-lg">
            <PostHideManager postId={POST_ID}>
                {/* 2. Product Basic Info Section */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-lg">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                        <div className="flex items-center gap-space-sm">
                            <Icon name="inventory_2" className="text-on-surface-variant text-[20px]" />
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">상품 기본 정보</h2>
                        </div>
                        <span className="font-caption text-caption text-outline font-mono">ITEM_ID: {POST_ID}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                        {/* Wireframe Image Box */}
                        <div className="lg:col-span-4 flex flex-col items-center">
                            <div className="relative w-full max-w-[280px] aspect-square bg-surface-container-low border border-outline-variant rounded flex flex-col items-center justify-center overflow-hidden">
                                {/* Diagonal crosswire indicator for blueprint/wireframe standard */}
                                <svg
                                    className="absolute inset-0 w-full h-full text-outline-variant stroke-current opacity-40 pointer-events-none"
                                    preserveAspectRatio="none"
                                >
                                    <line strokeWidth="1" x1="0" x2="100%" y1="0" y2="100%"></line>
                                    <line strokeWidth="1" x1="100%" x2="0" y1="0" y2="100%"></line>
                                </svg>
                                <div className="relative z-10 flex flex-col items-center gap-2 bg-surface-container-lowest/80 px-4 py-3 rounded border border-outline-variant">
                                    <Icon name="image" className="text-[32px] text-outline" />
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">대표 이미지 [1/5]</span>
                                    <span className="font-caption text-caption text-outline">240 × 240 px</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                            </div>
                        </div>
                        {/* Specs Table / Key-Value Grid */}
                        <div className="lg:col-span-8 flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-md">
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">상품번호</span>
                                    <span className="font-label-md text-label-md text-on-surface font-mono">{POST_ID}</span>
                                </div>
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">종목 / 카테고리</span>
                                    <span className="font-label-md text-label-md text-on-surface">축구 / 단체 유니폼 의류</span>
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">상품명</span>
                                    <span className="font-headline-sm text-headline-sm text-on-surface">프로페셔널 축구 유니폼 상하의 세트</span>
                                </div>
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">판매자 정보</span>
                                    <div className="flex flex-col font-body-sm text-body-sm text-on-surface">
                                        <span className="font-semibold text-primary">프로스포츠코리아</span>
                                        <span className="text-on-surface-variant font-mono text-xs">사업자: 120-81-xxxxx | 회원번호: M-09841</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">기본 판매 가격</span>
                                    <span className="font-headline-sm text-headline-sm text-on-surface">
                                        45,000 <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">원</span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">등록일시</span>
                                    <span className="font-body-md text-body-md text-on-surface font-mono">2024-10-24 14:32:00</span>
                                </div>
                                <div className="flex flex-col gap-1 pb-2 border-b border-outline-variant">
                                    <span className="font-caption text-caption text-on-surface-variant">최소 주문 수량 (MOQ)</span>
                                    <span className="font-body-md text-body-md text-on-surface">기준 없음 (자유 수량)</span>
                                </div>
                            </div>
                            {/* Description Box */}
                            <div className="mt-space-md p-space-md bg-surface-container-low border border-outline-variant rounded">
                                <span className="font-caption text-caption text-on-surface-variant block mb-1">상세 설명 안내</span>
                                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                                    기능성 쿨링 원단 단체 맞춤 유니폼입니다. 최소 주문 수량 기준 없음. 흡한속건 기능성 원단 사용으로 통기성이 우수하며, 등번호 및 네임 마킹을 위한 맞춤형
                                    레이아웃 가이드를 제공합니다. 단체 주문 시 자수 패치 및 커스텀 스폰서 로고 인쇄 가능.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 3. Options Table Section */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm">
                        <div className="flex items-center gap-space-sm">
                            <Icon name="tune" className="text-on-surface-variant text-[20px]" />
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">판매 옵션 및 재고 현황</h2>
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant">총 4개 옵션 구성</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-outline-variant bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
                                    <th className="py-3 px-4">옵션 ID</th>
                                    <th className="py-3 px-4">사이즈</th>
                                    <th className="py-3 px-4">색상</th>
                                    <th className="py-3 px-4 text-right">추가 금액</th>
                                    <th className="py-3 px-4 text-right">현재 재고 수량</th>
                                    <th className="py-3 px-4 text-center">품절 여부</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                                {OPTIONS.map((option) => (
                                    <tr
                                        key={option.id}
                                        className={
                                            option.soldOut
                                                ? 'bg-surface-container-high/40 hover:bg-surface-container transition-colors'
                                                : 'hover:bg-surface-container transition-colors'
                                        }
                                    >
                                        <td className={option.soldOut ? 'py-3 px-4 font-mono font-medium text-outline' : 'py-3 px-4 font-mono font-medium text-on-surface'}>
                                            {option.id}
                                        </td>
                                        <td className="py-3 px-4 text-on-surface">{option.size}</td>
                                        <td className="py-3 px-4 text-on-surface">{option.color}</td>
                                        <td className="py-3 px-4 text-right font-mono text-on-surface">{option.extra}</td>
                                        <td
                                            className={
                                                option.soldOut
                                                    ? 'py-3 px-4 text-right font-mono text-on-surface-variant font-semibold'
                                                    : 'py-3 px-4 text-right font-mono text-on-surface font-semibold'
                                            }
                                        >
                                            {option.stock}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {option.soldOut ? (
                                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-primary text-on-primary font-label-sm text-label-sm">품절</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded text-xs border border-outline-variant bg-surface text-on-surface font-label-sm text-label-sm">
                                                    정상
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </PostHideManager>
        </div>
    );
}
