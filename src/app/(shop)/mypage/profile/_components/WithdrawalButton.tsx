'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

// 회원 탈퇴 신청 버튼 + 탈퇴 불가 안내 모달
export default function WithdrawalButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className="h-[44px] px-space-xl border border-error bg-surface text-error hover:bg-error hover:text-on-error font-label-md rounded transition-colors"
                type="button"
                onClick={() => setOpen(true)}
            >
                회원 탈퇴 신청
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl max-w-[480px] w-full shadow-xl">
                        <div className="flex items-center justify-between pb-space-md border-b border-surface-container mb-space-md">
                            <h4 className="font-headline-md text-headline-md text-error font-bold flex items-center gap-space-xs">
                                <Icon name="error" />
                                탈퇴 불가 안내
                            </h4>
                            <button className="text-outline hover:text-on-surface" type="button" onClick={() => setOpen(false)}>
                                <Icon name="close" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-space-md mb-space-xl">
                            <p className="font-body-md text-body-md text-on-surface">
                                현재 계정에 <strong className="text-primary font-bold">진행 중인 공동구매</strong> 또는{' '}
                                <strong className="text-primary font-bold">동결된 예치금</strong>이 남아 있어 즉시 탈퇴할 수 없습니다.
                            </p>
                            <div className="bg-surface-container p-space-md border border-outline-variant rounded font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-1">
                                <div>· 참여 중인 공동구매: 2건 (배송 대기 및 제작 중)</div>
                                <div>· 잔여 예치금: ₩ 2,450,000</div>
                            </div>
                            <p className="font-caption text-caption text-outline">예치금 환불 및 공동구매 취소/정산 완료 후 다시 시도해 주세요.</p>
                        </div>
                        <div className="flex justify-end gap-space-sm">
                            <button
                                className="h-[40px] px-space-lg bg-primary text-on-primary font-label-md rounded hover:bg-primary/90"
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
