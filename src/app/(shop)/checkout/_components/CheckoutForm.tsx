'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getGetCartQueryKey, useGetCart } from '@/api/generated/cart-controller/cart-controller';
import { useProfile } from '@/api/generated/member-controller/member-controller';
import type { CartItemResponse } from '@/api/generated/model';
import { useCreatePersonal, useGetDetail } from '@/api/generated/order-controller/order-controller';
import { useGetMyWallet } from '@/api/generated/wallet-controller/wallet-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatDateTime, formatPhone } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { formatPrice } from '@/lib/salesPost';

// 길이 제한은 BE DeliveryAddressRequest 검증과 맞춘다.
const addressSchema = z.object({
    receiverName: z.string().trim().min(1, '받는 분 이름을 입력해주세요.').max(50, '50자 이하로 입력해주세요.'),
    receiverPhone: z
        .string()
        .trim()
        .min(1, '연락처를 입력해주세요.')
        .regex(/^0\d{1,2}-\d{3,4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
    zipCode: z.string().trim().min(1, '우편번호를 입력해주세요.').max(10, '10자 이하로 입력해주세요.'),
    address: z.string().trim().min(1, '주소를 입력해주세요.').max(255, '255자 이하로 입력해주세요.'),
    addressDetail: z.string().trim().max(255, '255자 이하로 입력해주세요.'),
    consent: z.boolean().refine((checked) => checked, '주문 내용 확인에 동의해주세요.'),
});

type AddressInput = z.input<typeof addressSchema>;
type AddressOutput = z.output<typeof addressSchema>;

const INPUT_CLASS =
    'w-full h-10 px-space-md border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none';

type CheckoutItem = CartItemResponse & { cartItemId: number };

// 장바구니에서 고른 항목(?items=1,2)으로 개인 주문을 만든다.
// 주문을 만들면 주소를 ?order=주문id 로 바꿔 접수 화면을 보여 준다. 새로고침·뒤로 가기 후에도 접수된 주문을 다시 보여 주어
// 같은 항목으로 주문을 또 만드는 일을 줄인다. (BE는 같은 장바구니 항목의 중복 주문을 막지 않는다)
// 결제(예치금 차감)는 ORD-2에서 연결한다. 주문을 만들면 결제 기한(30분) 안에 결제해야 한다.
export default function CheckoutForm() {
    const searchParams = useSearchParams();
    const orderId = Number(searchParams.get('order'));
    if (Number.isInteger(orderId) && orderId > 0) return <OrderCreated orderId={orderId} />;
    return <CheckoutItems itemsParam={searchParams.get('items') ?? ''} />;
}

function CheckoutItems({ itemsParam }: { itemsParam: string }) {
    const router = useRouter();
    const ids = new Set(
        itemsParam
            .split(',')
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0),
    );

    const cart = useGetCart();

    if (cart.isPending) return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    if (cart.isError && !cart.data) {
        return <Notice message={errorMessage(cart.error, '주문할 상품을 불러오지 못했습니다.')} />;
    }

    // 장바구니에서 사라졌거나 구매할 수 없게 된 항목은 주문에서 뺀다.
    const items = (cart.data?.data?.items ?? []).filter(
        (item): item is CheckoutItem => typeof item.cartItemId === 'number' && ids.has(item.cartItemId) && item.purchasable !== false,
    );
    if (items.length === 0) return <Notice message="주문할 상품이 없습니다. 장바구니에서 상품을 선택해주세요." />;

    return (
        <>
            {items.length < ids.size && (
                <p className="mb-space-md p-space-sm bg-surface-container-low font-body-sm text-body-sm text-on-surface" role="status">
                    선택한 상품 중 장바구니에 없거나 구매할 수 없는 상품은 주문에서 제외했습니다.
                </p>
            )}
            <CheckoutContent items={items} onCreated={(id) => router.replace(`${ROUTES.checkout}?order=${id}`)} />
        </>
    );
}

type ContentProps = { items: CheckoutItem[]; onCreated: (orderId: number) => void };

// 회원 정보(연락처·기본 배송지)를 받은 뒤 그 값으로 배송지 칸을 채운 채 폼을 연다.
// 회원 정보를 못 받아도 빈 폼으로 주문할 수 있게 한다.
function CheckoutContent(props: ContentProps) {
    const profile = useProfile();
    if (profile.isPending) return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;

    const me = profile.data?.data;
    const defaults: AddressInput = {
        // 닉네임은 실명이 아닐 수 있어 받는 분 이름은 비워 둔다.
        receiverName: '',
        receiverPhone: formatPhone(me?.phone ?? ''),
        zipCode: me?.defaultAddress?.zipCode ?? '',
        address: me?.defaultAddress?.basicAddress ?? '',
        addressDetail: me?.defaultAddress?.detailAddress ?? '',
        consent: false,
    };
    return <OrderForm {...props} defaults={defaults} />;
}

function OrderForm({ items, onCreated, defaults }: ContentProps & { defaults: AddressInput }) {
    const queryClient = useQueryClient();
    const wallet = useGetMyWallet();
    const createOrder = useCreatePersonal({
        mutation: {
            onSuccess: (res) => {
                void queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
                if (res.data?.orderId !== undefined) onCreated(res.data.orderId);
            },
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<AddressInput, unknown, AddressOutput>({
        resolver: zodResolver(addressSchema),
        defaultValues: defaults,
    });

    const total = items.reduce((sum, item) => sum + (item.totalPrice ?? (item.price ?? 0) * (item.quantity ?? 0)), 0);
    const balance = wallet.data?.data?.balance;

    const onSubmit = (values: AddressOutput) => {
        // 검증이 비동기라 버튼이 비활성되기 전에 두 번 제출될 수 있어 한 번 더 막는다.
        if (createOrder.isPending || createOrder.isSuccess) return;
        createOrder.mutate({
            data: {
                cartItemIds: items.map((item) => item.cartItemId),
                deliveryAddress: {
                    receiverName: values.receiverName,
                    receiverPhone: values.receiverPhone,
                    zipCode: values.zipCode,
                    address: values.address,
                    addressDetail: values.addressDetail || undefined,
                },
            },
        });
    };

    return (
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                    <SectionTitle icon="local_shipping" title="배송지 정보" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                        <Field label="받는 분" error={errors.receiverName?.message}>
                            <input className={INPUT_CLASS} {...register('receiverName')} autoComplete="name" />
                        </Field>
                        <Field label="연락처" error={errors.receiverPhone?.message}>
                            <input
                                className={INPUT_CLASS}
                                type="tel"
                                placeholder="010-0000-0000"
                                autoComplete="tel"
                                {...register('receiverPhone', {
                                    onChange: (e) => setValue('receiverPhone', formatPhone(e.target.value)),
                                })}
                            />
                        </Field>
                        <Field label="우편번호" error={errors.zipCode?.message}>
                            <input className={INPUT_CLASS} inputMode="numeric" autoComplete="postal-code" {...register('zipCode')} />
                        </Field>
                        <div className="hidden md:block" />
                        <Field label="주소" error={errors.address?.message}>
                            <input className={INPUT_CLASS} autoComplete="address-line1" {...register('address')} />
                        </Field>
                        <Field label="상세 주소 (선택)" error={errors.addressDetail?.message}>
                            <input className={INPUT_CLASS} autoComplete="address-line2" {...register('addressDetail')} />
                        </Field>
                    </div>
                    <div className="flex flex-col gap-space-xs">
                        <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="shipping-memo">
                            배송 요청사항 <span className="text-outline">(준비 중)</span>
                        </label>
                        <select id="shipping-memo" className={`${INPUT_CLASS} disabled:opacity-50 disabled:cursor-not-allowed`} disabled>
                            <option>문 앞 배치 (부재 시 문 앞에 놓아주세요)</option>
                        </select>
                    </div>
                </section>

                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <SectionTitle icon="inventory_2" title="주문 상품 정보" />
                        <span className="font-caption text-caption text-secondary">총 {items.length}개 품목</span>
                    </div>
                    <ul className="flex flex-col divide-y divide-surface-container">
                        {items.map((item) => (
                            <li key={item.cartItemId} className="py-space-sm flex items-center justify-between gap-space-md">
                                <div className="min-w-0">
                                    <div className="font-body-md text-body-md font-semibold text-on-surface truncate">{item.productName}</div>
                                    <div className="font-caption text-caption text-secondary">
                                        {item.optionName && `옵션: ${item.optionName} · `}수량: {item.quantity}
                                    </div>
                                </div>
                                <span className="font-label-md text-label-md text-on-surface font-bold shrink-0">
                                    {formatPrice(item.totalPrice ?? (item.price ?? 0) * (item.quantity ?? 0))}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                    <SectionTitle icon="payments" title="결제 수단" />
                    <p className="font-body-sm text-body-sm text-on-surface">팀바이 예치금</p>
                    <p className="font-caption text-caption text-secondary">주문을 만든 뒤 결제 기한 안에 예치금으로 결제합니다.</p>
                </section>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-36 bg-surface-container-lowest border border-primary p-space-lg flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary">결제 예정 금액</h2>
                <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
                    <span>주문 상품 총액</span>
                    <span className="text-on-surface font-medium">{formatPrice(total)}</span>
                </div>
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
                        <div className={`p-space-xs text-center font-caption text-caption ${balance >= total ? 'bg-surface-container text-on-surface' : 'bg-error-container text-on-error-container'}`}>
                            {balance >= total ? '결제 후 잔액: ' + formatPrice(balance - total) : `예치금이 ${formatPrice(total - balance)} 부족합니다. 결제 전에 충전해주세요.`}
                        </div>
                    </div>
                )}
                <label className="flex items-start gap-space-xs cursor-pointer select-none">
                    <input className="w-4 h-4 mt-0.5 accent-primary" type="checkbox" {...register('consent')} />
                    <span className="font-caption text-caption text-secondary">주문 상품, 배송지, 주문 금액을 확인했습니다.</span>
                </label>
                {errors.consent && <p className="font-caption text-caption text-error">{errors.consent.message}</p>}
                {createOrder.isError && (
                    <p className="font-body-sm text-body-sm text-error" role="alert">
                        {errorMessage(createOrder.error, '주문을 만들지 못했습니다.')}
                    </p>
                )}
                <button
                    className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90 disabled:opacity-60"
                    type="submit"
                    disabled={createOrder.isPending || createOrder.isSuccess}
                >
                    {createOrder.isPending ? '주문 중...' : `${formatPrice(total)} 주문하기`}
                </button>
            </aside>
        </form>
    );
}

function OrderCreated({ orderId }: { orderId: number }) {
    const query = useGetDetail(orderId);
    const order = query.data?.data;

    if (query.isPending) return <div className="h-64 bg-surface-container-low animate-pulse" aria-hidden />;
    if (!order) return <Notice message={errorMessage(query.error, '주문 정보를 불러오지 못했습니다.')} />;

    const pending = order.status === 'PAYMENT_PENDING';
    return (
        <div className="max-w-[640px] mx-auto bg-surface-container-lowest border border-primary p-space-xl flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
                <Icon name="check_circle" className="text-primary text-[28px]" />
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    {pending ? '주문이 접수되었습니다' : order.status === 'PAID' ? '결제가 완료된 주문입니다' : '취소된 주문입니다'}
                </h2>
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-y-space-xs font-body-md text-body-md">
                <dt className="text-secondary">주문 번호</dt>
                <dd className="text-on-surface font-semibold">{order.orderNumber}</dd>
                <dt className="text-secondary">주문 금액</dt>
                <dd className="text-on-surface font-semibold">{formatPrice(order.totalAmount ?? 0)}</dd>
                <dt className="text-secondary">결제 기한</dt>
                <dd className="text-on-surface">{formatDateTime(order.paymentDeadlineAt)} 까지</dd>
            </dl>
            {pending && <p className="font-body-sm text-body-sm text-secondary">결제 기한이 지나면 주문은 자동으로 취소됩니다.</p>}
            <div className="flex flex-col sm:flex-row gap-space-sm">
                {pending && (
                    <button
                        className="flex-1 h-11 bg-primary text-on-primary font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed"
                        type="button"
                        disabled
                        title="예치금 결제는 준비 중입니다"
                    >
                        예치금으로 결제하기 (준비 중)
                    </button>
                )}
                <Link className="flex-1 h-11 border border-outline-variant font-label-md text-label-md flex items-center justify-center hover:bg-surface-container" href={ROUTES.home}>
                    쇼핑 계속하기
                </Link>
            </div>
        </div>
    );
}

function Notice({ message }: { message: string }) {
    return (
        <div className="bg-surface-container-low p-space-xl flex flex-col items-center gap-space-md text-center">
            <p className="font-body-md text-body-md text-on-surface">{message}</p>
            <Link className="h-10 px-space-lg bg-primary text-on-primary font-label-md text-label-md flex items-center" href={ROUTES.cart}>
                장바구니로 가기
            </Link>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
    return (
        <div className="flex items-center gap-space-sm">
            <Icon name={icon} className="text-[20px] text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-primary">{title}</h2>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-space-xs">
            <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
            {children}
            {error && <span className="font-caption text-caption text-error">{error}</span>}
        </label>
    );
}
