'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { getGetMyList2QueryKey, useCreate1 } from '@/api/generated/individual-group-purchase-controller/individual-group-purchase-controller';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { formatPrice } from '@/lib/salesPost';
import { MAX_SALE_HOURS } from '../_lib/deadline';
import { SectionTitle } from './parts';
import ProductPicker, { type PickerProduct } from './ProductPicker';
import { ROUTES } from '@/lib/routes';

// 제한은 BE IndividualGroupPurchaseCreateRequest 검증과 맞춘다.
const MAX_PRODUCTS = 20;

const createSchema = z.object({
    title: z.string().trim().min(1, '공동구매 제목을 입력해주세요.').max(50, '50자 이하로 입력해주세요.'),
    products: z
        .array(z.custom<PickerProduct>())
        .min(1, '판매할 상품을 하나 이상 골라주세요.')
        .max(MAX_PRODUCTS, `상품은 ${MAX_PRODUCTS}개까지 고를 수 있습니다.`),
});

type CreateInput = z.input<typeof createSchema>;
type CreateOutput = z.output<typeof createSchema>;

const INPUT_CLASS =
    'w-full h-10 px-space-md border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none';

export default function CreateForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const create = useCreate1({
        mutation: {
            onSuccess: (res) => {
                void queryClient.invalidateQueries({ queryKey: getGetMyList2QueryKey() });
                const id = res.data?.id;
                // 응답에 id 가 없으면 관리 화면을 열 수 없으니 목록으로 보낸다. (만들어진 공구는 목록에 보인다)
                router.replace(id !== undefined ? ROUTES.groupPurchaseIndividual(id) : ROUTES.groupPurchasesIndividual);
            },
        },
    });

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitted },
    } = useForm<CreateInput, unknown, CreateOutput>({
        resolver: zodResolver(createSchema),
        defaultValues: { title: '', products: [] },
    });

    const products = useWatch({ control, name: 'products' });
    const selectedIds = new Set(products.map((p) => p.id));

    const toggle = (product: PickerProduct) => {
        const next = selectedIds.has(product.id) ? products.filter((p) => p.id !== product.id) : [...products, product];
        // 제출 뒤에는 고를 때마다 다시 검증해 에러 문구가 바로 사라지게 한다.
        setValue('products', next, { shouldValidate: isSubmitted });
    };

    const onSubmit = (values: CreateOutput) => {
        if (create.isPending || create.isSuccess) return;
        create.mutate({ data: { title: values.title, productIds: values.products.map((p) => p.id) } });
    };

    return (
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                    <SectionTitle icon="edit_note" title="기본 정보" />
                    <label className="flex flex-col gap-space-xs">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">공동구매 제목</span>
                        <input className={INPUT_CLASS} placeholder="예) 풋살팀 트레이닝복 같이 사요" maxLength={50} {...register('title')} />
                        {errors.title && <span className="font-caption text-caption text-error">{errors.title.message}</span>}
                    </label>
                </section>

                <section className="bg-surface-container-lowest border border-outline-variant p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between">
                        <SectionTitle icon="inventory_2" title="판매할 상품 고르기" />
                        <span className="font-caption text-caption text-secondary">
                            {products.length} / {MAX_PRODUCTS}개
                        </span>
                    </div>
                    <ProductPicker selectedIds={selectedIds} onToggle={toggle} full={products.length >= MAX_PRODUCTS} />
                </section>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-36 bg-surface-container-lowest border border-primary p-space-lg flex flex-col gap-space-md">
                <h2 className="font-headline-sm text-headline-sm text-primary">고른 상품</h2>
                {products.length === 0 ? (
                    <p className="p-space-md bg-surface-container-low text-center font-body-sm text-body-sm text-on-surface-variant">아직 고른 상품이 없습니다.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-surface-container">
                        {products.map((product) => (
                            <li key={product.id} className="py-space-xs flex items-center justify-between gap-space-sm">
                                <div className="min-w-0">
                                    <div className="font-body-sm text-body-sm text-on-surface truncate">{product.name}</div>
                                    <div className="font-caption text-caption text-secondary truncate">
                                        {product.price === null ? '가격 문의' : formatPrice(product.price)} · {product.postTitle}
                                    </div>
                                </div>
                                <button
                                    className="w-8 h-8 shrink-0 flex items-center justify-center text-outline hover:text-error"
                                    type="button"
                                    aria-label={`${product.name} 빼기`}
                                    onClick={() => toggle(product)}
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {errors.products && <p className="font-caption text-caption text-error">{errors.products.message}</p>}
                <ul className="flex flex-col gap-1 font-caption text-caption text-secondary list-disc pl-space-md">
                    <li>판매 기한은 만든 때부터 {MAX_SALE_HOURS}시간이며, 관리 화면에서 바꿀 수 있습니다.</li>
                    <li>만든 뒤에도 상품을 더하거나 뺄 수 있습니다.</li>
                </ul>
                {create.isError && (
                    <p className="font-body-sm text-body-sm text-error" role="alert">
                        {errorMessage(create.error, '공동구매를 만들지 못했습니다.')}
                    </p>
                )}
                <button
                    className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center hover:opacity-90 disabled:opacity-60"
                    type="submit"
                    disabled={create.isPending || create.isSuccess}
                >
                    {create.isPending || create.isSuccess ? '만드는 중...' : '공동구매 만들기'}
                </button>
            </aside>
        </form>
    );
}
