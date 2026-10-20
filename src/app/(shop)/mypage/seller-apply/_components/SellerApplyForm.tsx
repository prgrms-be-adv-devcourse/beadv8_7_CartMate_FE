'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { apiFetch, ApiError } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

type SellerType = 'INDIVIDUAL' | 'BUSINESS';

type Seller = {
    id: number;
    sellerType: SellerType;
    displayName: string;
    businessName: string | null;
    representativeName: string | null;
    businessNumber: string | null;
    phoneNumber: string;
    bankName: string;
    accountHolder: string;
    maskedAccountNumber: string;
    status: 'ACTIVE' | 'SUSPENDED';
    registeredAt: string;
};

type CheckState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const INPUT_CLASS =
    'h-10 px-space-md border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-on-surface focus:border-primary outline-none transition-colors disabled:bg-surface-container disabled:text-outline';
const LABEL_CLASS = 'font-body-sm text-body-sm text-on-surface font-bold';
const SUB_BUTTON =
    'h-10 px-space-md border border-outline-variant rounded font-label-sm text-label-sm bg-surface-container text-on-surface hover:border-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-default';
const CAPTION = 'font-caption text-caption';

const BANKS = ['신한은행', '국민은행', '우리은행', '하나은행', '농협은행', '기업은행', '카카오뱅크', '토스뱅크'];

// 서버 MemberPolicy 와 같은 규칙
const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
const BUSINESS_NUMBER_REGEX = /^\d{3}-\d{2}-\d{5}$/;
const ACCOUNT_REGEX = /^\d{10,16}$/;

