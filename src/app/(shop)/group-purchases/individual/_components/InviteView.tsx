'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetByInviteCode } from '@/api/generated/individual-group-purchase-controller/individual-group-purchase-controller';
import { useProfile } from '@/api/generated/member-controller/member-controller';
import type { IndividualGroupPurchaseDetailResponse, Option, ProductResponse } from '@/api/generated/model';
import { useCreateIndividualGroup } from '@/api/generated/order-controller/order-controller';
import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, parseKst } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';
import DeliveryAddressFields, {
    deliveryAddressDefaults,
    deliveryAddressSchema,
    toDeliveryAddressRequest,
} from '../../../checkout/_components/DeliveryAddressFields';
import { remainingText } from '../_lib/deadline';
import { useNow } from '../_lib/useNow';
import { MessageBox, SectionTitle, StatusBadge, saleState } from './parts';
import Thumb from './Thumb';

type Detail = IndividualGroupPurchaseDetailResponse;

// BE가 초대 코드 형식(소문자·숫자 12자)이 다르면 RsData가 아닌 400을 돌려주므로 요청 전에 거른다.
const INVITE_CODE = /^[a-z0-9]{12}$/;
// BE IndividualGroupOrderCreateItem 수량 제한과 맞춘다.
const MAX_QUANTITY = 999;

// 초대 링크로 들어온 사람이 담긴 상품을 골라 개인 주문을 만든다. 결제는 개인 주문서(/checkout?order=)에서 한다.
export default function InviteView() {
    const { code } = useParams<{ code: string }>();
    const validCode = INVITE_CODE.test(code);
    // 판매 기한·마감 여부가 중요한 화면이라 캐시된 값을 쓰지 않고 들어올 때마다 새로 받는다.
    const query = useGetByInviteCode(code, { query: { enabled: validCode, staleTime: 0 } });
    const detail = query.data?.data;

    const status = query.error instanceof ApiError ? query.error.status : undefined;
    if (!validCode || status === 404 || status === 400) {
        return <MessageBox message="유효하지 않은 초대 링크입니다. 링크를 다시 확인해주세요." href={ROUTES.home} linkLabel="홈으로" />;
    }
    if (query.isPending) return <InviteSkeleton />;
    if (!detail) return <MessageBox message={errorMessage(query.error, '공동구매 정보를 불러오지 못했습니다.')} onRetry={() => query.refetch()} />;

    return <InviteContent detail={detail} refresh={() => query.refetch()} />;
}

export function InviteSkeleton() {
    return <div className="h-96 bg-surface-container-low animate-pulse" aria-hidden />;
}

// 고른 수량. 키는 inventoryId.
type Quantities = Record<number, number>;

type Line = { inventoryId: number; productName: string; optionName?: string; price: number; quantity: number };

function selectedLines(products: ProductResponse[], quantities: Quantities): Line[] {
    return products.flatMap((product) =>
        (product.options ?? []).flatMap((option) => {
            const quantity = option.inventoryId === undefined ? 0 : (quantities[option.inventoryId] ?? 0);
            if (option.inventoryId === undefined || quantity <= 0 || !isOrderable(product, option)) return [];
            return [
                {
                    inventoryId: option.inventoryId,
                    productName: product.productName ?? `상품 #${product.productId}`,
                    optionName: option.optionName,
                    price: option.price ?? 0,
                    quantity,
                },
            ];
        }),
    );
}

function isOrderable(product: ProductResponse, option: Option) {
    return product.purchasable !== false && option.purchasable !== false && typeof option.price === 'number';
}

