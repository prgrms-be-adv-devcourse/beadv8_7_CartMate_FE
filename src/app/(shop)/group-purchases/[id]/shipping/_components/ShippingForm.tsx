'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

type ShippingFormProps = {
    notice: ReactNode;
    orderSummary: ReactNode;
    faq: ReactNode;
};

type DeliveryMethod = 'bulk' | 'individual';

const MEMO_OPTIONS = ['부재 시 문 앞에 놓아주세요 (배송사진 전송)', '경비실에 맡겨주세요', '배송 전 미리 연락바랍니다', '택배함에 보관해주세요'];

const FIELD_BOX = 'relative flex items-center h-[42px] bg-surface rounded px-space-sm';
const FIELD_INPUT = 'w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none';

// 배송 수령 방식 + 배송지 입력 폼 + 우측 요약/제출 패널 (불러오기·우편번호 찾기·토스트 포함)
export default function ShippingForm({ notice, orderSummary, faq }: ShippingFormProps) {
    const router = useRouter();
    const [method, setMethod] = useState<DeliveryMethod>('individual');
    const [recipientName, setRecipientName] = useState('김주원');
    const [phoneNumber, setPhoneNumber] = useState('010-8492-4190');
    const [postalCode, setPostalCode] = useState('06164');
    const [baseAddress, setBaseAddress] = useState('서울특별시 강남구 테헤란로 152 (역삼동, 강남파이낸스센터)');
    const [detailAddress, setDetailAddress] = useState('14층 팀바이 스포츠사업부 1402호');
    const [memo, setMemo] = useState(MEMO_OPTIONS[0]);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2800);
    };

    const handleLoadDefault = () => {
        setRecipientName('김주원 (캡틴)');
        setPhoneNumber('010-8492-4190');
        setPostalCode('06164');
        setBaseAddress('서울특별시 강남구 테헤란로 152 (역삼동, 강남파이낸스센터)');
        setDetailAddress('14층 팀바이 스포츠사업부 1402호');
        showToast('저장된 기본 배송지 정보를 불러왔습니다.');
    };

    const handleZipcodeSearch = () => {
        setPostalCode('06164');
        setBaseAddress('서울특별시 강남구 테헤란로 152 (역삼동)');
        showToast('주소 검색 팝업: 서울특별시 강남구 역삼동 자동 매핑 완료');
    };

    const handleSubmit = () => {
        if (!recipientName.trim() || !phoneNumber.trim() || !detailAddress.trim()) {
            alert('필수 입력 항목(받는 사람, 연락처, 상세 주소)을 모두 입력해 주세요.');
            return;
        }
        setSubmitting(true);
        setTimeout(() => {
            showToast('배송 정보가 등록되었습니다. 결제 페이지로 이동합니다.');
            router.push(ROUTES.groupPurchaseResult());
        }, 800);
    };

    const methodCard = (key: DeliveryMethod, title: string, badge: string, desc: string, sub: string) => {
        const selected = method === key;
        return (
            <button
                className={`group text-left p-space-md rounded flex flex-col gap-space-xs relative transition-colors ${
                    selected ? 'bg-surface-container-high' : 'bg-surface hover:bg-surface-container-low'
                }`}
                type="button"
                onClick={() => setMethod(key)}
            >
                <div className="flex items-center justify-between w-full">
                    <span
                        className={`font-label-md text-label-md flex items-center gap-1.5 ${
                            selected ? 'text-primary font-bold' : 'text-secondary group-hover:text-primary'
                        }`}
                    >
                        {selected ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-on-primary rounded-full" />
                            </span>
                        ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-surface-variant inline-block" />
                        )}
                        {title}
                    </span>
                    <span
                        className={`font-caption text-caption px-1.5 py-0.5 rounded ${selected ? 'bg-primary text-on-primary font-bold' : 'bg-surface-variant text-secondary'}`}
                    >
                        {selected ? '현재 선택' : badge}
                    </span>
                </div>
                <p className={`font-body-sm text-body-sm ${selected ? 'text-primary' : 'text-secondary'}`}>{desc}</p>
                <span className={`font-caption text-caption ${selected ? 'text-secondary font-medium' : 'text-outline'}`}>{sub}</span>
            </button>
        );
    };

    return (
        <div className="grid grid-cols-12 gap-gutter items-start">
            {/* Left Column: Delivery Form */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm">
                    <div className="flex items-center justify-between mb-space-md">
                        <div className="flex items-center gap-2">
                            <Icon name="local_shipping" className="text-primary text-[20px]" />
                            <span className="font-headline-sm text-headline-sm text-primary">배송 수령 방식 선택</span>
                        </div>
                        <span className="font-caption text-caption text-secondary">* 주문 팀 정책에 따라 개별 배송이 지원됩니다.</span>
                    </div>
                    <div className="grid grid-cols-2 gap-space-md">
                        {methodCard('bulk', '팀 대표 일괄 수령', '단체 혜택', '지정 운동장 / 클럽하우스 대표자 일괄 전달', '배송지: 서울 잠실 제1보조축구장 관리사무실 앞')}
                        {methodCard('individual', '개인별 자택 개별 배송', '개별 배송', '회원 자택 및 입력 주소지로 택배 개별 직배송', '참여 팀원 개별 배송지 수집 모드 가동')}
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm bg-surface-container-lowest">
                        <div className="flex items-center gap-2">
                            <span className="font-headline-sm text-headline-sm text-primary">수령자 배송지 정보</span>
                            <span className="font-caption text-caption bg-surface-variant text-secondary px-2 py-0.5 rounded">[ 필수 입력 양식 ]</span>
                        </div>
                        <div className="flex items-center gap-space-sm">
                            <button
                                className="h-[34px] px-space-sm bg-surface hover:bg-surface-container text-primary font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors"
                                type="button"
                                onClick={handleLoadDefault}
                            >
                                <Icon name="bookmark" className="text-[16px]" />
                                저장된 기본 배송지 불러오기
                            </button>
                            <Link
                                className="h-[34px] px-space-sm bg-transparent hover:bg-surface-container-low text-secondary hover:text-primary font-label-sm text-label-sm rounded flex items-center gap-1 transition-colors"
                                href={ROUTES.addresses}
                            >
                                <Icon name="history" className="text-[16px]" />
                                최근 배송지 목록
                            </Link>
                        </div>
                    </div>
                    <form className="flex flex-col gap-space-md" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <div className="flex flex-col gap-1.5">
                                <label className="font-body-sm text-body-sm text-on-surface flex items-center gap-1" htmlFor="recipientName">
                                    받는 사람 <span className="font-caption text-caption text-error font-bold">*</span>
                                    <span className="font-caption text-caption text-secondary font-normal">(실명)</span>
                                </label>
                                <div className={FIELD_BOX}>
                                    <Icon name="person" className="text-outline text-[18px] mr-2" />
                                    <input
                                        className={FIELD_INPUT}
                                        id="recipientName"
                                        placeholder="[ 수령인 실명 입력 ]"
                                        required
                                        type="text"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="font-body-sm text-body-sm text-on-surface flex items-center gap-1" htmlFor="phoneNumber">
                                    휴대폰 연락처 <span className="font-caption text-caption text-error font-bold">*</span>
                                    <span className="font-caption text-caption text-secondary font-normal">(배송 기사 연락용)</span>
                                </label>
                                <div className={FIELD_BOX}>
                                    <Icon name="phone_iphone" className="text-outline text-[18px] mr-2" />
                                    <input
                                        className={FIELD_INPUT}
                                        id="phoneNumber"
                                        placeholder="010-XXXX-XXXX"
                                        required
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body-sm text-body-sm text-on-surface flex items-center gap-1" htmlFor="postalCode">
                                우편번호 <span className="font-caption text-caption text-error font-bold">*</span>
                            </label>
                            <div className="flex items-center gap-space-sm max-w-[420px]">
                                <div className="relative flex items-center h-[42px] w-48 bg-surface rounded px-space-sm">
                                    <Icon name="pin_drop" className="text-outline text-[18px] mr-2" />
                                    <input
                                        className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                                        id="postalCode"
                                        placeholder="우편번호 5자리"
                                        readOnly
                                        type="text"
                                        value={postalCode}
                                    />
                                </div>
                                <button
                                    className="h-[42px] px-space-md bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded flex items-center gap-1 whitespace-nowrap transition-colors"
                                    type="button"
                                    onClick={handleZipcodeSearch}
                                >
                                    <Icon name="search" className="text-[18px]" />
                                    우편번호 찾기
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body-sm text-body-sm text-on-surface flex items-center gap-1" htmlFor="baseAddress">
                                기본 주소 <span className="font-caption text-caption text-error font-bold">*</span>
                            </label>
                            <div className={FIELD_BOX}>
                                <Icon name="home" className="text-outline text-[18px] mr-2" />
                                <input
                                    className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none"
                                    id="baseAddress"
                                    placeholder="[ 기본 주소 검색 결과가 표시됩니다 ]"
                                    readOnly
                                    type="text"
                                    value={baseAddress}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body-sm text-body-sm text-on-surface flex items-center gap-1" htmlFor="detailAddress">
                                상세 주소 <span className="font-caption text-caption text-error font-bold">*</span>
                                <span className="font-caption text-caption text-secondary font-normal">(동·호수, 층수, 상세 명칭)</span>
                            </label>
                            <div className={FIELD_BOX}>
                                <Icon name="apartment" className="text-outline text-[18px] mr-2" />
                                <input
                                    className={FIELD_INPUT}
                                    id="detailAddress"
                                    placeholder="[ 상세 주소를 구체적으로 입력하세요 ]"
                                    required
                                    type="text"
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="font-body-sm text-body-sm text-on-surface" htmlFor="deliveryMemoSelect">
                                배송 요청 사항
                            </label>
                            <div className={FIELD_BOX}>
                                <Icon name="forward_to_inbox" className="text-outline text-[18px] mr-2" />
                                <select
                                    className="w-full bg-transparent font-body-md text-body-md text-on-surface focus:outline-none appearance-none cursor-pointer"
                                    id="deliveryMemoSelect"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                >
                                    {MEMO_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                    <option value="custom">직접 입력</option>
                                </select>
                                <Icon name="expand_more" className="text-secondary pointer-events-none text-[20px]" />
                            </div>
                            {memo === 'custom' && (
                                <div className="mt-1.5">
                                    <input
                                        autoFocus
                                        className="w-full h-[40px] px-space-sm bg-surface rounded font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                                        maxLength={50}
                                        placeholder="[ 배송 기사님께 전달할 요청사항을 입력해주세요 (최대 50자) ]"
                                        type="text"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="pt-space-sm mt-space-xs flex flex-col gap-2.5">
                            <label className="flex items-center gap-space-xs cursor-pointer select-none">
                                <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" id="saveAsDefault" type="checkbox" />
                                <span className="font-body-sm text-body-sm text-primary font-medium">이 배송지를 기본 배송지로 저장</span>
                            </label>
                            <label className="flex items-center gap-space-xs cursor-pointer select-none">
                                <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary cursor-pointer" id="applyNextPurchase" type="checkbox" />
                                <span className="font-body-sm text-body-sm text-secondary">소속 팀 다음 공동구매 참여 시 기본 수령지로 자동 적용</span>
                            </label>
                        </div>
                    </form>
                </div>

                {notice}
            </div>

            {/* Right Column: Order Summary Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-md sticky top-32">
                <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col gap-space-md">
                    {orderSummary}
                    <div className="flex flex-col gap-space-xs pt-space-xs">
                        <button
                            className="w-full h-12 bg-primary hover:bg-inverse-surface text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-80"
                            disabled={submitting}
                            type="button"
                            onClick={handleSubmit}
                        >
                            {submitting ? (
                                <>
                                    <Icon name="progress_activity" className="text-[18px] animate-spin" />
                                    <span>배송 정보 검증 중...</span>
                                </>
                            ) : (
                                <>
                                    <span>배송 정보 저장 및 결제 계속하기</span>
                                    <Icon name="arrow_forward" className="text-[18px]" />
                                </>
                            )}
                        </button>
                        <Link
                            className="w-full h-11 bg-surface hover:bg-surface-container-high text-secondary hover:text-primary font-label-md text-label-md rounded flex items-center justify-center transition-colors"
                            href={ROUTES.groupPurchaseCart()}
                        >
                            이전 단계로 돌아가기
                        </Link>
                    </div>
                    <div className="flex items-center justify-center gap-space-md pt-space-xs text-secondary font-caption text-caption">
                        <span className="flex items-center gap-1">
                            <Icon name="lock" className="text-[14px]" /> SSL 암호화 전송
                        </span>
                        <span className="flex items-center gap-1">
                            <Icon name="verified" className="text-[14px]" /> 실시간 주소 검증
                        </span>
                    </div>
                </div>
                {faq}
            </div>

            {/* Toast Notification */}
            <div
                className={`fixed bottom-8 right-8 z-50 transform transition-all duration-300 pointer-events-none ${
                    toast ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                }`}
            >
                <div className="bg-inverse-surface text-inverse-on-surface px-space-lg py-space-sm rounded shadow-xl flex items-center gap-space-sm">
                    <Icon name="check_circle" className="text-[20px] text-surface-bright" />
                    <span className="font-body-sm text-body-sm font-medium">{toast ?? '배송지 정보가 안전하게 저장되었습니다.'}</span>
                </div>
            </div>
        </div>
    );
}
