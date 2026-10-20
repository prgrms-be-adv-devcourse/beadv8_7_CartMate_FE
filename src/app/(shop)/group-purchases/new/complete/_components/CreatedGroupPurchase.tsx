'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGetDetail1 } from '@/api/generated/shared-group-purchase-controller/shared-group-purchase-controller';
import type { SharedGroupPurchaseDetailResponse } from '@/api/generated/model';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import Notice from '../../../_components/Notice';
import { inviteUrl, statusBadgeClass, statusLabel } from '../../../_lib/sharedGroupPurchase';
import ShareLinkPanel from './ShareLinkPanel';

// 만든 직후의 공동구매(?id=)를 다시 조회해 초대 링크를 보여 준다.
// 생성 응답 대신 상세를 조회하므로 새로고침해도 같은 화면을 볼 수 있다.
export default function CreatedGroupPurchase() {
    const id = Number(useSearchParams().get('id'));
    if (!Number.isInteger(id) || id <= 0) return <Notice message="공동구매 정보를 찾을 수 없습니다." />;
    return <CreatedDetail id={id} />;
}

function CreatedDetail({ id }: { id: number }) {
    const detail = useGetDetail1(id);

    if (detail.isPending) return <div className="w-full h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    const purchase = detail.data?.data;
    if (detail.isError || !purchase?.inviteCode) {
        return <Notice message={errorMessage(detail.error, '공동구매 정보를 불러오지 못했습니다.')} />;
    }
    return <CreatedContent id={id} purchase={purchase} inviteCode={purchase.inviteCode} />;
}

type ContentProps = { id: number; purchase: SharedGroupPurchaseDetailResponse; inviteCode: string };

