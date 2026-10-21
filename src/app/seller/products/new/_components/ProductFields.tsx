'use client';

import Icon from '@/components/ui/Icon';
import ImagePicker from './ImagePicker';
import OptionTable from './OptionTable';
import { CATEGORIES, MAX_TEXT, MAX_TITLE, errorId, parsePrice, type FormErrors, type ProductDraft } from './salesPostDraft';

const INPUT_CLASS =
    'h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const PRICE_FORMAT = new Intl.NumberFormat('ko-KR');

type Props = {
    index: number;
    product: ProductDraft;
    errors: FormErrors;
    canRemove: boolean;
    totalRemaining: number;
    disabled: boolean;
    onChange: (patch: Partial<ProductDraft>) => void;
    onRemove: () => void;
};

// 판매글 안의 상품 하나. 구매자는 상품 상세에서 이 상품들 중 하나를 골라 담는다.
export default function ProductFields({ index, product, errors, canRemove, totalRemaining, disabled, onChange, onRemove }: Props) {
    const key = (field: string) => `p${product.key}.${field}`;
    const err = (field: string) => errors[key(field)];
    // 입력칸 공통 속성: 포커스 대상 표시(data-field), 오류 상태와 오류 문구 연결
    const a11y = (field: string) => ({
        'data-field': key(field),
        'aria-invalid': Boolean(err(field)),
        'aria-describedby': err(field) ? errorId(key(field)) : undefined,
    });
    const errorText = (field: string) =>
        err(field) && (
            <p id={errorId(key(field))} className="text-caption text-error">
                {err(field)}
            </p>
        );
    const id = (field: string) => `product-${index}-${field}`;

    return (
        <fieldset
            className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg"
            data-testid={`product-${index}`}
        >
            <legend className="sr-only">상품 {index + 1}</legend>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-md">
                <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">상품 {index + 1}</h2>
                    <p className="text-body-sm text-on-surface-variant">상품명·가격·카테고리·이미지·옵션을 입력합니다.</p>
                </div>
                {canRemove && (
                    <button
                        type="button"
                        className="h-9 px-space-md rounded bg-surface-container-high text-on-surface font-label-sm hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-space-xs disabled:opacity-60"
                        disabled={disabled}
                        onClick={onRemove}
                    >
                        <Icon name="delete" className="text-[16px]" />
                        상품 삭제
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="flex flex-col space-y-space-xs md:col-span-2">
                    <label className="text-body-sm font-label-sm text-on-surface" htmlFor={id('name')}>
                        상품명 <span className="text-error">*</span>
                    </label>
                    <input
                        id={id('name')}
                        className={INPUT_CLASS}
                        placeholder="예: 스트라이프 홈 유니폼 (상의+하의)"
                        type="text"
                        maxLength={MAX_TITLE}
                        value={product.name}
                        disabled={disabled}
                        {...a11y('name')}
                        onChange={(e) => onChange({ name: e.target.value })}
                    />
                    {errorText('name')}
                </div>
                <div className="flex flex-col space-y-space-xs">
                    <label className="text-body-sm font-label-sm text-on-surface" htmlFor={id('category')}>
                        카테고리 <span className="text-error">*</span>
                    </label>
                    <select
                        id={id('category')}
                        className={INPUT_CLASS}
                        value={product.categoryId}
                        disabled={disabled}
                        {...a11y('category')}
                        onChange={(e) => onChange({ categoryId: e.target.value })}
                    >
                        <option value="">카테고리를 선택하세요</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                    {errorText('category')}
                </div>
                <div className="flex flex-col space-y-space-xs">
                    <label className="text-body-sm font-label-sm text-on-surface" htmlFor={id('price')}>
                        판매가 (KRW) <span className="text-error">*</span>
                    </label>
                    <div className="relative flex items-center">
                        <input
                            id={id('price')}
                            className={`${INPUT_CLASS} w-full pr-12`}
                            placeholder="0"
                            type="text"
                            inputMode="numeric"
                            value={product.price}
                            disabled={disabled}
                            {...a11y('price')}
                            onChange={(e) => {
                                const price = parsePrice(e.target.value);
                                onChange({ price: price === null ? '' : PRICE_FORMAT.format(Math.min(price, 999_999_999)) });
                            }}
                        />
                        <span className="absolute right-4 text-body-sm text-on-surface-variant font-label-sm">원</span>
                    </div>
                    {errorText('price')}
                </div>
                <div className="flex flex-col space-y-space-xs md:col-span-2">
                    <label className="text-body-sm font-label-sm text-on-surface flex justify-between" htmlFor={id('description')}>
                        <span>상품 설명</span>
                        <span className="text-caption text-on-surface-variant">
                            {product.description.length} / {MAX_TEXT}
                        </span>
                    </label>
                    <textarea
                        id={id('description')}
                        className="w-full p-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors resize-y disabled:opacity-60"
                        placeholder="소재, 사이즈 안내 등 이 상품만의 설명"
                        rows={3}
                        maxLength={MAX_TEXT}
                        value={product.description}
                        disabled={disabled}
                        {...a11y('description')}
                        onChange={(e) => onChange({ description: e.target.value })}
                    />
                    {errorText('description')}
                </div>
            </div>

            <ImagePicker
                productIndex={index}
                images={product.images}
                error={err('images')}
                errorKey={key('images')}
                totalRemaining={totalRemaining}
                disabled={disabled}
                onChange={(images) => onChange({ images })}
            />
            <OptionTable
                productIndex={index}
                rows={product.options}
                error={err('options')}
                errorKey={key('options')}
                disabled={disabled}
                onChange={(options) => onChange({ options })}
            />
        </fieldset>
    );
}
