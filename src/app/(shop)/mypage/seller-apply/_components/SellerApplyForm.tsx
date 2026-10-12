'use client';

import type { FormEvent } from 'react';
import Icon from '@/components/ui/Icon';

const INPUT_CLASS =
    'h-10 px-space-md border border-outline-variant rounded bg-surface-container-lowest font-body-sm text-on-surface focus:border-primary outline-none transition-colors';
const LABEL_CLASS = 'font-body-sm text-body-sm text-on-surface font-bold';

const BANKS = [
    { value: 'shinhan', label: '신한은행' },
    { value: 'kb', label: '국민은행' },
    { value: 'woori', label: '우리은행' },
    { value: 'nh', label: '농협은행' },
    { value: 'toss', label: '토스뱅크' },
];

// 판매자 파트너 신청서 폼
export default function SellerApplyForm() {
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        alert('판매자 등록 신청이 완료되었습니다. 관리자 승인 후 안내해 드립니다.');
    }

    return (
        <form className="flex flex-col gap-space-lg" id="seller-registration-form" onSubmit={handleSubmit}>
            {/* Section 1: Basic Info */}
            <div className="grid grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-space-xs">
                    <label htmlFor="seller-company" className={LABEL_CLASS}>
                        상호명 (법인명)
                    </label>
                    <input id="seller-company" className={INPUT_CLASS} placeholder="[ 예: (주)팀바이 스포츠 ]" required type="text" />
                </div>
                <div className="flex flex-col gap-space-xs">
                    <label htmlFor="seller-ceo" className={LABEL_CLASS}>
                        대표자명
                    </label>
                    <input id="seller-ceo" className={INPUT_CLASS} placeholder="[ 예: 홍길동 ]" required type="text" />
                </div>
            </div>

            {/* Section 2: Registration & Contact */}
            <div className="grid grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-space-xs">
                    <label htmlFor="seller-biz-no" className={LABEL_CLASS}>
                        사업자등록번호
                    </label>
                    <div className="flex gap-space-xs">
                        <input id="seller-biz-no" className={`${INPUT_CLASS} w-full`} placeholder="[ 000-00-00000 ]" required type="text" />
                        <button
                            className="h-10 px-space-md border border-outline-variant rounded font-label-sm text-label-sm bg-surface-container text-on-surface hover:border-primary whitespace-nowrap"
                            type="button"
                        >
                            중복확인
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-space-xs">
                    <label htmlFor="seller-phone" className={LABEL_CLASS}>
                        담당자 연락처
                    </label>
                    <input id="seller-phone" className={INPUT_CLASS} placeholder="[ 예: 010-0000-0000 ]" required type="tel" />
                </div>
            </div>

            {/* Section 3: Settlement Account */}
            <div className="grid grid-cols-3 gap-gutter">
                <div className="flex flex-col gap-space-xs">
                    <label htmlFor="seller-bank" className={LABEL_CLASS}>
                        정산 은행
                    </label>
                    <select id="seller-bank" className={INPUT_CLASS} defaultValue="">
                        <option value="">[ 은행 선택 ]</option>
                        {BANKS.map((bank) => (
                            <option key={bank.value} value={bank.value}>
                                {bank.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2 flex flex-col gap-space-xs">
                    <label htmlFor="seller-account" className={LABEL_CLASS}>
                        정산 계좌번호
                    </label>
                    <input id="seller-account" className={INPUT_CLASS} placeholder="[ `-` 없이 숫자만 입력 ]" required type="text" />
                </div>
            </div>

            {/* Section 4: Document Upload Wireframe */}
            <div className="flex flex-col gap-space-xs">
                <div className={LABEL_CLASS}>사업자등록증 사본 첨부</div>
                <div className="border border-dashed border-outline-variant rounded p-space-lg flex flex-col items-center justify-center bg-surface-container text-center cursor-pointer hover:border-primary transition-colors">
                    <Icon name="upload_file" className="text-[32px] text-outline mb-space-xs" />
                    <span className="font-label-sm text-label-sm text-on-surface">클릭하여 사업자등록증 이미지 업로드 (PDF, JPG, PNG)</span>
                    <span className="font-caption text-caption text-outline mt-1">[ 파일 최대 용량: 10MB ]</span>
                </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-center gap-space-xs pt-space-xs">
                <input className="w-4 h-4 accent-primary border-outline-variant rounded" id="terms-agree" required type="checkbox" />
                <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms-agree">
                    [필수] 판매자 이용약관 및 정산 정책에 동의하며, 허위 정보 입력 시 입점이 취소될 수 있음을 확인합니다.
                </label>
            </div>

            {/* Submit Button */}
            <div className="pt-space-md border-t border-outline-variant flex justify-end">
                <button
                    className="h-12 px-space-xl bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-opacity-90 transition-colors flex items-center gap-space-xs shadow-sm"
                    type="submit"
                >
                    <span>판매자 등록 신청하기</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                </button>
            </div>
        </form>
    );
}
