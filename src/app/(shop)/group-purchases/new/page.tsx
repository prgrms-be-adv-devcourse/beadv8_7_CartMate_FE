import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import CreateGroupPurchaseForm from './_components/CreateGroupPurchaseForm';

export const metadata: Metadata = {
    title: '새로운 팀 공동구매 개설 | TEAMBUY',
};

export default function GroupPurchaseNewPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* Breadcrumb & Top Indicator */}
                <div className="flex flex-col gap-space-xs mb-space-lg">
                    <div className="flex items-center gap-space-xs text-secondary font-caption text-caption">
                        <Link className="hover:text-primary cursor-pointer" href={ROUTES.home}>
                            홈
                        </Link>
                        <span>/</span>
                        <Link className="hover:text-primary cursor-pointer" href={ROUTES.groupPurchases}>
                            팀 공동구매
                        </Link>
                        <span>/</span>
                        <span className="text-primary font-bold">새로운 공동구매 개설</span>
                        <span className="ml-space-sm px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px]">FORM-ID: GP-CREATE-2025</span>
                    </div>
                    <div className="flex items-baseline justify-between mt-space-xs">
                        <div>
                            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">새로운 팀 공동구매 개설</h1>
                            <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                                최소 주문 수량(MOQ)을 달성하여 티어 할인을 적용받고 팀원들과 장바구니를 취합합니다.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-space-md py-1.5 rounded bg-surface-container text-secondary font-label-sm text-label-sm">
                            <Icon name="verified_user" className="text-[18px]" />
                            <span>주문 안전 보장 시스템 적용 단계</span>
                        </div>
                    </div>
                </div>
                {/* Layout: Main Split Form / Summary (2-Column Grid) */}
                <CreateGroupPurchaseForm
                    itemBanner={
                        <div className="p-space-lg rounded bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row gap-space-md items-start sm:items-center">
                            <div className="relative w-[120px] h-[120px] flex-shrink-0 bg-surface-container flex flex-col items-center justify-center overflow-hidden rounded">
                                <svg
                                    className="absolute inset-0 w-full h-full text-outline-variant"
                                    preserveAspectRatio="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    viewBox="0 0 120 120"
                                >
                                    <line x1="0" x2="120" y1="0" y2="120" />
                                    <line x1="0" x2="120" y1="120" y2="0" />
                                </svg>
                                <span className="relative z-10 font-caption text-caption text-secondary bg-surface-container-lowest px-1.5 py-0.5 rounded font-mono">[ 120 x 120 ]</span>
                                <span className="relative z-10 font-caption text-[10px] text-secondary mt-0.5">IMAGE HOLDER</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-between self-stretch">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-caption text-caption">축구 / 유니폼 세트</span>
                                        <span className="font-caption text-caption text-secondary font-mono">CODE: SKU-M1-STRIPE</span>
                                    </div>
                                    <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight">[MATCH-1] 커스텀 팀 스트라이프 저지 세트</h2>
                                    <p className="font-body-sm text-body-sm text-secondary mt-1">상의 + 하의 포함 / 통풍 메쉬 기능성 원단 / 전면 풀 마킹 지원</p>
                                </div>
                                <div className="flex items-center gap-space-md pt-space-sm mt-space-xs">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-caption text-caption text-outline line-through">정가 45,000원</span>
                                        <span className="font-headline-sm text-headline-sm text-primary font-bold">33,000원</span>
                                        <span className="font-caption text-caption text-primary font-medium">/ 1벌</span>
                                    </div>
                                    <span className="text-secondary font-caption text-caption">|</span>
                                    <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded text-primary font-label-sm text-label-sm">
                                        <Icon name="price_change" className="text-[16px]" />
                                        <span>MOQ 10벌 이상 달성 시 27% 그룹 할인 자동 적용</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
