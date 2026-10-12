'use client';

import { useState, type FormEvent } from 'react';
import Icon from '@/components/ui/Icon';

const INQUIRY_TYPES = [
    { value: 'roster', label: '로스터 / 마킹 커스텀 문의' },
    { value: 'group', label: '공동구매 개설 및 MOQ 관련' },
    { value: 'payment', label: '결제 / 예치금 / 세금계산서' },
    { value: 'delivery', label: '배송 및 샘플키트 수령' },
    { value: 'other', label: '기타 문의' },
];

// 페이지 헤더 + 토글형 새 문의 작성 폼
export default function InquiryComposer() {
    const [open, setOpen] = useState(false);

    function toggle() {
        if (!open) window.scrollTo({ top: 0, behavior: 'smooth' });
        setOpen(!open);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        alert('[알림] 1:1 문의가 정상적으로 등록되었습니다.');
        setOpen(false);
    }

    return (
        <>
            {/* Page Header */}
            <div className="flex items-center justify-between pb-space-lg mb-space-xl">
                <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs font-caption text-caption uppercase text-outline tracking-wider">
                        <span>CUSTOMER SUPPORT</span>
                        <span>/</span>
                        <span className="text-on-surface">1:1 INQUIRIES</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">1:1 문의 내역 및 작성</h1>
                </div>
                <button
                    className="h-11 px-space-xl bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-space-xs hover:bg-on-surface transition-colors cursor-pointer"
                    type="button"
                    onClick={toggle}
                >
                    <Icon name="edit_note" className="text-[18px]" />
                    <span>문의 작성하기</span>
                </button>
            </div>

            {/* Inquiry Form Section */}
            {open && (
                <div className="mb-space-xl transition-all duration-300">
                    <div className="max-w-[480px] mx-auto p-space-xl bg-surface-container-lowest border border-outline-variant rounded-lg">
                        <div className="flex items-center justify-between pb-space-md mb-space-lg border-b border-outline-variant">
                            <div>
                                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">새 문의 등록</h2>
                                <p className="font-body-sm text-body-sm text-outline mt-0.5">궁금하신 사항을 남겨주시면 담당자가 신속하게 답변해 드립니다.</p>
                            </div>
                            <button className="text-outline hover:text-on-surface" type="button" aria-label="닫기" onClick={toggle}>
                                <Icon name="close" />
                            </button>
                        </div>
                        <form className="flex flex-col gap-space-lg" onSubmit={handleSubmit}>
                            {/* Inquiry Type Selection */}
                            <div className="flex flex-col gap-space-xs">
                                <label htmlFor="inquiry-type" className="font-body-sm text-body-sm text-on-surface font-medium">
                                    문의 유형
                                </label>
                                <div className="relative">
                                    <select
                                        id="inquiry-type"
                                        defaultValue=""
                                        className="w-full h-[42px] px-space-md bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-on-surface outline-none focus:border-primary appearance-none cursor-pointer"
                                    >
                                        <option value="">[ 문의 유형을 선택하세요 ]</option>
                                        {INQUIRY_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]" />
                                </div>
                            </div>

                            {/* Title Input */}
                            <div className="flex flex-col gap-space-xs">
                                <label htmlFor="inquiry-title" className="font-body-sm text-body-sm text-on-surface font-medium">
                                    제목
                                </label>
                                <input
                                    id="inquiry-title"
                                    className="w-full h-[42px] px-space-md bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-on-surface outline-none focus:border-primary placeholder:text-outline"
                                    placeholder="[ 제목을 입력해주세요 ]"
                                    type="text"
                                />
                            </div>

                            {/* Content Textarea */}
                            <div className="flex flex-col gap-space-xs">
                                <label htmlFor="inquiry-content" className="font-body-sm text-body-sm text-on-surface font-medium">
                                    문의 내용
                                </label>
                                <textarea
                                    id="inquiry-content"
                                    className="w-full p-space-md bg-surface-container-lowest border border-outline-variant rounded font-body-sm text-on-surface outline-none focus:border-primary placeholder:text-outline resize-none"
                                    placeholder="[ 구체적인 문의 내용을 작성해주세요. (주문번호, 사이즈, 수량 등) ]"
                                    rows={5}
                                />
                            </div>

                            {/* File Attachment Wireframe */}
                            <div className="flex flex-col gap-space-xs">
                                <div className="font-body-sm text-body-sm text-on-surface font-medium">첨부 파일 (선택)</div>
                                <div className="border border-dashed border-outline-variant rounded p-space-md bg-surface text-center cursor-pointer hover:border-primary transition-colors">
                                    <div className="flex items-center justify-center gap-space-xs text-outline mb-1">
                                        <Icon name="upload_file" className="text-[20px]" />
                                        <span className="font-body-sm text-body-sm">파일을 드래그하거나 클릭하여 첨부하세요</span>
                                    </div>
                                    <span className="font-caption text-caption text-outline">최대 10MB / JPG, PNG, PDF, AI</span>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center gap-space-sm pt-space-sm">
                                <button
                                    className="flex-1 h-11 bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors"
                                    type="button"
                                    onClick={toggle}
                                >
                                    취소
                                </button>
                                <button
                                    className="flex-1 h-11 bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-on-surface transition-colors"
                                    type="submit"
                                >
                                    등록하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