function CreatedContent({ id, purchase, inviteCode }: ContentProps) {
    const deadline = formatDateTime(purchase.editDeadlineAt);
    const metrics = [
        { label: '최대 인원', value: `${purchase.maxParticipants ?? '-'}명`, sub: '나 포함' },
        { label: '현재 참여', value: `${purchase.participantCount ?? '-'}명`, sub: '초대 링크로 참여' },
        { label: '수정 마감', value: deadline, sub: '이후 자동 마감' },
    ];
    const steps = [
        { badge: '1단계', icon: 'group_add', title: '초대 · 상품 담기', desc: '초대 링크로 들어온 팀원들이 함께 상품을 담고 수량·옵션을 정합니다.', footer: `${deadline}까지` },
        { badge: '2단계', icon: 'lock_clock', title: '마감', desc: '만든 사람이 직접 마감하거나, 수정 기한이 지나면 자동으로 마감됩니다.', footer: '담긴 상품이 없으면 취소' },
        { badge: '3단계', icon: 'account_balance_wallet', title: '나눠 결제', desc: '마감되면 공동 주문이 만들어지고, 총액을 참여 인원 수로 나눠 각자 예치금으로 결제합니다.', footer: '나머지 금액은 만든 사람 부담' },
    ];
    // 상세 조회가 끝난 뒤(브라우저)에만 렌더링되므로 window를 바로 쓸 수 있다.
    const url = inviteUrl(window.location.origin, id, inviteCode);

    return (
        <>
            <div className="text-center flex flex-col items-center mb-space-xl">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-space-md shadow-sm">
                    <Icon name="check" className="text-primary text-[44px]" />
                </div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                    <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-bold">생성 완료</span>
                    <span className="font-caption text-caption text-secondary">공동구매 번호 #{id}</span>
                </div>
                <h1 className="font-display-xl text-display-xl text-primary tracking-tight mb-space-xs">공동구매를 만들었습니다!</h1>
                <p className="font-body-lg text-body-lg text-secondary max-w-[620px]">팀원들에게 초대 링크를 공유해 함께 상품을 담도록 안내하세요.</p>
            </div>

            {/* 요약 카드 */}
            <div className="w-full bg-surface-container-lowest rounded-xl shadow-md p-space-lg mb-space-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md pb-space-md">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={statusBadgeClass(purchase.status, purchase.editable)}>{statusLabel(purchase.status, purchase.editable)}</span>
                            <span className="font-caption text-caption text-secondary">공동물품 (N빵)</span>
                        </div>
                        <h2 className="font-headline-md text-headline-md text-primary font-bold break-all">{purchase.title}</h2>
                    </div>
                    {purchase.viewerIsCreator && (
                        <div className="flex items-center gap-1.5 self-start bg-surface-container px-3 py-1.5 rounded shrink-0">
                            <Icon name="verified_user" className="text-primary text-[18px]" />
                            <span className="font-label-sm text-label-sm text-on-surface font-semibold">만든 사람</span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm text-center bg-surface-container-low rounded-lg p-space-md">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="bg-surface-container-lowest p-space-sm rounded flex flex-col justify-center">
                            <span className="font-caption text-caption text-secondary">{metric.label}</span>
                            <span className="font-label-md text-label-md text-primary font-bold mt-0.5">{metric.value}</span>
                            <span className="font-caption text-caption text-secondary">{metric.sub}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 초대 · 공유 */}
            <div className="w-full bg-surface-container-high rounded-xl p-space-lg shadow-md mb-space-lg">
                <div className="flex items-center gap-2 mb-space-xs">
                    <Icon name="link" className="text-primary text-[22px]" />
                    <h3 className="font-headline-sm text-headline-sm text-primary">팀원 초대 링크</h3>
                </div>
                <p className="font-body-sm text-body-sm text-secondary mb-space-md">링크를 받은 팀원은 로그인한 뒤 바로 공동구매에 참여할 수 있습니다.</p>
                <ShareLinkPanel url={url} inviteCode={inviteCode} />
                <div className="bg-surface-container-lowest/80 rounded p-space-sm flex items-start gap-space-xs">
                    <Icon name="info" className="text-secondary text-[18px] shrink-0 mt-0.5" />
                    <p className="font-caption text-caption text-secondary leading-normal">
                        정원({purchase.maxParticipants}명)이 차거나 수정 기한이 지나면 더 참여할 수 없습니다. 링크는 공동구매가 진행되는 동안 계속 쓸 수 있습니다.
                    </p>
                </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-space-md mb-space-xl">
                <Link
                    className="w-full sm:w-auto min-w-[260px] h-14 bg-primary text-on-primary font-label-md text-label-md rounded flex items-center justify-center gap-space-xs shadow-lg transition hover:opacity-90"
                    href={ROUTES.groupPurchase(id)}
                >
                    <Icon name="shopping_cart_checkout" className="text-[22px]" />
                    <span>공동구매로 이동</span>
                </Link>
                <Link
                    className="w-full sm:w-auto min-w-[220px] h-14 bg-surface-container text-on-surface font-label-md text-label-md rounded flex items-center justify-center gap-space-xs transition hover:bg-surface-variant"
                    href={ROUTES.groupPurchases}
                >
                    <Icon name="format_list_bulleted" className="text-[20px]" />
                    <span>내 공동구매 목록 보기</span>
                </Link>
            </div>

            {/* 진행 단계 안내 */}
            <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
                <h4 className="font-headline-sm text-headline-sm text-primary mb-space-md">공동구매 진행 단계</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
                    {steps.map((step, i) => (
                        <div key={step.badge} className={`rounded-lg p-space-md flex flex-col ${i === 0 ? 'bg-surface-container-high' : 'bg-surface-container-low'}`}>
                            <div className="flex items-center justify-between mb-space-sm">
                                <span
                                    className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-secondary'}`}
                                >
                                    {step.badge}
                                </span>
                                <Icon name={step.icon} className="text-secondary text-[16px]" />
                            </div>
                            <h5 className="font-label-md text-label-md text-primary font-bold mb-1">{step.title}</h5>
                            <p className="font-body-sm text-body-sm text-secondary flex-1">{step.desc}</p>
                            <div className={`mt-space-sm pt-space-xs font-caption text-caption ${i === 0 ? 'font-semibold text-primary' : 'text-secondary'}`}>{step.footer}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