function formatPhone(value: string) {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function formatBusinessNumber(value: string) {
    const d = value.replace(/\D/g, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

const errorMessage = (e: unknown, fallback: string) => (e instanceof ApiError ? e.message : fallback);

export default function SellerApplyForm() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [seller, setSeller] = useState<Seller | null>(null);

    const [sellerType, setSellerType] = useState<SellerType>('INDIVIDUAL');
    const [businessName, setBusinessName] = useState('');
    const [representativeName, setRepresentativeName] = useState('');
    const [businessNumber, setBusinessNumber] = useState('');
    const [businessCheck, setBusinessCheck] = useState<CheckState>('idle');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [agreed, setAgreed] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch<Seller>('/api/members/me/seller');
                setSeller(res.data);
            } catch (e) {
                if (e instanceof ApiError && e.resultCode.startsWith('401')) {
                    router.replace(ROUTES.login);
                    return;
                }
                setFormError(errorMessage(e, '판매자 정보를 불러오지 못했습니다.'));
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const isBusiness = sellerType === 'BUSINESS';

    const handleCheckBusinessNumber = async () => {
        if (!BUSINESS_NUMBER_REGEX.test(businessNumber)) {
            setBusinessCheck('invalid');
            return;
        }
        setBusinessCheck('checking');
        try {
            const res = await apiFetch<{ available: boolean }>(
                `/api/members/me/seller/check-business-number?businessNumber=${encodeURIComponent(businessNumber)}`,
            );
            setBusinessCheck(res.data?.available ? 'available' : 'taken');
        } catch (e) {
            setBusinessCheck('idle');
            alert(errorMessage(e, '확인 중 오류가 발생했습니다.'));
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);

        if (isBusiness) {
            if (!businessName.trim() || !representativeName.trim()) {
                setFormError('상호명과 대표자명을 입력해주세요.');
                return;
            }
            if (businessCheck !== 'available') {
                setFormError('사업자등록번호 중복확인을 해주세요.');
                return;
            }
        }
        if (!PHONE_REGEX.test(phoneNumber)) {
            setFormError('담당자 연락처를 010-0000-0000 형식으로 입력해주세요.');
            return;
        }
        if (!bankName || !accountHolder.trim()) {
            setFormError('정산 은행과 예금주를 입력해주세요.');
            return;
        }
        if (!ACCOUNT_REGEX.test(accountNumber)) {
            setFormError('계좌번호는 숫자만 10~16자리로 입력해주세요.');
            return;
        }
        if (!agreed) {
            setFormError('판매자 이용약관에 동의해주세요.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await apiFetch<Seller>('/api/members/me/seller', {
                method: 'POST',
                body: JSON.stringify({
                    sellerType,
                    businessName: isBusiness ? businessName.trim() : null,
                    representativeName: isBusiness ? representativeName.trim() : null,
                    businessNumber: isBusiness ? businessNumber : null,
                    phoneNumber,
                    bankName,
                    accountHolder: accountHolder.trim(),
                    accountNumber,
                    agreed,
                }),
            });
            alert('판매자 등록이 완료되었습니다. 이제 판매자 센터를 이용할 수 있습니다.');
            setSeller(res.data);
            router.refresh();
        } catch (e) {
            setFormError(errorMessage(e, '판매자 등록 중 오류가 발생했습니다.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <section className="col-span-9 h-[560px] rounded-lg bg-surface-container animate-pulse" />;
    }

    // ===== 이미 등록된 판매자 =====
    if (seller) {
        const rows = [
            { label: '판매자 유형', value: seller.sellerType === 'BUSINESS' ? '사업자' : '개인' },
            { label: '판매자명', value: seller.displayName },
            ...(seller.sellerType === 'BUSINESS'
                ? [
                      { label: '대표자명', value: seller.representativeName ?? '-' },
                      { label: '사업자등록번호', value: seller.businessNumber ?? '-' },
                  ]
                : []),
            { label: '담당자 연락처', value: seller.phoneNumber },
            { label: '정산 계좌', value: `${seller.bankName} ${seller.maskedAccountNumber} (${seller.accountHolder})` },
            { label: '등록일', value: seller.registeredAt.slice(0, 10) },
        ];

        return (
            <section className="col-span-9 bg-surface-container-lowest rounded-lg p-space-xl border border-outline-variant">
                <div className="flex items-center justify-between pb-space-lg mb-space-lg border-b border-outline-variant">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">판매자 정보</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">등록된 판매자 정보와 정산 계좌입니다.</p>
                    </div>
                    <div className="px-space-sm py-1 bg-surface-container text-on-surface font-caption text-caption rounded border border-outline-variant">
                        상태:{' '}
                        <span className={`font-bold ${seller.status === 'ACTIVE' ? 'text-primary' : 'text-error'}`}>
                            {seller.status === 'ACTIVE' ? '판매자 (활성)' : '판매 정지'}
                        </span>
                    </div>
                </div>

                <div className="border border-outline-variant rounded divide-y divide-outline-variant">
                    {rows.map((row) => (
                        <div key={row.label} className="flex items-center px-space-lg py-space-md">
                            <span className="w-36 font-label-md text-label-md text-on-surface-variant">{row.label}</span>
                            <span className="font-body-md text-body-md text-on-surface">{row.value}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-space-lg flex justify-end">
                    <Link
                        href={ROUTES.seller}
                        className="h-12 px-space-xl bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-space-xs shadow-sm"
                    >
                        <span>판매자 센터로 이동</span>
                        <Icon name="arrow_forward" className="text-[18px]" />
                    </Link>
                </div>
            </section>
        );
    }

    // ===== 신청서 =====
    const businessStatus = {
        idle: null,
        checking: { text: '확인 중...', cls: 'text-outline' },
        available: { text: '등록 가능한 사업자등록번호입니다', cls: 'text-on-surface font-semibold' },
        taken: { text: '이미 등록된 사업자등록번호입니다', cls: 'text-error' },
        invalid: { text: '000-00-00000 형식으로 입력해주세요', cls: 'text-error' },
    }[businessCheck];

    return (
        <section className="col-span-9 bg-surface-container-lowest rounded-lg p-space-xl border border-outline-variant">
            <div className="flex items-center justify-between pb-space-lg mb-space-lg border-b border-outline-variant">
                <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">판매자 파트너 신청서</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        판매자 정보와 정산 계좌를 정확히 입력해 주세요. 만 19세 이상만 등록할 수 있습니다.
                    </p>
                </div>
                <div className="px-space-sm py-1 bg-surface-container text-on-surface font-caption text-caption rounded border border-outline-variant">
                    상태: <span className="font-bold text-primary">미등록</span>
                </div>
            </div>

            <form className="flex flex-col gap-space-lg" onSubmit={handleSubmit} noValidate>
                {/* 판매자 유형 */}
                <div className="flex flex-col gap-space-xs">
                    <span className={LABEL_CLASS}>판매자 유형</span>
                    <div className="grid grid-cols-2 gap-space-sm" role="radiogroup">
                        {(
                            [
                                { value: 'INDIVIDUAL', title: '개인 판매자', desc: '동호회·팀 단위로 직접 제작한 상품 판매' },
                                { value: 'BUSINESS', title: '사업자 판매자', desc: '사업자등록증이 있는 업체' },
                            ] as const
                        ).map((opt) => {
                            const active = sellerType === opt.value;
                            return (
                                <label
                                    key={opt.value}
                                    className={`flex flex-col gap-1 p-space-md rounded border-2 cursor-pointer transition-colors ${
                                        active ? 'border-primary bg-surface-container-low' : 'border-outline-variant hover:border-primary'
                                    }`}
                                >
                                    <input
                                        className="sr-only"
                                        type="radio"
                                        name="sellerType"
                                        checked={active}
                                        onChange={() => {
                                            setSellerType(opt.value);
                                            setFormError(null);
                                        }}
                                    />
                                    <span className="font-label-md text-label-md text-on-surface font-bold">{opt.title}</span>
                                    <span className={`${CAPTION} text-on-surface-variant`}>{opt.desc}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 사업자 정보 */}
                {isBusiness && (
                    <>
                        <div className="grid grid-cols-2 gap-gutter">
                            <div className="flex flex-col gap-space-xs">
                                <label htmlFor="seller-company" className={LABEL_CLASS}>
                                    상호명 (법인명)
                                </label>
                                <input
                                    id="seller-company"
                                    className={INPUT_CLASS}
                                    placeholder="예: (주)팀바이 스포츠"
                                    maxLength={100}
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-space-xs">
                                <label htmlFor="seller-ceo" className={LABEL_CLASS}>
                                    대표자명
                                </label>
                                <input
                                    id="seller-ceo"
                                    className={INPUT_CLASS}
                                    placeholder="예: 홍길동"
                                    maxLength={50}
                                    value={representativeName}
                                    onChange={(e) => setRepresentativeName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-space-xs">
                            <label htmlFor="seller-biz-no" className={LABEL_CLASS}>
                                사업자등록번호
                            </label>
                            <div className="flex gap-space-xs max-w-[480px]">
                                <input
                                    id="seller-biz-no"
                                    className={`${INPUT_CLASS} w-full`}
                                    placeholder="000-00-00000"
                                    inputMode="numeric"
                                    value={businessNumber}
                                    onChange={(e) => {
                                        setBusinessNumber(formatBusinessNumber(e.target.value));
                                        setBusinessCheck('idle');
                                    }}
                                />
                                <button
                                    className={SUB_BUTTON}
                                    type="button"
                                    onClick={handleCheckBusinessNumber}
                                    disabled={businessCheck === 'checking' || businessCheck === 'available'}
                                >
                                    {businessCheck === 'available' ? '확인완료' : '중복확인'}
                                </button>
                            </div>
                            {businessStatus && <span className={`${CAPTION} ${businessStatus.cls}`}>{businessStatus.text}</span>}
                        </div>
                    </>
                )}

                {/* 연락처 */}
                <div className="flex flex-col gap-space-xs max-w-[480px]">
                    <label htmlFor="seller-phone" className={LABEL_CLASS}>
                        담당자 연락처
                    </label>
                    <input
                        id="seller-phone"
                        className={INPUT_CLASS}
                        placeholder="010-0000-0000"
                        type="tel"
                        inputMode="numeric"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                    />
                </div>

                {/* 정산 계좌 */}
                <div className="grid grid-cols-3 gap-gutter">
                    <div className="flex flex-col gap-space-xs">
                        <label htmlFor="seller-bank" className={LABEL_CLASS}>
                            정산 은행
                        </label>
                        <select id="seller-bank" className={INPUT_CLASS} value={bankName} onChange={(e) => setBankName(e.target.value)}>
                            <option value="">은행 선택</option>
                            {BANKS.map((bank) => (
                                <option key={bank} value={bank}>
                                    {bank}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                        <label htmlFor="seller-holder" className={LABEL_CLASS}>
                            예금주
                        </label>
                        <input
                            id="seller-holder"
                            className={INPUT_CLASS}
                            placeholder="예: 홍길동"
                            maxLength={50}
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-space-xs">
                        <label htmlFor="seller-account" className={LABEL_CLASS}>
                            정산 계좌번호
                        </label>
                        <input
                            id="seller-account"
                            className={INPUT_CLASS}
                            placeholder="- 없이 숫자만 입력"
                            inputMode="numeric"
                            maxLength={16}
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                </div>
                <p className={`${CAPTION} text-outline -mt-space-sm`}>정산 계좌는 공동구매 판매 대금 정산에 사용되며, 화면에는 뒤 4자리만 표시됩니다.</p>

                {/* 동의 */}
                <label className="flex items-start gap-space-xs pt-space-xs cursor-pointer">
                    <input
                        className="mt-0.5 w-4 h-4 accent-primary border-outline-variant rounded"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                        [필수] 판매자 이용약관 및 정산 정책에 동의하며, 허위 정보 입력 시 판매자 자격이 정지될 수 있음을 확인합니다.
                    </span>
                </label>

                {formError && <p className="font-body-sm text-body-sm text-error">{formError}</p>}

                <div className="pt-space-md border-t border-outline-variant flex justify-end">
                    <button
                        className="h-12 px-space-xl bg-primary text-on-primary rounded font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-space-xs shadow-sm disabled:opacity-60"
                        type="submit"
                        disabled={submitting}
                    >
                        <span>{submitting ? '등록 중...' : '판매자 등록하기'}</span>
                        <Icon name="arrow_forward" className="text-[18px]" />
                    </button>
                </div>
            </form>
        </section>
    );
}