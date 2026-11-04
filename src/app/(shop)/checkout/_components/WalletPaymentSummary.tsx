import Link from 'next/link';
import { ApiError, errorMessage } from '@/api/http';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';

type Props = {
    amount: number;
    walletBalance: number;
    // 기한·상태상 결제할 수 있는지. false면 잔액 대신 결제 불가 안내를 보여 준다.
    payable: boolean;
    notPayableMessage?: string;
};

// 예치금 결제 미리보기(결제 금액·보유 예치금·결제 후 잔액)와 잔액 부족·결제 불가 안내.
// 개인 주문 결제(ORD-2)와 공동물품 N빵 결제(GP-5)가 함께 쓴다.
export default function WalletPaymentSummary({
    amount,
    walletBalance,
    payable,
    notPayableMessage = '결제 기한이 지나 결제할 수 없습니다. 주문은 곧 자동으로 취소됩니다.',
}: Props) {
    const sufficient = walletBalance >= amount;
    const shortage = amount - walletBalance;
    return (
        <>
            <dl className="grid grid-cols-[1fr_auto] gap-y-space-xs font-body-sm text-body-sm">
                <dt className="text-on-surface-variant">결제 금액</dt>
                <dd className="text-on-surface font-semibold text-right">{formatPrice(amount)}</dd>
                <dt className="text-on-surface-variant">보유 예치금</dt>
                <dd className="text-on-surface text-right">{formatPrice(walletBalance)}</dd>
                {sufficient && (
                    <>
                        <dt className="text-on-surface-variant">결제 후 잔액</dt>
                        <dd className="text-on-surface text-right">{formatPrice(walletBalance - amount)}</dd>
                    </>
                )}
            </dl>
            {!payable ? (
                <p className="p-space-xs bg-error-container text-on-error-container font-caption text-caption text-center" role="status">
                    {notPayableMessage}
                </p>
            ) : (
                !sufficient && (
                    <div className="p-space-xs bg-error-container text-on-error-container font-caption text-caption flex flex-wrap items-center justify-center gap-x-space-sm" role="status">
                        <span>예치금이 {formatPrice(shortage)} 부족합니다.</span>
                        <Link className="underline font-semibold" href={ROUTES.depositCharge}>
                            예치금 충전하기
                        </Link>
                    </div>
                )
            )}
        </>
    );
}

// 결제 실패 안내. BE 메시지를 그대로 쓰되, 사용자가 다음에 할 일을 알 수 있도록 몇 가지는 바꿔 말한다.
export function payErrorMessage(error: unknown): string {
    const code = error instanceof ApiError ? error.resultCode : undefined;
    if (code?.endsWith('WALLET_INSUFFICIENT_BALANCE')) return '예치금이 부족합니다. 충전한 뒤 다시 결제해주세요.';
    if (code?.endsWith('PAYMENT_ORDER_NOT_PAYABLE') || code?.endsWith('ORDER_PAYMENT_EXPIRED') || code?.endsWith('ORDER_NOT_PAYABLE')) {
        return '결제 기한이 지났거나 이미 처리된 주문이라 결제할 수 없습니다.';
    }
    if (code?.endsWith('PAYMENT_IN_PROGRESS')) return '이미 처리 중인 결제가 있습니다. 잠시 후 화면을 새로고침해 결과를 확인해주세요.';
    return errorMessage(error, '결제하지 못했습니다. 잠시 후 다시 시도해주세요.');
}
