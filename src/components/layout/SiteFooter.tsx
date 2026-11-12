import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

const FOOTER_LINKS = [
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
        <footer className="w-full border-t border-outline-variant bg-surface-container-low">
            <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
                <div className="grid gap-8 border-b border-outline-variant pb-8 md:grid-cols-[2fr_1fr_1fr]">
                    <div className="max-w-md">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">TEAMBUY</span>
                            <span className="font-caption text-caption text-outline">팀 장비 공동구매</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            팀에 필요한 상품을 찾고, 구성원과 함께 공동구매를 준비할 수 있습니다.
                        </p>
                    </div>
                    {FOOTER_LINKS.map((group) => (
                        <div key={group.title}>
                            <div className="mb-3 font-label-sm text-label-sm font-bold text-on-surface">
                                {group.title}
                            </div>
                            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant">
                                {group.links.map((link) => (
                                    <Link key={link.label} href={link.href} className="hover:text-on-surface">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-1 pt-5 font-caption text-caption text-outline sm:flex-row sm:items-center sm:justify-between">
                    <span>서비스 관련 문의는 고객센터를 이용해 주세요.</span>
                    <span>© TEAMBUY</span>
                </div>
            </div>
        </footer>
    );
}
