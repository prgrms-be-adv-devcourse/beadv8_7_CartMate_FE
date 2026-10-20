import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import HomeSalesPosts from './_components/HomeSalesPosts';

export const metadata: Metadata = { title: '홈 | TEAMBUY' };

// 종목·카테고리 칩, 진행 중인 내 공동구매, 정렬 탭은 BE API가 없거나 다른 항목(GP-*) 범위라 숨겨 두었다. (로드맵 SHOP-3)
const ESCROW_STEPS = [
    {
        step: 'STEP 01',
        icon: 'add_box',
        title: '공구 방 개설 & 옵션 모집',
        description: '팀 리더가 목표 제품 및 최소 수량(MOQ)을 설정하고 고유 초대 링크를 생성하여 팀원들에게 배포합니다.',
        note: '· 마킹 로스터 폼 실시간 취합',
    },
    {
        step: 'STEP 02',
        icon: 'lock',
        title: '팀원 개별 예치금 동결',
        description: '팀원이 각자의 사이즈와 마킹을 선택한 뒤 본인 계정 예치금으로 각자 결제 승인하여 안전하게 동결(Escrow Holding)됩니다.',
        note: '· 총무 사비 선결제 불필요',
    },
    {
        step: 'STEP 03',
        icon: 'precision_manufacturing',
        title: 'MOQ 달성 시 자동 발주',
        description: '목표 인원이 100% 충족되는 즉시 동결 금액이 정산되며, 공식 파트너 브랜드 공장으로 생산 발주서가 자동 전송됩니다.',
        note: '· 발주 직후 송장 번호 개별 알림',
    },
    {
        step: 'STEP 04',
        icon: 'history',
        title: '미달 시 100% 자동 환불',
        description: '지정된 마감 기한 내에 최소 수량이 충족되지 않으면 수수료 차감 없이 즉시 팀원 전원 계좌로 100% 자동 반환됩니다.',
        note: '· 환불 수수료 0원 보장',
    },
];

export default function HomePage() {
    return (
        <div className="flex flex-col w-full bg-surface-container-lowest">
            {/* Main Content Wrapper: Desktop 1200px wireframe layout */}
            <div className="w-full max-w-[1200px] mx-auto px-gutter py-space-xl flex flex-col gap-space-xl">
                <HomeSalesPosts />

                {/* SECTION 4: Teambuy Escrow Payment Process Guide */}
                <section className="border border-outline-variant bg-surface-container-low p-space-lg flex flex-col gap-space-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-outline-variant pb-space-sm">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-space-xs">
                                <span className="font-caption text-caption uppercase text-outline tracking-wider bg-surface-container px-space-xs py-0.5 border border-outline-variant">SAFETY PROTOCOL</span>
                                <span className="font-caption text-caption text-outline">먹튀 방지 &amp; 총무 부담 제로</span>
                            </div>
                            <h2 className="font-headline-md text-headline-md text-on-surface">팀바이(TEAMBUY) 예치금 에스크로 결제 프로세스 안내</h2>
                        </div>
                        <Link className="text-on-surface font-label-sm text-label-sm underline underline-offset-4 hover:text-outline flex items-center gap-1" href={ROUTES.deposit}>
                            <span>[예치금 이용안내 상세 가이드]</span>
                            <Icon name="arrow_forward" className="text-[16px]" />
                        </Link>
                    </div>
                    {/* 4-Step Flow Protocol Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                        {ESCROW_STEPS.map((step) => (
                            <div key={step.step} className="bg-surface-container-lowest border border-outline-variant p-space-md flex flex-col gap-space-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-caption text-caption uppercase px-space-xs py-0.5 bg-primary text-on-primary font-bold">{step.step}</span>
                                    <Icon name={step.icon} className="text-outline text-[22px]" />
                                </div>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface">{step.title}</h3>
                                <p className="font-body-sm text-body-sm text-outline">{step.description}</p>
                                <div className="mt-auto pt-space-xs border-t border-surface-container-highest text-caption font-caption text-outline">{step.note}</div>
                            </div>
                        ))}
                    </div>
                    {/* Escrow License & Security Notice Banner */}
                    <div className="border border-outline-variant bg-surface-container-lowest p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-md">
                            <Icon name="encrypted" className="text-primary text-[28px] shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-label-md text-label-md text-on-surface">금융결제망 연동 안전거래 에스크로 등록 완료</span>
                                <span className="font-caption text-caption text-outline">
                                    전자금융거래법 제28조 제2항 제1호에 따른 전자상거래 결제대금예치업 등록번호: [제 02-000-0000호]
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <a className="font-label-sm text-label-sm text-on-surface px-space-sm py-1 border border-outline-variant hover:bg-surface-container transition-colors inline-block" href="#">
                                [에스크로 약관 확인]
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