function InviteContent({ detail, refresh }: { detail: Detail; refresh: () => Promise<unknown> }) {
    const now = useNow();
    const state = saleState(detail);
    // 화면을 띄워 둔 사이 판매 기한이 지나면 BE가 주문을 거절하므로 미리 막는다.
    const deadline = parseKst(detail.deadlineAt);
    const deadlinePassed = deadline !== null && deadline.getTime() <= now.getTime();
    const orderable = state === 'selling' && !deadlinePassed;
    const products = detail.products ?? [];
    const [quantities, setQuantities] = useState<Quantities>({});
    const lines = selectedLines(products, quantities);

    const setQuantity = (inventoryId: number, quantity: number) =>
        setQuantities((prev) => ({ ...prev, [inventoryId]: Math.min(MAX_QUANTITY, Math.max(0, quantity)) }));

    const intro = (
        <>
            <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-space-md">
                    <h2 className="font-headline-md text-headline-md text-on-surface break-all">{detail.title}</h2>
                    <StatusBadge status={detail.status} open={orderable} />
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-space-md gap-y-1 font-body-sm text-body-sm">
                    <dt className="text-on-surface-variant">판매 기한</dt>
                    <dd className="text-on-surface">
                        {formatDateTime(detail.deadlineAt)}
                        {orderable && <span className="ml-space-xs text-secondary">({remainingText(detail.deadlineAt, now) ?? '기한 지남'})</span>}
                    </dd>
                </dl>
                {!orderable && (
                    <p className="p-space-sm bg-surface-container-low font-body-sm text-body-sm text-on-surface" role="status">
                        {state === 'closed' ? '마감된 공동구매입니다.' : '판매 기한이 지난 공동구매입니다.'} 더 이상 주문할 수 없습니다.
                    </p>
                )}
                {detail.viewerIsCreator && detail.id !== undefined && (
                    <p className="p-space-sm bg-surface-container-low font-body-sm text-body-sm text-on-surface flex flex-wrap items-center gap-x-space-sm">
                        내가 만든 공동구매입니다.
                        <Link className="text-primary underline" href={ROUTES.groupPurchaseIndividual(detail.id)}>
                            관리 화면으로 가기
                        </Link>
                    </p>
                )}
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center justify-between gap-space-md">
                    <SectionTitle icon="inventory_2" title="상품 선택" />
                    <span className="font-caption text-caption text-secondary">총 {products.length}개 상품</span>
                </div>
                {products.length === 0 ? (
                    <p className="p-space-md bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">담긴 상품이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-surface-container">
                        {products.map((product) => (
                            <ProductItem key={product.productId} product={product} quantities={quantities} disabled={!orderable} onChange={setQuantity} />
                        ))}
                    </ul>
                )}
                {orderable && <p className="font-caption text-caption text-secondary">주문할 상품의 수량을 정해주세요. 상품마다 최대 {MAX_QUANTITY}개까지 주문할 수 있습니다.</p>}
            </section>
        </>
    );

    if (orderable) {
        return (
            <OrderSection purchaseId={detail.id} lines={lines} refresh={refresh}>
                {intro}
            </OrderSection>
        );
    }

    return (
        <div className={GRID_CLASS}>
            <div className={MAIN_CLASS}>{intro}</div>
            <aside className={`${ASIDE_CLASS} border-outline-variant gap-space-sm`}>
                <SectionTitle icon="block" title="주문 불가" />
                <p className="font-body-sm text-body-sm text-on-surface-variant">공동구매를 만든 사람에게 새 초대 링크가 있는지 확인해주세요.</p>
                <Link className="h-10 px-space-lg border border-outline-variant font-label-md text-label-md flex items-center justify-center hover:bg-surface-container" href={ROUTES.home}>
                    홈으로
                </Link>
            </aside>
        </div>
    );
}

// 왼쪽에 공동구매·상품·배송지, 오른쪽에 주문 요약을 둔다.
const GRID_CLASS = 'grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start';
const MAIN_CLASS = 'lg:col-span-8 flex flex-col gap-space-xl';
const ASIDE_CLASS = 'lg:col-span-4 lg:sticky lg:top-36 bg-surface-container-lowest border p-space-lg flex flex-col';

type ProductItemProps = { product: ProductResponse; quantities: Quantities; disabled: boolean; onChange: (inventoryId: number, quantity: number) => void };

