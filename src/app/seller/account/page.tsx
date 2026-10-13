import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';

export const metadata: Metadata = { title: '정산 계좌 관리 | TEAMBUY' };

const BANKS = [
    { value: 'shinhan', label: '신한은행' },
    { value: 'kb', label: '국민은행' },
    { value: 'woori', label: '우리은행' },
    { value: 'hana', label: '하나은행' },
    { value: 'nh', label: 'NH농협은행' },
    { value: 'ibk', label: '기업은행' },
];

const NOTICES = ['계좌 정보 변경 시 즉시 반영되지 않고 관리자 승인 후 변경될 수 있습니다.', '타인 명의 계좌는 정산이 제한될 수 있습니다.'];

export default function SellerAccountPage() {
    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto space-y-space-xl">
            {/* Page Title / Header */}
            <div className="flex flex-col space-y-space-xs">
                <div className="text-caption uppercase tracking-wider text-on-surface-variant font-caption">Settlement Account Management</div>
                <h1 className="text-headline-lg font-headline-lg text-on-surface">정산 계좌 관리</h1>
                <p className="text-body-md text-on-surface-variant">판매 대금이 입금될 정산 계좌를 등록하고 관리할 수 있습니다. 안전한 거래를 위해 본인 명의의 계좌만 등록 가능합니다.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
                {/* Left Column: Registered Account Card */}
                <div className="lg:col-span-5 flex flex-col space-y-space-md">
                    <div className="text-label-md font-label-md text-on-surface">등록된 정산 계좌</div>
                    <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant flex flex-col justify-between space-y-space-xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-high/30 rounded-bl-full pointer-events-none" />
                        <div className="flex justify-between items-start z-10">
                            <div className="flex items-center space-x-space-sm">
                                <div className="w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center font-label-md">신한</div>
                                <div>
                                    <div className="text-headline-sm font-headline-sm text-on-surface">신한은행</div>
                                    <div className="text-caption text-on-surface-variant">주거래 정산 계좌</div>
                                </div>
                            </div>
                            <span className="inline-flex items-center px-space-sm py-space-xs rounded-full text-caption bg-surface-container-high text-on-surface border border-outline-variant">인증완료</span>
                        </div>
                        <div className="space-y-space-xs z-10">
                            <div className="text-caption text-on-surface-variant">계좌번호</div>
                            <div className="text-headline-md font-headline-md tracking-wider text-on-surface font-mono">110-***-1234</div>
                        </div>
                        <div className="flex justify-between items-center pt-space-md border-t border-surface-variant z-10">
                            <div className="flex items-center space-x-space-sm">
                                <span className="text-caption text-on-surface-variant">예금주:</span>
                                <span className="text-body-md font-label-md text-on-surface">홍길동</span>
                            </div>
                            <div className="flex space-x-space-sm">
                                <button className="px-space-md py-space-xs text-label-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container transition-all" type="button">수정</button>
                                <button className="px-space-md py-space-xs text-label-sm border border-outline-variant rounded-lg text-error hover:bg-error-container/20 transition-all" type="button">삭제</button>
                            </div>
                        </div>
                    </div>
                    {/* Notice box */}
                    <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/55 text-body-sm text-on-surface-variant space-y-space-xs">
                        <div className="font-label-md text-on-surface flex items-center gap-space-xs">
                            <Icon name="info" className="text-[16px]" />
                            안내사항
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                            {NOTICES.map((notice) => (
                                <li key={notice} className="list-none">{notice}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Right Column: New Account Registration Form */}
                <div className="lg:col-span-7">
                    <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant shadow-sm space-y-space-lg">
                        <div className="border-b border-surface-variant pb-space-md">
                            <h2 className="text-headline-md font-headline-md text-on-surface">새로운 정산 계좌 등록</h2>
                            <p className="text-body-sm text-on-surface-variant mt-space-xs">새로 등록할 계좌 정보를 입력하고 인증을 진행해 주세요.</p>
                        </div>
                        <form className="space-y-space-lg">
                            {/* Bank Select */}
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-md text-on-surface">은행 선택</label>
                                <div className="relative">
                                    <select className="w-full h-[42px] px-space-md bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer" defaultValue="">
                                        <option disabled value="">
                                            [ 은행 선택 ]
                                        </option>
                                        {BANKS.map((bank) => (
                                            <option key={bank.value} value={bank.value}>
                                                {bank.label}
                                            </option>
                                        ))}
                                    </select>
                                    <Icon name="expand_more" className="absolute right-space-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                                </div>
                            </div>
                            {/* Account Holder */}
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-md text-on-surface">예금주</label>
                                <div className="flex gap-space-sm">
                                    <input className="flex-1 h-[42px] px-space-md bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary" placeholder="홍길동 (본인 명의만 가능)" type="text" />
                                    <button className="px-space-lg h-[42px] bg-surface-container border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container-high transition-all whitespace-nowrap" type="button">본인인증</button>
                                </div>
                            </div>
                            {/* Account Number */}
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-md text-on-surface">계좌번호</label>
                                <div className="flex gap-space-sm">
                                    <input className="flex-1 h-[42px] px-space-md bg-surface border border-outline-variant rounded-lg text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary" placeholder="- 없이 숫자만 입력" type="text" />
                                </div>
                            </div>
                            {/* Document Upload Placeholder */}
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-md text-on-surface">통장 사본 업로드</label>
                                <div className="border border-dashed border-outline-variant rounded-lg p-space-lg text-center bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer">
                                    <Icon name="upload_file" className="text-[32px] text-on-surface-variant mb-space-xs" />
                                    <div className="text-label-md text-on-surface">파일을 드래그하거나 클릭하여 업로드</div>
                                    <div className="text-caption text-on-surface-variant mt-1">PDF, JPG, PNG (최대 10MB)</div>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <div className="pt-space-md">
                                <button className="w-full h-[44px] bg-primary text-on-primary rounded-lg text-label-md hover:bg-on-surface transition-all flex items-center justify-center space-x-space-sm" type="submit">
                                    <Icon name="verified" className="text-[18px]" />
                                    <span>계좌 인증 및 등록</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
