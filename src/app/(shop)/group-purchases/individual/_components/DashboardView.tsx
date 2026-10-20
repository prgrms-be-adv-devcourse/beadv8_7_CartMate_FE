'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetDashboard } from '@/api/generated/individual-group-purchase-controller/individual-group-purchase-controller';
import type { BuyerSummary, IndividualGroupPurchaseDashboardResponse, ProductSummary } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import { MessageBox, SectionTitle } from './parts';

type Dashboard = IndividualGroupPurchaseDashboardResponse;

function usePurchaseId() {
    const { id } = useParams<{ id: string }>();
    const purchaseId = Number(id);
    return { purchaseId, validId: Number.isInteger(purchaseId) && purchaseId > 0 };
}

export function DashboardBackLink() {
    const { purchaseId, validId } = usePurchaseId();
    return (
        <Link
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary"
            href={validId ? ROUTES.groupPurchaseIndividual(purchaseId) : ROUTES.groupPurchasesIndividual}
        >
            {validId ? '공동구매 관리로' : '내가 만든 공동구매'}
        </Link>
    );
}

// 내가 만든 개인물품 공동구매의 주문 현황. 생성자만 볼 수 있다(남의 공구는 403).
export default function DashboardView() {
    const { purchaseId, validId } = usePurchaseId();
    // 방금 들어온 주문이 바로 보이도록 캐시된 값을 쓰지 않는다.
    const query = useGetDashboard(purchaseId, { query: { enabled: validId, staleTime: 0 } });
    const dashboard = query.data?.data;

    const status = query.error instanceof ApiError ? query.error.status : undefined;
    if (!validId || status === 404) {
        return <MessageBox message="존재하지 않는 공동구매입니다." href={ROUTES.groupPurchasesIndividual} linkLabel="내 개인물품 공동구매 목록" />;
    }
    if (status === 403) {
        return <MessageBox message="내가 만든 공동구매의 주문 현황만 볼 수 있습니다." href={ROUTES.groupPurchasesIndividual} linkLabel="내 개인물품 공동구매 목록" />;
    }
    if (query.isPending) return <DashboardSkeleton />;
    if (!dashboard) {
        // 서버 오류는 BE가 RsData 없이 응답해 상태 코드만 담긴 문구가 되므로 안내 문구로 바꾼다.
        const message = status !== undefined && status >= 500 ? '주문 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' : errorMessage(query.error, '주문 현황을 불러오지 못했습니다.');
        return <MessageBox message={message} onRetry={() => query.refetch()} />;
    };

    return <DashboardContent dashboard={dashboard} fetching={query.isFetching} onRefresh={() => query.refetch()} />;
}

export function DashboardSkeleton() {
    return <div className="h-96 bg-surface-container-low animate-pulse" aria-hidden />;
}

type ContentProps = { dashboard: Dashboard; fetching: boolean; onRefresh: () => void };