function ProductItem({ product, quantities, disabled, onChange }: ProductItemProps) {
    const options = product.options ?? [];
    // 옵션 없는 상품은 BE가 이름 없는 옵션 하나로 돌려준다. 이때는 상품 줄에 바로 수량을 둔다.
    const single = options.length === 1 && !options[0].optionName ? options[0] : null;

    return (
        <li className="py-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-md">
                <Thumb src={product.imageUrl} className="w-14 h-14" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-space-xs">
                        <span className="font-body-md text-body-md font-semibold text-on-surface truncate">
                            {/* 상품이 삭제되면 BE가 이름 없이 id만 돌려준다 */}
                            {product.productName ?? `상품 #${product.productId}`}
                        </span>
                        {product.purchasable === false && (
                            <span className="shrink-0 px-space-xs py-0.5 bg-error-container text-on-error-container font-caption text-caption">구매 불가</span>
                        )}
                    </div>
                    {single && <div className="font-caption text-caption text-secondary">{priceText(single)}</div>}
                </div>
                {single && <QuantityControl product={product} option={single} quantities={quantities} disabled={disabled} onChange={onChange} />}
            </div>
            {!single && options.length > 0 && (
                <ul className="ml-[4.5rem] flex flex-col gap-space-xs">
                    {options.map((option) => (
                        <li key={option.inventoryId} className="flex items-center gap-space-md">
                            <div className="min-w-0 flex-1 font-body-sm text-body-sm text-on-surface">
                                <span className="truncate">{option.optionName ?? '기본'}</span>
                                <span className="ml-space-xs font-caption text-caption text-secondary">{priceText(option)}</span>
                            </div>
                            <QuantityControl product={product} option={option} quantities={quantities} disabled={disabled} onChange={onChange} />
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

function priceText(option: Option) {
    return typeof option.price === 'number' ? formatPrice(option.price) : '가격 정보 없음';
}

type QuantityControlProps = { product: ProductResponse; option: Option; quantities: Quantities; disabled: boolean; onChange: (inventoryId: number, quantity: number) => void };

function QuantityControl({ product, option, quantities, disabled, onChange }: QuantityControlProps) {
    const inventoryId = option.inventoryId;
    if (inventoryId === undefined) return null;
    if (!isOrderable(product, option)) {
        return <span className="shrink-0 font-caption text-caption text-outline">구매 불가</span>;
    }
    const quantity = quantities[inventoryId] ?? 0;
    const label = `${product.productName ?? '상품'}${option.optionName ? ` ${option.optionName}` : ''} 수량`;
    const buttonClass =
        'w-9 h-9 border border-outline-variant flex items-center justify-center hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant';

    return (
        <div className="shrink-0 flex items-center" role="group" aria-label={label}>
            <button className={buttonClass} type="button" disabled={disabled || quantity <= 0} onClick={() => onChange(inventoryId, quantity - 1)} aria-label="수량 줄이기">
                <Icon name="remove" className="text-[18px]" />
            </button>
            <input
                className="w-12 h-9 border-y border-outline-variant bg-surface-container-lowest text-center font-body-sm text-body-sm text-on-surface outline-none focus:border-primary disabled:opacity-50"
                inputMode="numeric"
                aria-label={label}
                value={quantity}
                disabled={disabled}
                onChange={(e) => onChange(inventoryId, Number(e.target.value.replace(/\D/g, '')) || 0)}
            />
            <button
                className={buttonClass}
                type="button"
                disabled={disabled || quantity >= MAX_QUANTITY}
                onClick={() => onChange(inventoryId, quantity + 1)}
                aria-label="수량 늘리기"
            >
                <Icon name="add" className="text-[18px]" />
            </button>
        </div>
    );
}

const orderSchema = deliveryAddressSchema.extend({
    consent: z.boolean().refine((checked) => checked, '주문 내용 확인에 동의해주세요.'),
});

type OrderInput = z.input<typeof orderSchema>;
type OrderOutput = z.output<typeof orderSchema>;

type OrderSectionProps = { purchaseId?: number; lines: Line[]; refresh: () => Promise<unknown>; children: React.ReactNode };

// 회원 정보(연락처·기본 배송지)를 받은 뒤 그 값으로 배송지 칸을 채운 채 폼을 연다. 못 받아도 빈 폼으로 주문할 수 있다.
function OrderSection(props: OrderSectionProps) {
    const profile = useProfile();
    if (profile.isPending) {
        return (
            <div className={GRID_CLASS}>
                <div className={MAIN_CLASS}>
                    {props.children}
                    <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />
                </div>
            </div>
        );
    }
    return <OrderForm {...props} defaults={{ ...deliveryAddressDefaults(profile.data?.data), consent: false }} />;
}

function OrderForm({ purchaseId, lines, refresh, defaults, children }: OrderSectionProps & { defaults: OrderInput }) {
    const router = useRouter();
    const wallet = useGetMyWallet();
    const [pickError, setPickError] = useState(false);
    const createOrder = useCreateIndividualGroup({
        mutation: {
            onSuccess: (res) => {
                // 결제는 개인 주문서의 접수 화면에서 한다. 뒤로 가기로 이 폼에 돌아와 같은 주문을 또 만드는 일을 줄이려고 주소를 바꾼다.
                // 응답에 주문 번호가 없으면 결제 화면을 열 수 없으니, 버튼이 멈춘 듯 보이지 않게 개인 주문 목록으로 보낸다.
                router.replace(res.data?.orderId !== undefined ? `${ROUTES.checkout}?order=${res.data.orderId}` : ROUTES.orders);
            },
            // 마감·상품 제외·구매 불가 등은 화면에 보인 공동구매 정보가 바뀐 것이므로 다시 받아 맞춘다.
            onError: () => void refresh(),
        },
    });

    const form = useForm<OrderInput, unknown, OrderOutput>({
        resolver: zodResolver(orderSchema),
        defaultValues: defaults,
    });
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const balance = wallet.data?.data?.balance;
    const busy = createOrder.isPending || createOrder.isSuccess;

    const onValid = (values: OrderOutput) => {
        // 검증이 비동기라 버튼이 비활성되기 전에 두 번 제출될 수 있어 한 번 더 막는다.
        if (busy || purchaseId === undefined || lines.length === 0) return;
        createOrder.mutate({
            data: {
                individualGroupPurchaseId: purchaseId,
                items: lines.map((line) => ({ inventoryId: line.inventoryId, quantity: line.quantity })),
                deliveryAddress: toDeliveryAddressRequest(values),
            },
        });
    };

    return (
        <form
            className={GRID_CLASS}
            onSubmit={(e) => {
                setPickError(lines.length === 0);
                void handleSubmit(onValid)(e);
            }}
            noValidate
        >
            <div className={MAIN_CLASS}>
                {children}
                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                    <SectionTitle icon="local_shipping" title="배송지 정보" />
                    <FormProvider {...form}>
                        <DeliveryAddressFields />
                    </FormProvider>
                </section>

                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                    <SectionTitle icon="payments" title="결제 수단" />
                    <p className="font-body-sm text-body-sm text-on-surface">팀바이 예치금</p>
                    <p className="font-caption text-caption text-secondary">
                        주문을 만든 뒤 30분 안에 예치금으로 결제합니다. 판매 기한이 그보다 먼저 끝나면 판매 기한까지 결제해야 합니다.
                    </p>
                </section>

            </div>

            <aside className={`${ASIDE_CLASS} border-primary gap-space-md`}>
                <h2 className="font-headline-sm text-headline-sm text-primary">주문 요약</h2>
                {lines.length === 0 ? (
                    <p className="p-space-sm bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">아직 고른 상품이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col gap-space-xs">
                        {lines.map((line) => (
                            <li key={line.inventoryId} className="flex items-start justify-between gap-space-sm font-body-sm text-body-sm">
                                <span className="min-w-0 text-on-surface-variant">
                                    {line.productName}
                                    {line.optionName && ` · ${line.optionName}`} × {line.quantity}
                                </span>
                                <span className="shrink-0 text-on-surface font-medium">{formatPrice(line.price * line.quantity)}</span>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>배송비</span>
                    <span className="text-outline">주문 확정 시 안내</span>
                </div>
                <div className="py-space-sm border-t border-b border-outline-variant flex items-center justify-between">
                    <span className="font-label-md text-label-md text-on-surface font-bold">총 주문 금액</span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">{formatPrice(total)}</span>
                </div>
                {balance !== undefined && (
                    <div className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                        <div className="flex items-center justify-between">
                            <span>보유 예치금</span>
                            <span className="text-on-surface">{formatPrice(balance)}</span>
                        </div>
                        {balance >= total ? (
                            <div className="p-space-xs text-center font-caption text-caption bg-surface-container text-on-surface">결제 후 잔액: {formatPrice(balance - total)}</div>
                        ) : (
                            <div className="p-space-xs text-center font-caption text-caption bg-error-container text-on-error-container">
                                예치금이 {formatPrice(total - balance)} 부족합니다.{' '}
                                <Link className="underline" href={ROUTES.depositCharge}>
                                    충전하기
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                <label className="flex items-start gap-space-xs cursor-pointer select-none">
                    <input className="w-4 h-4 mt-0.5 accent-primary" type="checkbox" {...register('consent')} />
                    <span className="font-caption text-caption text-secondary">주문 상품, 배송지, 주문 금액을 확인했습니다.</span>
                </label>
                {errors.consent && <p className="font-caption text-caption text-error">{errors.consent.message}</p>}
                {pickError && lines.length === 0 && <p className="font-caption text-caption text-error">주문할 상품을 하나 이상 골라주세요.</p>}
                {createOrder.isError && (
                    <p className="font-body-sm text-body-sm text-error" role="alert">
                        {errorMessage(createOrder.error, '주문을 만들지 못했습니다.')}
                    </p>
                )}
                <button
                    className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90 disabled:opacity-60"
                    type="submit"
                    disabled={busy}
                >
                    {createOrder.isPending ? '주문 중...' : `${formatPrice(total)} 주문하기`}
                </button>
            </aside>
        </form>
    );
}
