'use client';

import { useState } from 'react';

export default function PaymentConsent() {
    const [consent, setConsent] = useState(true);

    const handlePay = () => {
        if (!consent) {
            alert('[경고] 구매 및 예치금 차감 동의가 필요합니다.');
            return;
        }
        alert('[결제 완료] 예치금 98,000원이 정상 차감되었습니다.\n주문이 접수되었습니다.');
    };

    return (
        <div className="pt-space-md border-t border-surface-container flex flex-col gap-space-md">
            <label className="flex items-start gap-space-xs cursor-pointer select-none">
                <input
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-primary"
                    id="order-consent"
                    type="checkbox"
                />
                <span className="font-caption text-caption text-secondary">
                    주문 상품 정보, 배송지 및 최종 결제 금액을 확인하였으며, 구매 진행 및 예치금 즉시 차감에 동의합니다.
                </span>
            </label>
            <button
                className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90 active:opacity-95 transition-opacity"
                type="button"
                onClick={handlePay}
            >
                98,000원 결제하기
            </button>
        </div>
    );
}
