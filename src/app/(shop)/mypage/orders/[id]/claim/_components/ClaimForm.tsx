'use client';

import type { FormEvent } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

const REQUEST_TYPES = [
    { value: 'exchange', title: '상품 교환', description: '다른 사이즈나 색상으로 변경합니다.' },
    { value: 'refund', title: '반품 (환불)', description: '상품을 반품하고 환불을 받습니다.' },
];

const REASONS = [
    { value: 'size_mismatch', label: '사이즈 불일치 (작거나 큼)' },
    { value: 'simple_change', label: '단순 변심 (디자인, 색상 불만족)' },
    { value: 'product_defect', label: '상품 불량 및 파손' },
    { value: 'wrong_delivery', label: '오배송 및 누락' },
    { value: 'other', label: '기타 사유' },
];

// 교환/환불 접수 유형 및 사유 입력 폼
export default function ClaimForm({ cancelHref }: { cancelHref: string }) {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        alert('교환/환불 신청이 정상적으로 접수되었습니다.');
    }

    return (
        <form className="flex flex-col gap-space-lg" onSubmit={handleSubmit}>
            {/* Exchange / Refund Radio Selection */}
            <div>
                <div className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">신청 구분</div>
                <div className="grid grid-cols-2 gap-space-md">
                    {REQUEST_TYPES.map((type, index) => (
                        <label
                            key={type.value}
                            className="border border-outline-variant p-space-md rounded flex items-center gap-space-sm cursor-pointer hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low transition-colors"
                        >
                            <input
                                className="w-4 h-4 accent-primary"
                                defaultChecked={index === 0}
                                name="request_type"
                                type="radio"
                                value={type.value}
                            />
                            <div>
                                <div className="font-label-md text-label-md text-on-surface">{type.title}</div>
                                <div className="font-caption text-caption text-outline">{type.description}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Reason Dropdown */}
            <div>
                <label htmlFor="claim-reason" className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">
                    사유 선택
                </label>
                <div className="relative">
                    <select
                        id="claim-reason"
                        name="reason"
                        defaultValue=""
                        className="w-full h-[42px] border border-outline-variant bg-surface-container-lowest px-space-md rounded font-body-sm text-body-sm text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                        <option disabled value="">
                            [ 사유를 선택해 주세요 ]
                        </option>
                        {REASONS.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                                {reason.label}
                            </option>
                        ))}
                    </select>
                    <Icon name="expand_more" className="absolute right-3 top-2.5 text-outline pointer-events-none" />
                </div>
            </div>

            {/* Detailed Reason Textarea */}
            <div>
                <label htmlFor="claim-detail" className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">
                    상세 사유 입력
                </label>
                <textarea
                    id="claim-detail"
                    name="detail"
                    className="w-full border border-outline-variant bg-surface-container-lowest p-space-md rounded font-body-sm text-body-sm text-on-surface outline-none focus:border-primary resize-none placeholder:text-outline"
                    placeholder="[ 상세한 교환/환불 사유 및 교환 원하시는 옵션(사이즈 등)을 입력해 주세요 ]"
                    rows={4}
                />
            </div>

            {/* Upload Photo Placeholder */}
            <div>
                <div className="block font-body-sm text-body-sm text-on-surface font-medium mb-space-xs">상품 사진 첨부 (선택)</div>
                <div className="border border-dashed border-outline-variant p-space-lg rounded text-center bg-surface-container-low hover:border-primary transition-colors cursor-pointer">
                    <Icon name="add_a_photo" className="text-outline text-[32px] mb-space-xs" />
                    <div className="font-label-sm text-label-sm text-on-surface">클릭하여 이미지 업로드 또는 드래그 앤 드롭</div>
                    <div className="font-caption text-caption text-outline mt-1">
                        불량 부위 및 수령 상태 사진을 첨부하시면 빠른 처리가 가능합니다. (최대 5장)
                    </div>
                </div>
            </div>

            {/* Submit Button Area */}
            <div className="pt-space-md border-t border-surface-container flex items-center justify-end gap-space-md">
                <Link
                    href={cancelHref}
                    className="h-11 px-space-xl border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md rounded hover:bg-surface-container transition-colors inline-flex items-center"
                >
                    취소
                </Link>
                <button
                    className="h-11 px-space-xl bg-primary text-on-primary font-label-md rounded hover:bg-opacity-90 transition-colors flex items-center gap-space-xs"
                    type="submit"
                >
                    <Icon name="check" className="text-[18px]" />
                    <span>요청하기</span>
                </button>
            </div>
        </form>
    );
}
