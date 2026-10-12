import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ShippingForm from './_components/ShippingForm';

export const metadata: Metadata = {
    title: '공동구매 배송지 입력 | TEAMBUY',
};

const NOTICES = [
    '본 상품은 단체 유니폼 제작 수량(MOQ 15벌) 달성 확정 후 전량 맞춤 생산에 들어갑니다.',
    '커스텀 등번호 및 이니셜 마킹 작업 완료 즉시 송장번호가 등록되며 카카오 알림톡으로 전송됩니다.',
    '제작 시작 단계 이후에는 수령 주소지 변경이 제한되므로 반드시 수취 가능한 주소를 등록해주세요.',
];

const ROSTER_SPECS = [
    { label: '마킹 세부 옵션', value: '소매 엠블럼 + 등판 백넘버', valueClassName: 'text-primary font-medium' },
    { label: '공동구매 주문 단가', value: '49,000원', valueClassName: 'text-primary font-medium' },
    { label: '개별 배송 분기', value: '회원 직접 수령 (CJ대한통운)', valueClassName: 'text-primary font-bold' },
];

export default function GroupPurchaseShippingPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                {/* Progression Stepper Bar */}
                <div className="w-full mb-space-xl">
                    <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-space-md">
                            <span className="font-caption text-caption text-secondary uppercase tracking-wider">ORDER STEP 02/03</span>
                            <div className="h-3 w-px bg-outline-variant" />
                            <div className="flex items-center gap-2">
                                <Link className="font-label-sm text-label-sm text-secondary" href={ROUTES.groupPurchaseCart()}>
                                    01 옵션 및 로스터 확인
                                </Link>
                                <Icon name="chevron_right" className="text-outline text-[16px]" />
                                <span className="font-label-sm text-label-sm text-primary font-bold">02 수령 배송지 입력</span>
                                <Icon name="chevron_right" className="text-outline text-[16px]" />
                                <span className="font-label-sm text-label-sm text-outline">03 예치금/카드 최종 결제</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-caption text-caption bg-surface-container px-2 py-0.5 rounded text-primary font-medium">[ 공구 번호: #GP-2025-FC09 ]</span>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col gap-space-xs mb-space-xl">
                    <div className="flex items-center gap-space-sm">
                        <span className="font-caption text-caption bg-primary text-on-primary px-2 py-0.5 rounded">SHIPPING DESTINATION</span>
                        <span className="font-caption text-caption text-secondary">팀바이 공동구매 로지스틱스 모듈 v1.2</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">공동구매 상품 수령 배송지 입력</h1>
                    <p className="font-body-md text-body-md text-secondary">
                        팀 단체 일괄 배송 또는 개별 수령 방식에 맞춰 정확한 배송 정보를 입력해 주세요. 제작 완료 후 안전하게 발송됩니다.
                    </p>
                </div>

                {/* Main Content Layout (8 Cols Form / 4 Cols Summary) */}
                <ShippingForm
                    notice={
                        <div className="bg-surface-container-low p-space-md rounded flex items-start gap-space-md">
                            <Icon name="info" className="text-secondary text-[22px] mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <span className="font-label-sm text-label-sm text-primary">공동구매 제작 및 개별 배송 안내사항</span>
                                <p className="font-caption text-caption text-secondary leading-relaxed">
                                    {NOTICES.map((notice, i) => (
                                        <span key={notice}>
                                            · {notice}
                                            {i < NOTICES.length - 1 && <br />}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    }
                    orderSummary={
                        <>
                            <div className="flex items-center justify-between pb-space-xs">
                                <div className="flex items-center gap-2">
                                    <Icon name="inventory_2" className="text-primary text-[20px]" />
                                    <span className="font-headline-sm text-headline-sm text-primary">수령 대상 품목 요약</span>
                                </div>
                                <span className="font-caption text-caption bg-surface-container px-2 py-0.5 rounded text-secondary">수량 1건</span>
                            </div>
                            <div className="p-space-sm bg-surface rounded flex gap-space-sm items-center">
                                <div className="relative w-16 h-16 bg-surface-container flex items-center justify-center flex-shrink-0 rounded overflow-hidden">
                                    <svg className="absolute inset-0 w-full h-full text-outline-variant" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <line stroke="currentColor" strokeWidth="1.5" x1="0" x2="100" y1="0" y2="100" />
                                        <line stroke="currentColor" strokeWidth="1.5" x1="100" x2="0" y1="0" y2="100" />
                                    </svg>
                                    <span className="font-caption text-caption text-secondary z-10 font-bold bg-surface/80 px-1">JERSEY</span>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <span className="font-caption text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">[MATCH-1]</span>
                                        <span className="font-caption text-caption text-secondary">FC 팀바이 홈 킷</span>
                                    </div>
                                    <h4 className="font-label-md text-label-md text-primary truncate font-bold">커스텀 팀 저지 세트 (상하의)</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-caption text-caption bg-surface-variant text-primary px-1.5 py-0.5 rounded font-medium">사이즈: L (100)</span>
                                        <span className="font-caption text-caption bg-surface-variant text-primary px-1.5 py-0.5 rounded font-bold">#10 KIM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-container-low p-space-sm rounded flex flex-col gap-1.5">
                                {ROSTER_SPECS.map((spec) => (
                                    <div key={spec.label} className="flex items-center justify-between text-secondary font-caption text-caption">
                                        <span>{spec.label}</span>
                                        <span className={spec.valueClassName}>{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-space-xs flex flex-col gap-2">
                                <div className="flex justify-between items-center font-body-sm text-body-sm text-secondary">
                                    <span>상품 금액</span>
                                    <span className="font-body-md text-body-md text-primary">49,000원</span>
                                </div>
                                <div className="flex justify-between items-center font-body-sm text-body-sm text-secondary">
                                    <span className="flex items-center gap-1">
                                        배송비
                                        <span className="font-caption text-caption bg-secondary-fixed text-on-secondary-fixed px-1 rounded font-bold">공구 특전</span>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="line-through text-outline font-caption text-caption">3,000원</span>
                                        <span className="font-label-md text-label-md text-primary font-bold">0원</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-space-md bg-surface-container rounded flex items-center justify-between mt-space-xs">
                                <span className="font-label-md text-label-md text-primary font-bold">최종 결제 예정 금액</span>
                                <div className="text-right">
                                    <span className="font-display-xl text-headline-lg text-primary tracking-tight">49,000</span>
                                    <span className="font-label-md text-label-md text-primary font-normal">원</span>
                                </div>
                            </div>
                        </>
                    }
                    faq={
                        <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-2">
                            <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                                <Icon name="help" className="text-[16px]" />
                                수령지 변경이 필요하신가요?
                            </span>
                            <p className="font-caption text-caption text-secondary leading-normal">
                                공동구매 모집 마감 전까지는 마이페이지 &gt; 진행중인 공구에서 언제든지 수령 주소를 수정하실 수 있습니다.
                            </p>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
