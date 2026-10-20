import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import ClaimForm from './_components/ClaimForm';

export const metadata: Metadata = {
    title: '교환 및 환불 요청 | TEAMBUY',
};

const ORDER_ID = 'ORD-20250301-09122';

const NOTICES = [
    '상품 수령 후 7일 이내에 신청 가능합니다.',
    '단순 변심의 경우 왕복 배송비가 부과됩니다.',
    '단체 유니폼 커스텀 마킹 제품은 교환/환불이 제한될 수 있습니다.',
];

const CLAIM_ITEMS = [
    {
        category: '축구 유니폼 상하세트',
        sku: '품번: TB-S-9912',
        name: 'FC 스트라이커 프로 커스텀 저지 (홈)',
        option: '옵션: 네이비 / 100 (L) / 마킹: [7. 김민수] | 수량: 1개',
        price: '₩ 48,000',
        checked: true,
    },
    {
        category: '스타디움 장비',
        sku: '품번: TB-E-4011',
        name: '프로 트레이닝 축구공 (FIFA 규격)',
        option: '옵션: 화이트/블랙 / 기본형 | 수량: 2개',
        price: '₩ 35,000',
        checked: false,
    },
];

export default function OrderClaimPage() {
    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                <div className="mb-space-xl">
                    <div className="flex items-center gap-space-xs text-caption font-caption text-outline uppercase tracking-wider mb-space-xs">
                        <span>[마이페이지]</span>
                        <span>/</span>
                        <span>주문 관리</span>
                        <span>/</span>
                        <span className="text-on-surface font-bold">교환 · 환불 신청</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">교환 및 환불 요청</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                        주문하신 상품의 교환 또는 반품(환불)을 접수하실 수 있습니다. 사유에 따라 배송비가 발생할 수 있습니다.
                    </p>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    {/* Left Sidebar: 신청 안내 & 고객센터 (3 Columns) */}
                    <div className="col-span-3 flex flex-col gap-space-lg sticky top-36">
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-lg rounded">
                            <div className="font-label-md text-label-md text-on-surface mb-space-md pb-space-xs border-b border-surface-container">신청 안내</div>
                            <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
                                {NOTICES.map((notice) => (
                                    <li key={notice} className="flex items-start gap-space-xs">
                                        <Icon name="info" className="text-[16px] text-outline mt-0.5" />
                                        <span>{notice}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-surface-container-low border border-outline-variant p-space-lg rounded">
                            <div className="font-label-md text-label-md text-on-surface mb-space-sm">고객센터 문의</div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">처리가 지연되거나 문의사항이 있으신가요?</p>
                            <div className="font-headline-sm text-headline-sm font-bold text-primary mb-space-xs">1644-0000</div>
                            <div className="font-caption text-caption text-outline">평일 09:30 - 18:30</div>
                        </div>
                    </div>

                    {/* Right Main Content: Return Form (9 Columns) */}
                    <div className="col-span-9 flex flex-col gap-space-xl">
                        {/* Target Items Selection Section */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-xl rounded">
                            <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-surface-container">
                                <div className="font-headline-sm text-headline-sm text-on-surface font-bold">1. 교환/환불 대상 상품 선택</div>
                                <span className="font-caption text-caption text-outline">주문번호: {ORDER_ID}</span>
                            </div>
                            <div className="flex flex-col gap-space-md">
                                {CLAIM_ITEMS.map((item) => (
                                    <div
                                        key={item.sku}
                                        className="border border-outline-variant p-space-md rounded flex items-center gap-space-md bg-surface-container-lowest hover:border-primary transition-colors"
                                    >
                                        <input className="w-4 h-4 accent-primary cursor-pointer" defaultChecked={item.checked} type="checkbox" />
                                        <div className="w-16 h-16 bg-surface-container border border-outline-variant relative flex items-center justify-center shrink-0">
                                            <svg
                                                className="absolute inset-0 w-full h-full text-outline-variant pointer-events-none"
                                                preserveAspectRatio="none"
                                                viewBox="0 0 100 100"
                                            >
                                                <line stroke="currentColor" strokeWidth="1" x1="0" x2="100" y1="0" y2="100" />
                                                <line stroke="currentColor" strokeWidth="1" x1="100" x2="0" y1="0" y2="100" />
                                            </svg>
                                            <span className="font-caption text-caption text-outline z-10">64x64</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-space-xs mb-1">
                                                <span className="font-caption text-caption px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded">
                                                    {item.category}
                                                </span>
                                                <span className="font-caption text-caption text-outline">{item.sku}</span>
                                            </div>
                                            <div className="font-headline-sm text-headline-sm text-on-surface truncate">{item.name}</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">{item.option}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-label-md text-label-md text-on-surface font-bold">{item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Request Form Section */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-xl rounded">
                            <div className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-md pb-space-sm border-b border-surface-container">
                                2. 접수 유형 및 사유 선택
                            </div>
                            <ClaimForm cancelHref={ROUTES.order(ORDER_ID)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
