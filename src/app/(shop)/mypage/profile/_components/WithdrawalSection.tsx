'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Heading, Text } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import {
    getCheckWithdrawalQueryKey,
    useCancelWithdrawal,
    useCheckWithdrawal,
    useRequestWithdrawal,
} from '@/api/generated/member-withdrawal-controller/member-withdrawal-controller';
import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

// 막는 이유 코드별로 해결하러 갈 화면
const BLOCKER_LINK: Record<string, { href: string; label: string }> = {
    PAYMENT_PENDING_ORDERS: { href: ROUTES.orders, label: '주문 내역' },
    UNCONFIRMED_ORDERS: { href: ROUTES.orders, label: '주문 내역' },
    CLAIMS_IN_PROGRESS: { href: ROUTES.orders, label: '주문 내역' },
    PAYING_SHARED_ORDERS: { href: ROUTES.groupPurchases, label: '공동구매' },
    ACTIVE_GROUP_PURCHASES: { href: ROUTES.groupPurchases, label: '공동구매' },
    SELLER_UNCONFIRMED_SALES: { href: ROUTES.sellerShipping, label: '배송 관리' },
    SELLER_CLAIMS_IN_PROGRESS: { href: ROUTES.sellerClaims, label: '클레임 관리' },
    SELLER_PENDING_PAYOUTS: { href: ROUTES.sellerSettlements, label: '정산 관리' },
};

const won = (n?: number) => `₩${(n ?? 0).toLocaleString('ko-KR')}`;

