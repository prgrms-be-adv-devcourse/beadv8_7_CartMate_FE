import type { Metadata } from 'next';
import OtpSetup from './_components/OtpSetup';

export const metadata: Metadata = { title: '관리자 OTP 등록 | TEAMBUY' };

// 관리자 OTP 등록. 관리자 화면(/admin) 밖에 둔다: 등록 전엔 관리자 API가 403이라서
export default function OtpSetupPage() {
    return (
        <div className="flex flex-col w-full items-center justify-center py-12">
            <div className="w-full max-w-[480px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col gap-6">
                <OtpSetup />
            </div>
        </div>
    );
}