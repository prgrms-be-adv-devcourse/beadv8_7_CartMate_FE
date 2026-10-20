'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';

const CURRENT_BALANCE = 152000;

const PRESETS = [10000, 50000, 100000];

const PAYMENT_METHODS = [
    {
        value: 'direct_transfer',
        icon: 'account_balance',
        label: '계좌이체',
        description: '등록된 주거래 계좌: 신한은행 110-***-1234',
    },
    {
        value: 'virtual_account',
        icon: 'domain',
        label: '가상계좌 입금',
        description: '입금 확인 시 즉시 예치금 충전 반영',
    },
    {
        value: 'card',
        icon: 'credit_card',
        label: '신용 / 체크카드',
        description: '개인 및 법인 법정 카드 지원',
    },
];

function parseAmount(value: string) {
    const clean = value.replace(/[^0-9]/g, '');
    return clean === '' ? 0 : parseInt(clean, 10);
}

function formatNumber(num: number) {
    return num.toLocaleString('ko-KR');
}

export default function ChargeForm() {
    const [amount, setAmount] = useState(50000);
    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);

    return (
        <div className="w-full max-w-[600px] bg-surface-container-lowest p-space-xl rounded-xl shadow-xl flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                    <span className="font-caption text-caption text-secondary tracking-widest uppercase">[WIRE-FRAME FORM WF-DP-09]</span>
                    <span className="font-caption text-caption px-space-xs py-0.5 bg-surface-container text-on-surface-variant rounded">예치금 관리</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">예치금 충전</h1>
                <p className="font-body-sm text-body-sm text-secondary">원하는 금액을 입력하여 즉시 예치금을 충전할 수 있습니다.</p>
            </div>

            <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-secondary font-body-sm text-body-sm">
                    <Icon name="account_balance_wallet" className="text-[18px]" />
                    <span>현재 보유 예치금</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{formatNumber(CURRENT_BALANCE)}</span>
                    <span className="font-label-sm text-label-sm text-secondary font-medium">원</span>
                </div>
            </div>

            <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                    <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="charge-input">
                        충전 금액 입력
                    </label>
                    <span className="font-caption text-caption text-secondary">최소 10,000원 이상</span>
                </div>
                <div className="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm focus-within:shadow-md transition-shadow">
                    <input
                        className="w-full h-14 pl-space-md pr-12 font-headline-lg text-headline-lg font-bold text-primary bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:outline-none transition-colors text-right"
                        id="charge-input"
                        inputMode="numeric"
                        placeholder="0"
                        type="text"
                        value={amount === 0 ? '' : formatNumber(amount)}
                        onChange={(e) => setAmount(parseAmount(e.target.value))}
                    />
                    <span className="absolute right-4 font-headline-sm text-headline-sm font-bold text-secondary pointer-events-none">원</span>
                </div>
                <div className="grid grid-cols-4 gap-space-xs pt-space-xs">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset}
                            className="h-10 px-space-xs bg-surface-container hover:bg-surface-container-high rounded flex items-center justify-center font-label-sm text-label-sm text-on-surface transition-colors"
                            type="button"
                            onClick={() => setAmount((prev) => prev + preset)}
                        >
                            + {formatNumber(preset)}원
                        </button>
                    ))}
                    <button
                        className="h-10 px-space-xs bg-surface-container-highest hover:bg-secondary-container rounded flex items-center justify-center font-label-sm text-label-sm text-secondary hover:text-on-secondary-container transition-colors"
                        type="button"
                        onClick={() => setAmount(0)}
                    >
                        직접 입력 초기화
                    </button>
                </div>
                <div className="mt-space-xs p-space-md bg-surface-container rounded-lg flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-secondary">충전 후 보유 잔액</span>
                    <div className="flex items-baseline gap-0.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">{formatNumber(CURRENT_BALANCE + amount)}</span>
                        <span className="font-label-sm text-label-sm text-primary">원</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-space-sm">
                <span className="font-label-md text-label-md text-on-surface font-semibold">결제 수단 선택</span>
                <div className="flex flex-col gap-space-xs">
                    {PAYMENT_METHODS.map((method) => {
                        const selected = method.value === paymentMethod;
                        return (
                            <label
                                key={method.value}
                                className={`flex items-center justify-between p-space-md rounded-lg cursor-pointer transition-all ${
                                    selected ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                                }`}
                            >
                                <div className="flex items-center gap-space-sm">
                                    <Icon name={method.icon} className={`text-[20px]${selected ? '' : ' text-secondary'}`} />
                                    <div className="flex flex-col">
                                        <span className={`font-label-md text-label-md ${selected ? 'font-bold' : 'font-semibold'}`}>{method.label}</span>
                                        <span className={`font-body-sm text-body-sm ${selected ? 'opacity-80' : 'text-secondary'}`}>
                                            {method.description}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    checked={selected}
                                    className="hidden"
                                    name="payment_method"
                                    type="radio"
                                    value={method.value}
                                    onChange={() => setPaymentMethod(method.value)}
                                />
                                <span
                                    className={`material-symbols-outlined w-5 h-5 rounded-full flex items-center justify-center text-[14px] ${
                                        selected ? 'bg-on-primary text-primary font-bold' : 'bg-surface-container-highest text-transparent'
                                    }`}
                                    aria-hidden="true"
                                >
                                    check
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-space-xs text-secondary font-body-sm text-body-sm">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface">
                    <Icon name="info" className="text-[16px]" />
                    <span className="font-bold">충전 유의사항</span>
                </div>
                <ul className="flex flex-col gap-1 pl-space-md list-disc list-outside text-on-surface-variant font-caption text-caption">
                    <li>최소 충전 금액은 10,000원입니다.</li>
                    <li>충전된 예치금은 수수료 없이 언제든 본인 계좌로 환불/출금할 수 있습니다.</li>
                </ul>
            </div>

            <div className="flex flex-col gap-space-xs pt-space-xs">
                <button
                    className="w-full h-12 bg-primary text-on-primary hover:opacity-90 rounded font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs transition-colors shadow-md"
                    type="button"
                >
                    <span>{formatNumber(amount)}원</span>
                    <span>충전하기</span>
                </button>
                <Link
                    className="w-full h-11 bg-surface-container-lowest hover:bg-surface-container text-secondary hover:text-on-surface rounded font-label-md text-label-md transition-colors flex items-center justify-center"
                    href={ROUTES.deposit}
                >
                    취소하고 돌아가기
                </Link>
            </div>
        </div>
    );
}