// 회원 탈퇴: 가능 여부(막는 이유) → 비밀번호 확인 후 신청 → 30일 탈퇴 대기(취소 가능)
export default function WithdrawalSection() {
    const queryClient = useQueryClient();
    const check = useCheckWithdrawal({ query: { staleTime: 0 } });
    const wallet = useGetMyWallet();
    const info = check.data?.data;
    const balance = wallet.data?.data?.balance ?? 0;

    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = () => void queryClient.invalidateQueries({ queryKey: getCheckWithdrawalQueryKey() });
    const close = () => {
        setOpen(false);
        setPassword('');
        setAgreed(false);
        setError(null);
    };

    const request = useRequestWithdrawal({
        mutation: {
            onSuccess: () => {
                close();
                refresh();
            },
            onError: (e) => {
                setError(errorMessage(e, '탈퇴를 신청하지 못했습니다.'));
                refresh(); // 그사이 막는 이유가 생겼을 수 있음
            },
        },
    });
    const cancel = useCancelWithdrawal({
        mutation: {
            onSuccess: () => refresh(),
            onError: (e) => alert(errorMessage(e, '탈퇴를 취소하지 못했습니다.')),
        },
    });

    const pending = info?.status === 'WITHDRAWAL_PENDING';
    const blockers = info?.blockers ?? [];

    return (
        <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-error" />
            <div className="mb-space-md">
                <Heading level={3}>회원 탈퇴</Heading>
                <Text color="secondary">진행 중인 거래가 없어야 신청할 수 있으며, 신청 후 30일이 지나면 탈퇴가 확정됩니다.</Text>
            </div>

            {check.isPending ? (
                <div className="h-24 rounded bg-surface-container animate-pulse" aria-hidden />
            ) : !info ? (
                <p className="font-body-sm text-body-sm text-error">{errorMessage(check.error, '탈퇴 정보를 불러오지 못했습니다.')}</p>
            ) : pending ? (
                /* 탈퇴 대기 중 */
                <div className="flex flex-col gap-space-md">
                    <div className="bg-error-container/20 border border-error/30 rounded p-space-md flex items-start gap-space-md">
                        <Icon name="schedule" className="text-error text-[24px]" />
                        <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                            <span className="font-label-md text-label-md text-error font-bold">탈퇴 대기 중입니다</span>
                            <span>
                                <strong className="text-on-surface">{formatDateTime(info.scheduledAt)}</strong>에 탈퇴가 확정됩니다. (신청 {formatDateTime(info.requestedAt)})
                            </span>
                            <span>대기 중에는 조회만 할 수 있고 주문·정보 수정은 할 수 없습니다. 탈퇴를 취소하면 다시 이용할 수 있습니다.</span>
                            {balance > 0 && (
                                <span>
                                    남은 예치금 <strong className="text-on-surface">{won(balance)}</strong>은 탈퇴 확정 전에 환급 계좌를 등록하면 돌려받을 수 있습니다.
                                    등록하지 않으면 탈퇴 확정 시 소멸됩니다. (환급 신청은 곧 열립니다)
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button label="탈퇴 취소" variant="secondary" type="button" isLoading={cancel.isPending} isDisabled={cancel.isPending} onClick={() => {
                            if (confirm('탈퇴를 취소할까요? 판매를 중지했던 판매글은 판매자 센터에서 직접 다시 판매해야 합니다.')) cancel.mutate();
                        }} />
                    </div>
                </div>
            ) : (
                /* 신청 전 */
                <div className="flex flex-col gap-space-md">
                    {blockers.length > 0 && (
                        <div className="bg-error-container/20 border border-error/30 rounded p-space-md flex items-start gap-space-md">
                            <Icon name="block" className="text-error text-[24px]" />
                            <div className="flex flex-col gap-space-xs flex-1">
                                <span className="font-label-sm text-label-sm text-error font-bold">아래 거래가 끝나야 탈퇴할 수 있습니다.</span>
                                <ul className="flex flex-col gap-1 font-body-sm text-body-sm text-on-surface-variant">
                                    {blockers.map((b) => {
                                        const link = BLOCKER_LINK[b.code ?? ''];
                                        return (
                                            <li key={b.code} className="flex items-center justify-between gap-space-sm">
                                                <span>
                                                    · {b.message} <strong className="text-on-surface">{b.count}건</strong>
                                                </span>
                                                {link && (
                                                    <Link href={link.href} className="font-label-sm text-label-sm text-primary underline shrink-0">
                                                        {link.label}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-space-md">
                        <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
                            <Icon name="info" className="text-[16px]" />
                            <span>구매확정·취소·환불이 모두 끝나야 진행 중인 거래가 없는 것으로 봅니다.</span>
                        </div>
                        <Button label="회원 탈퇴 신청" variant="destructive" type="button" isDisabled={!info.canWithdraw} onClick={() => setOpen(true)} />
                    </div>
                </div>
            )}

            {/* 신청 모달 */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <form
                        className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl max-w-[480px] w-full max-h-full overflow-y-auto shadow-xl flex flex-col gap-space-md"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setError(null);
                            if (!password) return setError('비밀번호를 입력해주세요.');
                            if (!agreed) return setError('안내 내용을 확인해주세요.');
                            request.mutate({ data: { password } });
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="font-headline-md text-headline-md text-error font-bold flex items-center gap-space-xs">
                                <Icon name="error" />
                                회원 탈퇴 신청
                            </h4>
                            <button className="text-outline hover:text-on-surface" type="button" onClick={close} aria-label="닫기">
                                <Icon name="close" />
                            </button>
                        </div>

                        <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant bg-surface-container p-space-md rounded">
                            <li>· 신청 후 <strong className="text-on-surface">30일</strong>이 지나면 탈퇴가 확정되고, 그 전에는 언제든 취소할 수 있습니다.</li>
                            <li>· 대기 기간에는 조회만 할 수 있고 주문·정보 수정은 할 수 없습니다.</li>
                            <li>· 판매자라면 판매 중인 판매글이 <strong className="text-on-surface">바로 판매 중지</strong>되고, 탈퇴 확정 시 삭제됩니다.</li>
                            <li>· 탈퇴가 확정되면 개인정보는 지워지고, 거래 기록은 법령에 따라 보관됩니다.</li>
                            {balance > 0 && (
                                <li>
                                    · 남은 예치금 <strong className="text-on-surface">{won(balance)}</strong>은 대기 기간에 환급 계좌를 등록해야 돌려받을 수 있으며,
                                    등록하지 않으면 탈퇴 확정 시 소멸됩니다.
                                </li>
                            )}
                        </ul>

                        <label className="flex flex-col gap-space-xs font-label-md text-label-md">
                            비밀번호 확인
                            <input
                                type="password"
                                autoComplete="current-password"
                                className="h-11 px-space-md border border-outline-variant rounded font-body-md text-body-md outline-none focus:border-error"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                        <label className="flex items-center gap-space-xs font-body-sm text-body-sm cursor-pointer">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                            위 안내를 확인했으며 탈퇴를 신청합니다.
                        </label>

                        {error && <p className="font-body-sm text-body-sm text-error" role="alert">{error}</p>}

                        <div className="flex justify-end gap-space-sm">
                            <Button label="취소" variant="secondary" type="button" onClick={close} />
                            <Button label="탈퇴 신청" variant="destructive" type="submit" isLoading={request.isPending} isDisabled={request.isPending} />
                        </div>
                    </form>
                </div>
            )}
        </Card>
    );
}