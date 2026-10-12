import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const FOOTER_LINKS = [
    {
        title: '종목별 카테고리',
        links: [
            { label: '축구 / 풋살', href: ROUTES.home },
            { label: '농구', href: ROUTES.home },
            { label: '야구', href: ROUTES.home },
            { label: '배구 / 배드민턴', href: ROUTES.home },
            { label: '피트니스 & 트레이닝', href: ROUTES.home },
        ],
    },
    {
        title: '구매 솔루션',
        links: [
            { label: '팀 공동구매 개설', href: ROUTES.groupPurchaseNew },
            { label: '등번호 · 이니셜 주문', href: ROUTES.groupPurchaseNew },
            { label: '대량 주문 견적 문의', href: ROUTES.inquiries },
            { label: '샘플 키트 신청', href: ROUTES.inquiries },
        ],
    },
    {
        title: '고객 센터',
        links: [
            { label: '자주 묻는 질문 (FAQ)', href: ROUTES.notices },
            { label: '1:1 문의하기', href: ROUTES.inquiries },
            { label: '배송 및 수선 규정', href: ROUTES.notices },
            { label: '사이즈 가이드', href: ROUTES.notices },
        ],
    },
];

export default function SiteFooter() {
    return (
        <footer className="w-full bg-surface-container-lowest border-t border-outline-variant">
            <div className="max-w-[1200px] mx-auto px-gutter py-space-xl">
                <div className="grid grid-cols-12 gap-gutter pb-space-xl border-b border-surface-container">
                    <div className="col-span-4">
                        <div className="flex items-center gap-space-xs mb-space-sm">
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">TEAMBUY</span>
                            <span className="font-caption text-caption text-outline">팀 장비 · 단체 유니폼 구매</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                            공동구매 수량 기반 MOQ 단가 할인 및 커스텀 로스터 인쇄 솔루션을 제공하는 전문 플랫폼입니다.
                        </p>
                        <div className="font-caption text-caption text-outline">
                            운영시간: 평일 09:30 - 18:30 (점심시간 12:30 - 13:30)
                        </div>
                    </div>
                    {FOOTER_LINKS.map((group) => (
                        <div key={group.title} className="col-span-2">
                            <div className="font-label-sm text-label-sm text-on-surface font-bold uppercase mb-space-md">
                                {group.title}
                            </div>
                            <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                                {group.links.map((link) => (
                                    <Link key={link.label} href={link.href} className="hover:text-on-surface">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="col-span-2">
                        <div className="font-label-sm text-label-sm text-on-surface font-bold uppercase mb-space-md">
                            팀 예치금 &amp; 계좌
                        </div>
                        <div className="p-space-sm bg-surface-container border border-outline-variant font-caption text-caption text-on-surface">
                            <div className="text-outline mb-1">가상계좌 입금 전용</div>
                            <div className="font-bold text-primary font-body-sm text-body-sm">신한 110-492-910283</div>
                            <div className="text-outline mt-1">예금주: (주)팀바이커머스</div>
                        </div>
                    </div>
                </div>
                <div className="pt-space-lg flex items-center justify-between font-caption text-caption text-outline">
                    <div>
                        (주)팀바이 | 사업자등록번호: 214-88-09123 | 통신판매업신고: 제2024-서울강남-01124호 | 서울특별시 강남구 테헤란로 152 강남파이낸스센터
                    </div>
                    <div>© 2025 TEAMBUY Corp. All rights reserved.</div>
                </div>
            </div>
        </footer>
    );
}
