import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import PaymentConsent from './_components/PaymentConsent';

export const metadata: Metadata = { title: '주문서 | TEAMBUY' };

const SHIPPING_MEMOS = [
    { value: 'door', label: '문 앞 배치 (부재 시 문 앞에 놓아주세요)' },
    { value: 'call', label: '부재 시 경비실에 맡겨주세요' },
    { value: 'direct', label: '배송 전 미리 연락 바랍니다' },
    { value: 'custom', label: '직접 입력' },
];

const ORDER_GROUPS = [
    {
        supplier: '매치코어 스포츠',
        subtotal: '매치코어 소계: 47,000원',
        shipping: '배송비: 3,000원 (선결제)',
        items: [
            { name: 'MATCH-1 팀 저지', option: '옵션: L(100) / 마킹: 등번호 10번', quantity: '수량: 1벌', price: '33,000원' },
            { name: '엘리트 풋살 삭스', option: '옵션: 블랙 (단일)', quantity: '수량: 2켤레', price: '14,000원' },
        ],
    },
    {
        supplier: '스타디움 기어',
        subtotal: '스타디움 소계: 45,000원',
        shipping: '배송비: 3,000원 (선결제)',
        items: [{ name: 'ST-BALL 매치볼', option: '옵션: 공식 규격 (5호)', quantity: '수량: 1개', price: '45,000원' }],
    },
];

