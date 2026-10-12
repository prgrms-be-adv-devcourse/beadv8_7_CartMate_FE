import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import MemberOptionForm from './_components/MemberOptionForm';

export const metadata: Metadata = {
    title: '내 옵션 선택하기 | TEAMBUY',
};

const SIZE_GUIDE = [
    { size: 'S (90)', chest: '96', length: '69', height: '160 - 168 cm' },
    { size: 'M (95)', chest: '101', length: '71', height: '168 - 174 cm' },
    { size: 'L (100)', chest: '106', length: '73', height: '174 - 180 cm' },
    { size: 'XL (105)', chest: '111', length: '75', height: '180 - 186 cm' },
    { size: '2XL (110)', chest: '116', length: '77', height: '186 - 192 cm' },
];

export default function GroupPurchaseOptionsPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-xl">
                {/* 1. Breadcrumbs & Group Purchase Header */}
                <section className="flex flex-col gap-space-sm mb-space-lg">
                    <nav className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
                        <Link className="hover:text-primary cursor-pointer" href={ROUTES.home}>
                            홈
                        </Link>
                        <Icon name="chevron_right" className="text-[14px] text-outline" />
                        <Link className="hover:text-primary cursor-pointer" href={ROUTES.groupPurchases}>
                            팀 공동구매
                        </Link>
                        <Icon name="chevron_right" className="text-[14px] text-outline" />
                        <Link className="text-primary font-medium" href={ROUTES.groupPurchase()}>
                            [FC 에이스 2024 어웨이 유니폼]
                        </Link>
                        <Icon name="chevron_right" className="text-[14px] text-outline" />
                        <span className="text-primary font-semibold">팀원 옵션 선택</span>
                    </nav>
                    <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-md flex flex-wrap items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md">
                            <div className="h-6 px-2.5 bg-primary text-on-primary rounded-full flex items-center justify-center font-caption text-caption tracking-tight">
                                FC 에이스 공동구매 참여 중
                            </div>
                            <div className="h-4 w-[1px] bg-outline-variant" />
                            <div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
                                <span>
                                    목표 인원: <strong className="text-primary">10명</strong>
                                </span>
                                <span className="text-outline">/</span>
                                <span>
                                    현재 선택 완료: <strong className="text-primary font-semibold">8명</strong>
                                </span>
                                <span className="text-outline">/</span>
                                <span className="font-medium text-error">2명 미입력</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-space-sm bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant">
                            <Icon name="schedule" className="text-[18px] text-primary" />
                            <span className="font-body-sm text-body-sm text-on-surface">
                                선택 수정 마감: <strong className="font-semibold text-primary">D-2 18:00</strong> 까지
                            </span>
                        </div>
                    </div>
                </section>

                {/* 2. Two-Column Wireframe Grid */}
                <div className="grid grid-cols-12 gap-gutter items-start">
                    {/* LEFT COLUMN: Product Overview & Sizing Reference */}
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-space-lg">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-md">
                            <div className="text-secondary font-caption text-caption uppercase tracking-wider">[ ITEM DETAILS ]</div>
                            <div className="relative w-full h-[240px] bg-surface-container-low border border-outline-variant rounded flex items-center justify-center overflow-hidden">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                                    <line stroke="#c6c6cd" strokeWidth="1" x1="0" x2="100%" y1="0" y2="100%" />
                                    <line stroke="#c6c6cd" strokeWidth="1" x1="100%" x2="0" y1="0" y2="100%" />
                                </svg>
                                <div className="relative z-10 bg-surface-container-lowest px-3 py-1 border border-outline-variant font-label-sm text-label-sm text-secondary">
                                    [ WIREFRAME IMAGE : 240 x 240 ]
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 pt-space-xs">
                                <span className="font-caption text-caption text-secondary uppercase font-semibold">BRAND: MATCH-CORE ATHLETICS</span>
                                <h2 className="font-headline-sm text-headline-sm text-primary tracking-tight">[MATCH-1] 정품 매치웨어 팀 저지</h2>
                                <div className="mt-2 flex items-baseline justify-between border-t border-surface-variant pt-2">
                                    <span className="font-body-sm text-body-sm text-secondary">참여 기준 단가</span>
                                    <span className="font-headline-sm text-headline-sm text-primary font-bold">
                                        33,000 <span className="font-body-sm text-body-sm font-normal">원 / 벌</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-lg flex flex-col gap-space-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="font-label-md text-label-md text-primary font-bold">실측 치수표 (사이즈 가이드)</h3>
                                <span className="font-caption text-caption text-secondary">단위: cm</span>
                            </div>
                            <div className="w-full overflow-x-auto border border-outline-variant rounded">
                                <table className="w-full text-left font-body-sm text-body-sm border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low border-b border-outline-variant text-secondary font-label-sm text-label-sm">
                                            <th className="py-2 px-3 border-r border-outline-variant text-center">사이즈</th>
                                            <th className="py-2 px-3 border-r border-outline-variant text-center">가슴둘레</th>
                                            <th className="py-2 px-3 border-r border-outline-variant text-center">총기장</th>
                                            <th className="py-2 px-3 text-center">권장 신장</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant text-center">
                                        {SIZE_GUIDE.map((row) => (
                                            <tr key={row.size} className="hover:bg-surface-container-low/50">
                                                <td className="py-2 px-3 border-r border-outline-variant font-semibold bg-surface-container-low/30">{row.size}</td>
                                                <td className="py-2 px-3 border-r border-outline-variant">{row.chest}</td>
                                                <td className="py-2 px-3 border-r border-outline-variant">{row.length}</td>
                                                <td className="py-2 px-3 text-secondary">{row.height}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="font-caption text-caption text-secondary mt-1">※ 측정 위치와 원단 신축성에 따라 1~2cm의 오차가 발생할 수 있습니다.</p>
                        </div>

                        <div className="bg-surface-container-low border border-outline-variant rounded p-space-md">
                            <div className="flex items-start gap-2">
                                <Icon name="info" className="text-[18px] text-primary shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1">
                                    <span className="font-label-sm text-label-sm text-primary">공동구매 유의사항</span>
                                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                                        모든 팀원의 옵션 취합 및 전원 결제 완료 시 최종 발주가 진행됩니다. 수정 마감 전까지 언제든 본인 옵션을 자유롭게 변경할 수 있습니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT COLUMN: Member Individual Option Form */}
                    <section className="col-span-12 lg:col-span-7 flex flex-col gap-space-md">
                        <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl flex flex-col gap-space-lg">
                            <div className="flex flex-col gap-1 border-b border-surface-variant pb-space-md">
                                <div className="flex items-center justify-between">
                                    <h1 className="font-headline-md text-headline-md text-primary">내 옵션 선택하기</h1>
                                    <span className="font-caption text-caption border border-outline px-2 py-0.5 rounded text-secondary uppercase">INDIVIDUAL ENTRY</span>
                                </div>
                                <p className="font-body-sm text-body-sm text-secondary">초대된 팀원 본인이 착용할 색상 및 사이즈 규격을 선택하여 공유 장바구니에 등록합니다.</p>
                            </div>
                            <MemberOptionForm />
                        </div>
                    </section>
                </div>

                {/* 3. Bottom Notice / Presets Information Block */}
                <section className="mt-space-xl bg-surface-container-lowest border border-outline-variant rounded p-space-md flex items-center justify-between gap-space-md">
                    <div className="flex items-center gap-space-sm">
                        <Icon name="swap_horizontal_circle" className="text-secondary text-[22px]" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-space-sm font-body-sm text-body-sm text-secondary">
                            <span className="font-semibold text-primary">[알림] 이미 등록한 옵션이 있는 경우</span>
                            <span className="hidden sm:inline text-outline">|</span>
                            <span>이 페이지는 &apos;옵션 수정 모드&apos;로 작동하며 기존 등록된 옵션이 자동으로 기본 체크되어 표시됩니다.</span>
                        </div>
                    </div>
                    <div className="shrink-0 font-caption text-caption text-outline border border-outline-variant px-2 py-1 rounded">ROSTER VER: 1.0</div>
                </section>
            </div>
        </div>
    );
}
