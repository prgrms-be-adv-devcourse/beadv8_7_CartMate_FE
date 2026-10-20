'use client';

import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { inviteUrl, itemPermissions, memberAmount, myAmount, statusBadgeClass, statusLabel } from '../_lib/sharedGroupPurchase';
import CopyLinkButton from './CopyLinkButton';
import SharedDetailGate, { type SharedDetailContext } from './SharedDetailGate';
import SharedItemRow from './SharedItemRow';
import { AmountSummary, ComingSoonButton, DeadlineBox, DetailSkeleton, ParticipantProgress, StateBanner } from './SharedStatusParts';

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
    const isActive = purchase.status === 'OPEN' || purchase.status === 'FROZEN';
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
                <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={statusBadgeClass(purchase.status, editableNow)}>{statusLabel(purchase.status, editableNow)}</span>
                                <span className="font-caption text-caption text-secondary">공동물품 (N빵) · #{id}</span>
                            </div>
                            <h1 className="font-headline-md text-headline-md text-primary tracking-tight break-all">{purchase.title}</h1>
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
                        <button
                            className="ml-auto flex items-center gap-1 px-2 py-1 rounded text-secondary hover:bg-surface font-caption text-caption disabled:opacity-60"
                            type="button"
                            onClick={refresh}
                            disabled={refreshing}
                        >
                            <Icon name="sync" className={`text-[16px]${refreshing ? ' animate-spin' : ''}`} />
                            새로고침
                        </button>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-4 bg-surface-container-high rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-xs text-primary">
                        <Icon name="calculate" className="text-[20px]" />
                        <h2 className="font-headline-sm text-headline-sm">N빵 예상 금액</h2>
                    </div>
                    <div className="bg-surface-container-lowest p-space-md rounded">
                        <AmountSummary purchase={purchase} />
                    </div>
                </div>
            </div>

            {/* 담긴 상품 */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-xs">
                        <h2 className="font-headline-sm text-headline-sm text-primary">공동 장바구니</h2>
                        <span className="font-caption text-caption text-secondary px-2 py-0.5 bg-surface-container rounded-full">{items.length}종</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                        {canAdd && (
                            <Link
                                className="h-10 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-md text-label-md flex items-center gap-1.5"
                                href={ROUTES.groupPurchaseOptions(id)}
                            >
                                <Icon name="add_circle" className="text-[18px]" />
                                상품 담기
                            </Link>
                        )}
                        <Link
                            className="h-10 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1.5"
                            href={ROUTES.groupPurchaseCart(id)}
                        >
                            <Icon name={canAdd || purchase.status === 'FROZEN' ? 'edit' : 'shopping_cart'} className="text-[18px]" />
                            {canAdd ? '품목 편집' : purchase.status === 'FROZEN' && purchase.viewerIsCreator ? '품목 정리' : '장바구니 보기'}
                        </Link>
                    </div>
                </div>
                {items.length === 0 ? (
                    <div className="bg-surface-container-low rounded-lg p-space-xl flex flex-col items-center gap-space-sm text-center">
                        <Icon name="shopping_cart" className="text-[40px] text-outline" />
                        <p className="font-body-md text-body-md text-on-surface">아직 담긴 상품이 없습니다.</p>
                        <p className="font-caption text-caption text-secondary">상품이 없으면 수정 기한이 지날 때 공동구매가 취소됩니다.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-space-sm">
                        {items.map((item) => (
                            <SharedItemRow key={item.itemId} item={item} />
                        ))}
                    </div>
                )}
            </section>

            {/* 참여자 */}
            <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <div className="flex items-center gap-space-xs pb-space-md">
                    <h2 className="font-headline-sm text-headline-sm text-primary">참여자</h2>
                    <span className="font-caption text-caption text-secondary px-2 py-0.5 bg-surface-container rounded-full">
                        {members.length}명 / 최대 {purchase.maxParticipants ?? '-'}명
                    </span>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container font-label-sm text-label-sm text-on-surface">
                                <th className="py-3 px-3 w-12 text-center">No</th>
                                <th className="py-3 px-4">참여자</th>
                                <th className="py-3 px-4 text-center">참여 일시</th>
                                <th className="py-3 px-4 text-right">예상 결제액</th>
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
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="pt-space-md flex items-start gap-1 text-secondary font-caption text-caption">
                    <Icon name="info" className="text-[16px]" />
                    <span>예상 결제액은 지금 담긴 상품 기준이며, 마감 시점의 인원과 품목으로 최종 확정됩니다.</span>
                </div>
            </section>

            {/* 초대 · 관리 */}
            {isActive && (
                <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
                    <h2 className="font-headline-sm text-headline-sm text-primary">{purchase.viewerIsCreator ? '공동구매 관리' : '참여 관리'}</h2>
                    <div className="flex flex-wrap gap-space-sm">
                        {editableNow && purchase.inviteCode && (
                            <CopyLinkButton
                                url={inviteUrl(window.location.origin, id, purchase.inviteCode)}
                                label="초대 링크 복사"
                                icon="link"
                                className="h-11 px-space-md rounded bg-primary text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:opacity-90"
                                copiedClassName="opacity-90"
                            />
                        )}
                        {purchase.viewerIsCreator ? (
                            <>
                                <ComingSoonButton icon="lock_clock" label="지금 마감하기" />
                                <ComingSoonButton icon="group_add" label="최대 인원 늘리기" />
                                <ComingSoonButton icon="cancel" label="공동구매 취소" />
                            </>
                        ) : (
                            <ComingSoonButton icon="logout" label="공동구매 나가기" />
                        )}
                    </div>
                </section>
            )}
            {purchase.status === 'CLOSED' && (
                <section className="w-full max-w-[520px] mx-auto bg-surface-container-lowest rounded-xl p-space-xl shadow-md flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <span className="font-body-md text-body-md text-secondary">결제할 내 몫 금액</span>
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">{formatPrice(myAmount(purchase))}</span>
                    </div>
                    <ComingSoonButton icon="account_balance_wallet" label="내 몫 결제하기" className="w-full h-12" />
                </section>
            )}
            {/* 다시 만들기(복제)는 마감·취소된 공동구매를 만든 사람만 할 수 있다 */}
            {(purchase.status === 'CLOSED' || purchase.status === 'CANCELED') && purchase.viewerIsCreator && (
                <div className="flex justify-center">
                    <ComingSoonButton icon="content_copy" label="같은 구성으로 다시 만들기" />
                </div>
            )}
        </div>
    );
}
