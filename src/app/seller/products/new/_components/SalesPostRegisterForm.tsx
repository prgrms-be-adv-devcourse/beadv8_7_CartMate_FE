'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useCurrentUser } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { registerSalesPostMultipart } from '../_lib/registerSalesPost';
import OptionTable from './OptionTable';

const EDITOR_TOOLS = ['format_bold', 'format_italic', 'format_underlined'];
const EDITOR_TOOLS_2 = ['format_list_bulleted', 'image'];

const CATEGORIES = [
    { id: 1, label: '유니폼 / 의류' },
    { id: 2, label: '운동 용품' },
    { id: 3, label: '신발 / 보호구' },
    { id: 4, label: '단체 액세서리' },
] as const;

const INPUT_CLASS =
    'h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors';

// 판매글 등록 → POST /api/sales-posts (multipart: request JSON + images)
export default function SalesPostRegisterForm() {
    const { user, isLoading } = useCurrentUser();
    const register = useMutation({
        mutationFn: ({ request, images: files }: { request: Parameters<typeof registerSalesPostMultipart>[0]; images: Blob[] }) =>
            registerSalesPostMultipart(request, files),
    });
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState<File[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);

        if (!user?.id) {
            setFormError('로그인이 필요합니다.');
            return;
        }
        if (images.length === 0) {
            setFormError('대표 이미지를 1장 이상 등록해주세요.');
            return;
        }

        const form = new FormData(event.currentTarget);
        const title = String(form.get('title') ?? '').trim();
        const content = String(form.get('content') ?? '').trim();
        const categoryId = Number(form.get('categoryId'));
        const name = String(form.get('productName') ?? '').trim();
        const basePrice = Number(form.get('basePrice'));

        if (!title || !name || !Number.isFinite(categoryId) || categoryId <= 0 || !Number.isFinite(basePrice) || basePrice < 0) {
            setFormError('필수 항목을 확인해주세요.');
            return;
        }

        register.mutate(
            {
                request: {
                    sellerId: user.id,
                    title,
                    content: content || title,
                    productList: [
                        {
                            categoryId,
                            name,
                            description: content || `${name} 상세 설명`,
                            basePrice,
                            productImageList: images.map((_, index) => ({ imageSeq: index + 1 })),
                        },
                    ],
                },
                images,
            },
            {
                onSuccess: () => {
                    window.location.assign(ROUTES.sellerProducts);
                },
                onError: (error) => {
                    setFormError(errorMessage(error, '판매글 등록에 실패했습니다.'));
                },
            },
        );
    }

    function onPickImages(fileList: FileList | null) {
        if (!fileList?.length) return;
        setImages((prev) => [...prev, ...Array.from(fileList)].slice(0, 5));
    }

    return (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-space-xl" onSubmit={onSubmit} noValidate>
            <div className="lg:col-span-2 space-y-space-xl">
                <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
                    <div className="border-b border-outline-variant/30 pb-space-md">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">기본 정보</h2>
                        <p className="text-body-sm text-on-surface-variant">상품의 기본 제목, 카테고리 및 가격을 설정합니다.</p>
                    </div>
                    <div className="space-y-space-lg">
                        <div className="flex flex-col space-y-space-xs">
                            <label className="text-body-sm font-label-sm text-on-surface" htmlFor="sales-title">
                                판매글 제목 <span className="text-error">*</span>
                            </label>
                            <input
                                className={INPUT_CLASS}
                                id="sales-title"
                                name="title"
                                placeholder="예: 2024시즌 프로팀 단체 유니폼 공동구매"
                                type="text"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-sm text-on-surface" htmlFor="sales-category">
                                    카테고리 선택 <span className="text-error">*</span>
                                </label>
                                <select className={INPUT_CLASS} id="sales-category" name="categoryId" defaultValue="" required>
                                    <option value="" disabled>
                                        카테고리를 선택하세요
                                    </option>
                                    {CATEGORIES.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col space-y-space-xs">
                                <label className="text-body-sm font-label-sm text-on-surface" htmlFor="sales-product-name">
                                    상품명 <span className="text-error">*</span>
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="sales-product-name"
                                    name="productName"
                                    placeholder="예: 에어로 유니폼 상하의"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-space-xs">
                            <label className="text-body-sm font-label-sm text-on-surface" htmlFor="sales-price">
                                기본 가격 (KRW) <span className="text-error">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    className={`${INPUT_CLASS} w-full pl-space-md pr-12`}
                                    id="sales-price"
                                    name="basePrice"
                                    placeholder="0"
                                    type="number"
                                    min={0}
                                    step={1}
                                    required
                                />
                                <span className="absolute right-4 text-body-sm text-on-surface-variant font-label-sm">원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
                    <div className="border-b border-outline-variant/30 pb-space-md">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">상세 설명</h2>
                        <p className="text-body-sm text-on-surface-variant">상품의 상세 스펙, 사이즈 가이드 및 주의사항을 입력하세요.</p>
                    </div>
                    <div className="flex flex-col space-y-space-xs">
                        <div className="flex items-center justify-between border border-outline-variant border-b-0 rounded-t bg-surface-container px-space-md py-space-xs">
                            <div className="flex items-center gap-space-md text-on-surface-variant">
                                {EDITOR_TOOLS.map((tool) => (
                                    <button key={tool} className="p-1 hover:text-on-surface transition-colors" type="button" tabIndex={-1}>
                                        <Icon name={tool} className="text-[18px]" />
                                    </button>
                                ))}
                                <div className="w-[1px] h-4 bg-outline-variant" />
                                {EDITOR_TOOLS_2.map((tool) => (
                                    <button key={tool} className="p-1 hover:text-on-surface transition-colors" type="button" tabIndex={-1}>
                                        <Icon name={tool} className="text-[18px]" />
                                    </button>
                                ))}
                            </div>
                            <span className="text-caption text-outline">Markdown / HTML Supported</span>
                        </div>
                        <textarea
                            className="w-full p-space-md bg-surface border border-outline-variant rounded-b text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors resize-y"
                            name="content"
                            placeholder="상세 내용을 입력하세요..."
                            rows={8}
                        />
                    </div>
                </div>

                <OptionTable />
            </div>

            <div className="space-y-space-xl">
                <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg sticky top-24">
                    <div className="border-b border-outline-variant/30 pb-space-md">
                        <h2 className="text-headline-sm font-headline-sm text-on-surface">이미지 업로드</h2>
                        <p className="text-body-sm text-on-surface-variant">대표 상품 이미지를 등록하세요. (최대 5장)</p>
                    </div>
                    <div className="flex flex-col space-y-space-md">
                        <input
                            ref={imageInputRef}
                            className="sr-only"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                onPickImages(e.target.files);
                                e.target.value = '';
                            }}
                        />
                        <button
                            className="relative w-full aspect-square border-2 border-dashed border-outline-variant rounded-xl bg-surface flex flex-col items-center justify-center p-space-lg text-center hover:border-primary transition-colors cursor-pointer group"
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-space-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                <Icon name="add_a_photo" className="text-[24px]" />
                            </div>
                            <span className="text-label-md text-on-surface mb-space-xs">
                                {images.length > 0 ? `${images.length}장 선택됨` : '대표 이미지 업로드'}
                            </span>
                            <span className="text-caption text-outline">CLICK TO BROWSE (최대 5장)</span>
                        </button>
                        {images.length > 0 && (
                            <ul className="grid grid-cols-4 gap-space-sm">
                                {images.map((file, index) => (
                                    <li
                                        key={`${file.name}-${index}`}
                                        className="aspect-square bg-surface border border-outline-variant rounded flex items-center justify-center text-caption text-on-surface-variant p-1 text-center relative"
                                        title={file.name}
                                    >
                                        <span className="line-clamp-3 break-all">{file.name}</span>
                                        <button
                                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-on-surface/70 text-surface text-[10px] flex items-center justify-center"
                                            type="button"
                                            aria-label="이미지 제거"
                                            onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    {(formError || register.isError) && (
                        <p className="text-caption text-error" role="alert">
                            {formError ?? errorMessage(register.error, '판매글 등록에 실패했습니다.')}
                        </p>
                    )}
                    <div className="pt-space-md border-t border-outline-variant/30 flex flex-col gap-space-sm">
                        <button
                            className="w-full h-12 bg-primary text-on-primary rounded font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-space-sm disabled:opacity-60"
                            type="submit"
                            disabled={register.isPending || isLoading}
                        >
                            <Icon name="check" className="text-[18px]" />
                            {register.isPending ? '등록 중...' : '저장 및 등록 완료'}
                        </button>
                        <Link
                            href={ROUTES.sellerProducts}
                            className="w-full h-12 bg-surface border border-outline-variant text-on-surface rounded font-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-space-sm"
                        >
                            취소
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
