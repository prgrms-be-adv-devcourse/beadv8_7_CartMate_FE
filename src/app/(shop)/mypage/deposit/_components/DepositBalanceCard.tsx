'use client';

import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';

// 예치금 잔액 카드 3장. 지갑은 회원 한 명당 하나이고,
// 사용 가능 금액은 바로 쓸 수 있는 잔액, 동결 중 금액은 결제 후 판매자 정산이 끝나지 않아 홀딩에 보관 중인 금액이다.
export default function DepositBalanceCard() {
    const wallet = useGetMyWallet();
    const balance = wallet.data?.data?.balance;
    const held = wallet.data?.data?.heldBalance;
    const format = (value?: number) => (value === undefined ? '-' : value.toLocaleString('ko-KR'));
    const total = balance === undefined || held === undefined ? undefined : balance + held;

    if (wallet.isError) {
        return (
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-xs mb-space-xl" role="alert">
                <p className="font-body-md text-body-md text-on-surface">{errorMessage(wallet.error, '예치금 잔액을 불러오지 못했습니다.')}</p>
                <button className="self-start px-space-md py-1 border border-outline-variant rounded font-label-sm text-label-sm text-on-surface hover:bg-surface-container" type="button" onClick={() => wallet.refetch()}>
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-xl">
            {/* Card 1: Total Holding Balance */}
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div>
                    <div className="flex items-center justify-between text-secondary mb-space-md">
                        <span className="font-caption text-caption tracking-wider uppercase">[전체 보유 잔액]</span>
                        <Icon name="account_balance" className="text-[20px] text-secondary" />
                    </div>
                    <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-xs">
                        {format(total)} <span className="font-body-md text-body-md font-normal text-secondary">원</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                        예치금 총합계 (사용 가능 금액 + 결제 후 정산 전 동결 금액)
                    </p>
                </div>
            </div>

            {/* Card 2: Available Amount (Primary Emphasis) */}
            <div className="bg-primary text-on-primary p-space-xl rounded shadow-md flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center justify-between text-primary-fixed mb-space-md">
                        <div className="flex items-center gap-space-xs">
                            <span className="font-caption text-caption tracking-wider uppercase">[사용 가능 금액]</span>
                            <span className="px-1.5 py-0.5 bg-primary-container text-on-primary-fixed font-caption text-caption rounded">현재 잔액</span>
                        </div>
                        <Icon name="lock_open" className="text-[20px] text-primary-fixed" />
                    </div>
                    <div className="font-display-xl text-display-xl font-bold tracking-tight mb-space-xs text-on-primary">
                        {format(balance)} <span className="font-headline-sm text-headline-sm font-normal text-primary-fixed">원</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-primary-fixed leading-relaxed">주문과 공동구매 결제에 바로 사용할 수 있는 예치금입니다.</p>
                </div>
            </div>

            {/* Card 3: Held Escrow Amount */}
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col justify-between relative">
                <div>
                    <div className="flex items-center justify-between text-secondary mb-space-md">
                        <div className="flex items-center gap-space-xs">
                            <span className="font-caption text-caption tracking-wider uppercase">[동결 중 금액]</span>
                            <span className="px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant font-caption text-caption rounded">결제 보관</span>
                        </div>
                        <Icon name="lock" className="text-[20px] text-secondary" />
                    </div>
                    <div className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mb-space-xs">
                        {format(held)} <span className="font-body-md text-body-md font-normal text-secondary">원</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                        결제한 금액 중 판매자 정산이 끝나지 않아 보관 중인 돈입니다. 구매 확정 후 정산 시 판매자에게 지급되며, 환불되면 사용 가능 금액으로 돌아옵니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
