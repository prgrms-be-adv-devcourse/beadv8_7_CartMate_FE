'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMySeller } from '@/api/generated/seller-controller/seller-controller';
import type { SellerResponse } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

const SELLER_TYPE_LABEL: Record<string, string> = {
    INDIVIDUAL: '개인 판매자',
    BUSINESS: '사업자 판매자',
};

const STATUS_BADGE: Record<string, { text: string; className: string }> = {
    ACTIVE: { text: '정상', className: 'bg-surface-container-high text-on-surface border border-outline-variant' },
    SUSPENDED: { text: '정지', className: 'bg-error-container text-on-error-container' },
};

const NOTICES = [
    '판매 대금은 구매확정 후 이 계좌로 정산됩니다.',
    '정산 계좌는 판매자 등록 시 입력한 본인 명의 계좌입니다.',
    '계좌 변경은 현재 고객센터(1644-0000)를 통해 요청할 수 있습니다.',
];

// 판매자 정보와 정산 계좌. 판매자 등록 때 입력한 정보를 보여 준다.
export default function SellerAccountContent() {
    const router = useRouter();
    // 계좌 정보는 다른 화면에서 바뀔 일이 적어 기본 캐시를 그대로 쓴다.
    const query = useMySeller();
    const seller = query.data?.data;
    const status = query.error instanceof ApiError ? query.error.status : undefined;

    // 비로그인이면 로그인 페이지로
    useEffect(() => {
        if (status === 401) {
            router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.sellerAccount)}`);
        }
    }, [status, router]);

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-xl">
            <div className="flex flex-col space-y-space-xs">
                <div className="text-caption uppercase tracking-wider text-on-surface-variant font-caption">Seller Account</div>
                <h1 className="text-headline-lg font-headline-lg text-on-surface">판매자 정보 · 정산 계좌</h1>
                <p className="text-body-md text-on-surface-variant">판매자 등록 때 입력한 정보와 판매 대금이 입금될 정산 계좌입니다.</p>
            </div>

            {query.isPending ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl" aria-hidden>
                    <div className="lg:col-span-5 h-64 rounded-xl bg-surface-container animate-pulse" />
                    <div className="lg:col-span-7 h-64 rounded-xl bg-surface-container animate-pulse" />
                </div>
            ) : status === 403 || status === 404 ? (
                <NotSeller />
            ) : !seller ? (
                <div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center gap-space-md text-center">
                    <p className="text-body-md text-error">{errorMessage(query.error, '판매자 정보를 불러오지 못했습니다.')}</p>
                    <button
                        className="h-10 px-space-lg border border-outline-variant rounded-lg text-label-md hover:bg-surface-container"
                        type="button"
                        onClick={() => void query.refetch()}
                    >
                        다시 시도
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                    <div className="lg:col-span-5 flex flex-col space-y-space-md">
                        <div className="text-label-md font-label-md text-on-surface">정산 계좌</div>
                        <AccountCard seller={seller} />
                        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/55 text-body-sm text-on-surface-variant space-y-space-xs">
                            <div className="font-label-md text-on-surface flex items-center gap-space-xs">
                                <Icon name="info" className="text-[16px]" />
                                안내사항
                            </div>
                            <ul className="space-y-1 pl-1">
                                {NOTICES.map((notice) => (
                                    <li key={notice}>· {notice}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <SellerInfo seller={seller} />
                    </div>
                </div>
            )}
        </div>
    );
}

function AccountCard({ seller }: { seller: SellerResponse }) {
    const badge = STATUS_BADGE[seller.status ?? ''] ?? STATUS_BADGE.ACTIVE;
    const bankShort = (seller.bankName ?? '').replace('은행', '').slice(0, 2) || '은행';

    return (
        <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant flex flex-col justify-between space-y-space-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-high/30 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center space-x-space-sm">
                    <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center font-label-md">{bankShort}</div>
                    <div>
                        <div className="text-headline-sm font-headline-sm text-on-surface">{seller.bankName ?? '-'}</div>
                        <div className="text-caption text-on-surface-variant">정산 계좌</div>
                    </div>
                </div>
                <span className={`inline-flex items-center px-space-sm py-space-xs rounded-full text-caption ${badge.className}`}>{badge.text}</span>
            </div>
            <div className="space-y-space-xs z-10">
                <div className="text-caption text-on-surface-variant">계좌번호</div>
                <div className="text-headline-md font-headline-md tracking-wider text-on-surface font-mono">{seller.maskedAccountNumber ?? '-'}</div>
            </div>
            <div className="flex justify-between items-center pt-space-md border-t border-surface-variant z-10">
                <div className="flex items-center space-x-space-sm">
                    <span className="text-caption text-on-surface-variant">예금주:</span>
                    <span className="text-body-md font-label-md text-on-surface">{seller.accountHolder ?? '-'}</span>
                </div>
                <button
                    className="px-space-md py-space-xs text-label-sm border border-outline-variant rounded-lg text-on-surface-variant opacity-60 cursor-not-allowed"
                    type="button"
                    disabled
                    title="계좌 변경은 고객센터를 통해 요청할 수 있습니다."
                >
                    변경 요청
                </button>
            </div>
        </div>
    );
}

function SellerInfo({ seller }: { seller: SellerResponse }) {
    const isBusiness = seller.sellerType === 'BUSINESS';
    const rows: { label: string; value?: string }[] = [
        { label: '판매자 유형', value: SELLER_TYPE_LABEL[seller.sellerType ?? ''] ?? seller.sellerType },
        { label: '판매자명', value: seller.displayName },
        ...(isBusiness
            ? [
                  { label: '상호', value: seller.businessName },
                  { label: '대표자', value: seller.representativeName },
                  { label: '사업자등록번호', value: seller.businessNumber },
              ]
            : []),
        { label: '연락처', value: seller.phoneNumber },
        { label: '판매자 등록일', value: formatDateTime(seller.registeredAt) },
    ];

    return (
        <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant shadow-sm space-y-space-lg">
            <div className="border-b border-surface-variant pb-space-md">
                <h2 className="text-headline-md font-headline-md text-on-surface">판매자 정보</h2>
                <p className="text-body-sm text-on-surface-variant mt-space-xs">판매글과 정산에 표시되는 정보입니다.</p>
            </div>
            <dl className="grid grid-cols-[140px_1fr] gap-y-space-md text-body-md">
                {rows.map((row) => (
                    <div key={row.label} className="contents">
                        <dt className="text-on-surface-variant">{row.label}</dt>
                        <dd className="text-on-surface font-label-md">{row.value || '-'}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function NotSeller() {
    return (
        <div className="bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center gap-space-md text-center">
            <Icon name="storefront" className="text-[32px] text-outline" />
            <p className="text-body-md text-on-surface">아직 판매자로 등록되지 않았습니다.</p>
            <Link className="h-10 px-space-lg bg-primary text-on-primary rounded-lg text-label-md flex items-center" href={ROUTES.sellerApply}>
                판매자 등록하기
            </Link>
        </div>
    );
}