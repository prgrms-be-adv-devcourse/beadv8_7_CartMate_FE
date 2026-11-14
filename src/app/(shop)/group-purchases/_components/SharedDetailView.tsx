'use client';

import Link from 'next/link';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { useState } from 'react';
import { itemPermissions, managePermissions, memberAmount, statusBadgeClass, statusLabel } from '../_lib/sharedGroupPurchase';
import { useSharedPurchaseActions } from '../_lib/useSharedPurchaseActions';
import SharedDetailGate, { type SharedDetailContext } from './SharedDetailGate';
import SharedItemRow from './SharedItemRow';
import SharedManagePanel, { actionErrorMessage } from './SharedManagePanel';
import { AmountSummary, DeadlineBox, DetailSkeleton, ParticipantProgress, StateBanner } from './SharedStatusParts';

// 공동물품(N빵) 공동구매 상세 · 현황판. 참여자만 볼 수 있다.
export default function SharedDetailView() {
    return <SharedDetailGate skeleton={<DetailSkeleton />}>{(ctx) => <DetailContent {...ctx} />}</SharedDetailGate>;
}

function DetailContent({ id, purchase, remainingMs, deadlinePassed, refreshing, refresh }: SharedDetailContext) {
    const { user } = useCurrentUser();
    const items = purchase.items ?? [];
    const members = purchase.members ?? [];
    const { canAdd } = itemPermissions(purchase, deadlinePassed);
    const editableNow = purchase.editable === true && !deadlinePassed;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    const unavailableCount = items.filter((item) => item.purchasable === false).length;
    // 내보낼 참여자가 있을 때만 관리 열을 둔다(만든 사람은 내보낼 수 없음)
    const canKick = managePermissions(purchase, deadlinePassed).canKick && members.some((member) => !member.creator);
    const actions = useSharedPurchaseActions(id);
    const { kick } = actions;
    const [kickError, setKickError] = useState<string | null>(null);
    const kickMember = (memberId: number, nickname: string) => {
        if (!window.confirm(`'${nickname}' 님을 공동구매에서 내보낼까요?\n그 사람이 담은 상품은 그대로 남고, 다시 참여하려면 초대 링크가 필요합니다.`)) return;
        setKickError(null);
        kick.mutate({ id, targetMemberId: memberId }, { onError: (e) => setKickError(actionErrorMessage(e, '내보내지 못했습니다.')) });
    };
    const chips = [
        { label: '담긴 상품', value: `${items.length}종`, warn: false },
        { label: '총 수량', value: `${totalQuantity}개`, warn: false },
        { label: '구매 불가', value: `${unavailableCount}종`, warn: unavailableCount > 0 },
    ];

    return (
        <div className="flex flex-col w-full gap-space-lg">
            <StateBanner purchase={purchase} deadlinePassed={deadlinePassed} />

            {/* 현황판 */}
            <div className="grid grid-cols-12 gap-gutter">
                <Card className="col-span-12 lg:col-span-8 flex flex-col gap-space-md">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={statusBadgeClass(purchase.status, editableNow)}>{statusLabel(purchase.status, editableNow)}</span>
                                <span className="font-caption text-caption text-secondary">공동물품 · #{id}</span>
                            </div>
                            <Heading level={1}>{purchase.title}</Heading>
                            <p className="font-caption text-caption text-secondary mt-1">
                                만든 사람 {purchase.creatorNickname ?? '-'}
                                {purchase.viewerIsCreator ? ' (나)' : ''}
                            </p>
                        </div>
                        <div className="md:w-56 shrink-0">
                            <DeadlineBox purchase={purchase} remainingMs={remainingMs} />
                        </div>
                    </div>
                    <div className="bg-surface rounded-lg p-space-md">
                        <ParticipantProgress purchase={purchase} />
                    </div>
                    <div className="flex flex-wrap items-center gap-space-sm">
                        {chips.map((chip) => (
                            <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded">
                                <span className={`w-2 h-2 rounded-full ${chip.warn ? 'bg-error' : 'bg-primary'}`} />
                                <span className="font-label-sm text-label-sm text-on-surface">{chip.label}</span>
                                <span className={`font-label-sm text-label-sm font-bold ${chip.warn ? 'text-error' : 'text-primary'}`}>{chip.value}</span>
                            </div>
                        ))}
                        <Button
                            label="새로고침"
                            className="ml-auto"
                            size="sm"
                            variant="ghost"
                            icon={<Icon name="sync" className={`text-[16px]${refreshing ? ' animate-spin' : ''}`} />}
                            onClick={refresh}
                            isDisabled={refreshing}
                        />
                    </div>
                </Card>
                <Card className="col-span-12 lg:col-span-4 flex flex-col gap-space-md" variant="blue">
                    <div className="flex items-center gap-space-xs text-primary">
                        <Icon name="calculate" className="text-[20px]" />
                        <Heading level={2}>예상 금액</Heading>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md rounded">
                        <AmountSummary purchase={purchase} />
                    </div>
                </Card>
            </div>

            {/* 담긴 상품 */}
            <Card className="flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                        <Heading level={2}>공동 장바구니</Heading>
                        <Badge label={`${items.length}종`} variant="neutral" />
                    </div>
                    <div className="flex items-center gap-space-xs">
                        {canAdd && (
                            <Button
                                label="상품 담기"
                                href={ROUTES.groupPurchaseOptions(id)}
                                as={Link}
                                variant="secondary"
                                icon={<Icon name="add_circle" className="text-[18px]" />}
                            />
                        )}
                        <Button
                            label={canAdd ? '품목 편집' : purchase.status === 'FROZEN' && purchase.viewerIsCreator ? '품목 정리' : '장바구니 보기'}
                            href={ROUTES.groupPurchaseCart(id)}
                            as={Link}
                            variant="primary"
                            icon={<Icon name={canAdd || purchase.status === 'FROZEN' ? 'edit' : 'shopping_cart'} className="text-[18px]" />}
                        />
                    </div>
                </div>
                {items.length === 0 ? (
                    <EmptyState title="아직 담긴 상품이 없습니다." description="상품이 없으면 수정 기한이 지날 때 공동구매가 취소됩니다." icon={<Icon name="shopping_cart" className="text-[40px]" />} />
                ) : (
                    <div className="flex flex-col gap-space-sm">
                        {items.map((item) => (
                            <SharedItemRow key={item.itemId} item={item} />
                        ))}
                    </div>
                )}
            </Card>

            {/* 참여자 */}
            <Card>
                <div className="flex items-center gap-space-sm pb-space-md">
                    <Heading level={2}>참여자</Heading>
                    <Badge label={`${members.length}명 / 최대 ${purchase.maxParticipants ?? '-'}명`} variant="neutral" />
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface">
                                <th className="py-3 px-3 w-12 text-center">No</th>
                                <th className="py-3 px-4">참여자</th>
                                <th className="py-3 px-4 text-center">참여 일시</th>
                                <th className="py-3 px-4 text-right">예상 결제액</th>
                                {canKick && <th className="py-3 px-4 text-center w-28">관리</th>}
                            </tr>
                        </thead>
                        <tbody className="font-body-sm text-body-sm divide-y divide-surface-container">
                            {members.map((member, i) => {
                                const isMe = user?.id !== undefined && member.memberId === user.id;
                                return (
                                    <tr key={member.memberId} className={member.creator ? 'bg-surface-container-low' : ''}>
                                        <td className="py-3.5 px-3 text-center font-label-sm text-secondary">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-label-md text-label-md text-primary ${member.creator || isMe ? 'font-bold' : 'font-medium'}`}>
                                                    {member.nickname ?? '알 수 없음'}
                                                    {isMe ? ' (나)' : ''}
                                                </span>
                                                {member.creator && <span className="font-caption text-caption bg-primary text-on-primary px-1.5 py-0.5 rounded">만든 사람</span>}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center text-secondary">{formatDateTime(member.joinedAt)}</td>
                                        <td className="py-3.5 px-4 text-right font-label-md text-label-md text-primary">
                                            {formatPrice(memberAmount(purchase, member.creator))}
                                        </td>
                                        {canKick && (
                                            <td className="py-3.5 px-4 text-center">
                                                {!member.creator && member.memberId !== undefined && (
                                                    <button
                                                        className="h-8 px-space-sm rounded border border-outline-variant text-error font-label-sm text-label-sm hover:bg-error-container/40 disabled:opacity-60"
                                                        type="button"
                                                        disabled={kick.isPending || actions.close.isPending || actions.close.isSuccess}
                                                        onClick={() => kickMember(member.memberId as number, member.nickname ?? '참여자')}
                                                        aria-label={`${member.nickname ?? '참여자'} 내보내기`}
                                                    >
                                                        내보내기
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {kickError && (
                    <p className="mt-space-sm p-space-sm rounded bg-error-container text-on-error-container font-body-sm text-body-sm" role="alert">
                        {kickError}
                    </p>
                )}
                <div className="pt-space-md flex items-start gap-1 text-secondary font-caption text-caption">
                    <Icon name="info" className="text-[16px]" />
                    <span>예상 결제액은 지금 담긴 상품 기준이며, 마감 시점의 인원과 품목으로 최종 확정됩니다.</span>
                </div>
            </Card>

            <SharedManagePanel id={id} purchase={purchase} deadlinePassed={deadlinePassed} actions={actions} />
        </div>
    );
}