export default function CheckoutPage() {
    return (
        <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
            <div className="flex flex-col w-full">
                <div className="flex items-center justify-between pb-space-lg mb-space-xl border-b border-outline-variant">
                    <div className="flex items-baseline gap-space-md">
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">주문서 (와이어프레임)</h1>
                        <span className="font-caption text-caption px-space-xs py-0.5 border border-outline text-outline uppercase">[CHECKOUT_STEP_03 : DIRECT_DEPOSIT]</span>
                    </div>
                    <div className="flex items-center gap-space-sm font-caption text-caption text-secondary">
                        <span className="text-outline">01 장바구니</span>
                        <span>&gt;</span>
                        <span className="text-primary font-bold">02 주문/결제</span>
                        <span>&gt;</span>
                        <span className="text-outline">03 주문완료</span>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-gutter items-start">
                    <div className="col-span-8 flex flex-col gap-space-xl">
                        {/* 배송지 정보 */}
                        <section className="bg-surface-container-lowest border border-outline-variant p-space-lg">
                            <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
                                <div className="flex items-center gap-space-sm">
                                    <Icon name="local_shipping" className="text-[20px] text-primary" />
                                    <h2 className="font-headline-sm text-headline-sm text-primary">배송지 정보</h2>
                                </div>
                                <div className="flex items-center gap-space-md">
                                    <Link
                                        className="h-8 px-space-md border border-outline-variant text-primary font-label-sm text-label-sm hover:border-primary transition-colors bg-surface-container-lowest flex items-center"
                                        href={ROUTES.addresses}
                                    >
                                        배송지 변경
                                    </Link>
                                    <Link
                                        className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4"
                                        href={ROUTES.addresses}
                                    >
                                        + 새 배송지 추가
                                    </Link>
                                </div>
                            </div>
                            <div className="p-space-md bg-surface-container-low border border-outline-variant mb-space-md">
                                <div className="flex items-center gap-space-sm mb-space-xs">
                                    <span className="font-label-md text-label-md text-primary font-bold">홍길동</span>
                                    <span className="px-space-xs py-0.5 border border-primary text-primary font-caption text-caption bg-surface-container-lowest font-semibold">기본 배송지</span>
                                </div>
                                <div className="font-body-sm text-body-sm text-secondary mb-space-xs">010-1234-5678</div>
                                <div className="font-body-md text-body-md text-on-surface">[06234] 서울특별시 강남구 테헤란로 123 4층 402호</div>
                            </div>
                            <div className="flex flex-col gap-space-xs">
                                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="shipping-memo">
                                    배송 요청사항
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-10 px-space-md border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface appearance-none focus:border-primary outline-none cursor-pointer"
                                        id="shipping-memo"
                                        defaultValue="door"
                                    >
                                        {SHIPPING_MEMOS.map((memo) => (
                                            <option key={memo.value} value={memo.value}>
                                                {memo.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Icon name="expand_more" className="absolute right-space-md top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]" />
                                </div>
                            </div>
                        </section>
                        {/* 주문 상품 정보 */}
                        <section className="bg-surface-container-lowest border border-outline-variant p-space-lg">
                            <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
                                <div className="flex items-center gap-space-sm">
                                    <Icon name="inventory_2" className="text-[20px] text-primary" />
                                    <h2 className="font-headline-sm text-headline-sm text-primary">주문 상품 정보</h2>
                                </div>
                                <span className="font-caption text-caption text-secondary">총 3개 품목 (2개 파트너사 배송)</span>
                            </div>
                            <div className="flex flex-col gap-space-lg">
                                {ORDER_GROUPS.map((group) => (
                                    <div key={group.supplier} className="border border-outline-variant">
                                        <div className="px-space-md py-space-sm bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                                            <span className="font-label-sm text-label-sm text-primary font-bold">[공급사] {group.supplier}</span>
                                            <span className="font-caption text-caption text-secondary">개별 묶음 배송</span>
                                        </div>
                                        <div className="p-space-md flex flex-col gap-space-md">
                                            {group.items.map((item, index) => (
                                                <div
                                                    key={item.name}
                                                    className={`flex items-center gap-space-md${index < group.items.length - 1 ? ' pb-space-md border-b border-surface-container' : ''}`}
                                                >
                                                    <div className="w-16 h-16 bg-surface-container-high border border-outline-variant relative flex items-center justify-center shrink-0">
                                                        <span className="font-caption text-caption text-outline relative z-10">IMG</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-body-md text-body-md font-semibold text-primary truncate">{item.name}</div>
                                                        <div className="font-caption text-caption text-secondary mt-0.5">{item.option}</div>
                                                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">{item.quantity}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-label-md text-label-md text-primary font-bold">{item.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-space-md py-space-sm bg-surface-container border-t border-outline-variant flex items-center justify-between font-caption text-caption text-on-surface-variant">
                                            <span>{group.subtotal}</span>
                                            <span>{group.shipping}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        {/* 결제 수단 */}
                        <section className="bg-surface-container-lowest border border-outline-variant p-space-lg">
                            <div className="flex items-center gap-space-sm pb-space-md mb-space-md border-b border-surface-container">
                                <Icon name="payments" className="text-[20px] text-primary" />
                                <h2 className="font-headline-sm text-headline-sm text-primary">결제 수단</h2>
                            </div>
                            <div className="p-space-md bg-surface-container-low border border-primary flex flex-col gap-space-sm">
                                <label className="flex items-center gap-space-sm cursor-pointer select-none">
                                    <input defaultChecked className="w-4 h-4 accent-primary" name="payment_method" type="radio" value="deposit" />
                                    <span className="font-label-md text-label-md text-primary font-bold">결제 수단: 팀바이 예치금 (자체 페이 전용)</span>
                                </label>
                                <div className="pl-6 font-body-sm text-body-sm text-secondary">
                                    주문 완료 즉시 보유 예치금에서 결제 금액이 차감됩니다. (현금영수증 및 세금계산서 증빙 발행 가능)
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="col-span-4 sticky top-36 flex flex-col gap-space-md">
                        <div className="bg-surface-container-lowest border border-primary p-space-lg">
                            <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
                                <h3 className="font-headline-sm text-headline-sm text-primary">최종 결제 금액</h3>
                                <span className="font-caption text-caption text-outline">[STEP: FINAL]</span>
                            </div>
                            <div className="flex flex-col gap-space-sm pb-space-md font-body-sm text-body-sm">
                                <div className="flex items-center justify-between text-on-surface-variant">
                                    <span>주문 상품 총액</span>
                                    <span className="text-primary font-medium">92,000원</span>
                                </div>
                                <div className="flex items-center justify-between text-on-surface-variant">
                                    <span>총 배송비</span>
                                    <span className="text-primary font-medium">+ 6,000원</span>
                                </div>
                            </div>
                            <div className="py-space-md border-t border-b border-outline-variant flex items-center justify-between">
                                <span className="font-label-md text-label-md text-primary font-bold">총 결제 금액</span>
                                <span className="font-headline-md text-headline-md text-primary font-bold">98,000원</span>
                            </div>
                            <div className="pt-space-md pb-space-md flex flex-col gap-space-xs font-body-sm text-body-sm">
                                <div className="font-label-sm text-label-sm text-primary font-bold mb-space-xs">나의 예치금 현황</div>
                                <div className="flex items-center justify-between text-on-surface-variant">
                                    <span>보유 예치금</span>
                                    <span className="text-primary">150,000원</span>
                                </div>
                                <div className="flex items-center justify-between text-on-surface-variant">
                                    <span>결제 사용액</span>
                                    <span className="text-primary font-medium">- 98,000원</span>
                                </div>
                                <div className="flex items-center justify-between pt-space-xs font-label-md text-label-md text-primary font-bold">
                                    <span>결제 후 잔액</span>
                                    <span>52,000원</span>
                                </div>
                                <div className="mt-space-sm p-space-xs bg-surface-container border border-outline-variant font-caption text-caption text-center text-primary font-semibold">
                                    [ 상태: 예치금 잔액이 충분합니다 ]
                                </div>
                            </div>
                            <PaymentConsent />
                        </div>
                        <div className="p-space-md bg-surface-container-low border border-outline-variant font-caption text-caption text-secondary flex flex-col gap-1">
                            <div className="font-bold text-primary">안내 사항</div>
                            <div>- 팀 전용 유니폼 및 장비 주문은 결제 후 공급사 제작 단계로 바로 접수됩니다.</div>
                            <div>- 옵션 마킹/커스텀이 적용된 상품은 제작 착수 후 취소 및 교환이 제한될 수 있습니다.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