function DashboardContent({ dashboard, fetching, onRefresh }: ContentProps) {
    const products = dashboard.products ?? [];
    const buyers = dashboard.buyers ?? [];

    return (
        <div className="flex flex-col gap-space-xl">
            <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                <div className="flex flex-wrap items-start justify-between gap-space-md">
                    <div className="flex flex-col gap-space-xs min-w-0">
                        <div className="flex items-center gap-space-sm">
                            <h2 className="font-headline-md text-headline-md text-on-surface break-all">{dashboard.title}</h2>
                            {/* 현황판 응답에는 마감 처리 여부가 없어 판매 가능 여부만 보여 준다 */}
                            <span
                                className={`shrink-0 px-space-xs py-0.5 font-caption text-caption font-semibold ${dashboard.open ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'}`}
                            >
                                {dashboard.open ? '판매 중' : '판매 종료'}
                            </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">판매 기한 {formatDateTime(dashboard.deadlineAt)}</p>
                    </div>
                    <button
                        className="h-9 px-space-md border border-outline-variant font-label-sm text-label-sm flex items-center gap-1 hover:border-primary disabled:opacity-60"
                        type="button"
                        disabled={fetching}
                        onClick={onRefresh}
                    >
                        <Icon name="refresh" className="text-[18px]" />
                        {fetching ? '불러오는 중...' : '새로고침'}
                    </button>
                </div>
                <dl className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
                    <Stat label="결제 완료 주문" value={`${dashboard.orderCount ?? 0}건`} />
                    <Stat label="구매자" value={`${dashboard.buyerCount ?? 0}명`} />
                    <Stat label="총 수량" value={`${dashboard.totalQuantity ?? 0}개`} />
                    <Stat label="총 결제 금액" value={formatPrice(dashboard.totalAmount ?? 0)} />
                </dl>
                <p className="font-caption text-caption text-secondary">결제가 끝난 주문만 집계합니다. 결제 대기 중이거나 취소된 주문은 포함되지 않습니다.</p>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                <SectionTitle icon="inventory_2" title="상품별 현황" />
                {products.length === 0 ? (
                    <p className="p-space-md bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">담긴 상품이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-surface-container">
                        {products.map((product) => (
                            <ProductRow key={product.productId} product={product} />
                        ))}
                    </ul>
                )}
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center justify-between gap-space-md">
                    <SectionTitle icon="group" title="구매자별 주문" />
                    <span className="font-caption text-caption text-secondary">총 {buyers.length}명</span>
                </div>
                {buyers.length === 0 ? (
                    <p className="p-space-md bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">아직 결제된 주문이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col gap-space-md">
                        {buyers.map((buyer) => (
                            <BuyerCard key={buyer.memberId} buyer={buyer} />
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-space-sm bg-surface-container-low flex flex-col gap-0.5">
            <dt className="font-caption text-caption text-on-surface-variant">{label}</dt>
            <dd className="font-headline-sm text-headline-sm text-on-surface font-bold">{value}</dd>
        </div>
    );
}

function ProductRow({ product }: { product: ProductSummary }) {
    const options = product.options ?? [];
    // 옵션 없는 상품은 BE가 이름 없는 옵션 하나로 돌려주므로 옵션 줄을 따로 보여 주지 않는다.
    const showOptions = options.length > 1 || options.some((option) => option.optionName);

    return (
        <li className="py-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-md">
                <span className="min-w-0 font-body-md text-body-md font-semibold text-on-surface truncate">
                    {/* 상품이 삭제되면 BE가 이름 없이 id만 돌려준다 */}
                    {product.productName ?? `상품 #${product.productId}`}
                </span>
                <span className="shrink-0 font-body-sm text-body-sm text-on-surface">
                    {product.quantity ?? 0}개 · <span className="font-bold">{formatPrice(product.amount ?? 0)}</span>
                </span>
            </div>
            {showOptions && (
                <ul className="pl-space-md flex flex-col gap-0.5">
                    {options.map((option) => (
                        <li key={option.inventoryId} className="flex items-center justify-between gap-space-md font-caption text-caption text-secondary">
                            <span className="min-w-0 truncate">{option.optionName ?? '기본'}</span>
                            <span className="shrink-0">
                                {option.quantity ?? 0}개 · {formatPrice(option.amount ?? 0)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

function BuyerCard({ buyer }: { buyer: BuyerSummary }) {
    const lines = buyer.lines ?? [];
    return (
        <li className="border border-outline-variant">
            <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between gap-space-md">
                <span className="min-w-0 font-body-md text-body-md font-semibold text-on-surface truncate">
                    {/* 탈퇴 등으로 닉네임을 못 찾으면 BE가 비워서 준다 */}
                    {buyer.nickname ?? '알 수 없는 회원'}
                </span>
                <span className="shrink-0 font-body-sm text-body-sm text-on-surface">
                    {buyer.quantity ?? 0}개 · <span className="font-bold">{formatPrice(buyer.amount ?? 0)}</span>
                </span>
            </div>
            <ul className="flex flex-col divide-y divide-surface-container">
                {lines.map((line, index) => (
                    <li key={`${line.orderId}-${line.inventoryId}-${index}`} className="px-space-md py-space-xs flex flex-wrap items-center justify-between gap-x-space-md gap-y-0.5">
                        <span className="min-w-0 font-body-sm text-body-sm text-on-surface">
                            {line.productName ?? `상품 #${line.productId}`}
                            {line.optionName && <span className="text-secondary"> · {line.optionName}</span>}
                            <span className="text-secondary"> × {line.quantity ?? 0}</span>
                        </span>
                        <span className="shrink-0 font-caption text-caption text-secondary">
                            {formatDateTime(line.orderedAt)} · <span className="text-on-surface">{formatPrice(line.amount ?? 0)}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </li>
    );
}
