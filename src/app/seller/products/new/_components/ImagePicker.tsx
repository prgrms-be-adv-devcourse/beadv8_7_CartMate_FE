'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, MAX_IMAGES_PER_PRODUCT, MAX_TOTAL_IMAGES, errorId, nextKey, type ImageItem } from './salesPostDraft';

const ALLOWED_TYPES = IMAGE_ACCEPT.split(',');

type Props = {
    productIndex: number;
    images: ImageItem[];
    error?: string;
    errorKey: string;
    // 판매글 전체에서 더 올릴 수 있는 장수 (BE 합계 20장 제한)
    totalRemaining: number;
    disabled: boolean;
    onChange: (images: ImageItem[]) => void;
};

// 상품 이미지 고르기 + 미리보기. 첫 장이 대표 이미지(imageSeq 0)가 된다.
export default function ImagePicker({ productIndex, images, error, errorKey, totalRemaining, disabled, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const perProductRemaining = MAX_IMAGES_PER_PRODUCT - images.length;
    const remaining = Math.max(Math.min(perProductRemaining, totalRemaining), 0);
    const limitedByTotal = totalRemaining < perProductRemaining;

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const picked = Array.from(files);
        const wrongType = picked.filter((f) => !ALLOWED_TYPES.includes(f.type));
        const tooBig = picked.filter((f) => ALLOWED_TYPES.includes(f.type) && f.size > MAX_IMAGE_BYTES);
        const valid = picked.filter((f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_IMAGE_BYTES);
        const accepted = valid.slice(0, remaining);

        const messages: string[] = [];
        if (wrongType.length > 0) messages.push(`JPEG·PNG·WEBP만 올릴 수 있어 ${wrongType.length}장을 제외했습니다.`);
        if (tooBig.length > 0) messages.push(`1MB가 넘는 ${tooBig.length}장을 제외했습니다.`);
        if (valid.length > accepted.length) {
            messages.push(
                limitedByTotal
                    ? `이미지는 판매글 전체에서 ${MAX_TOTAL_IMAGES}장까지 올릴 수 있습니다.`
                    : `상품당 ${MAX_IMAGES_PER_PRODUCT}장까지 올릴 수 있습니다.`,
            );
        }
        setNotice(messages.length > 0 ? messages.join(' ') : null);

        if (accepted.length > 0) onChange([...images, ...accepted.map((file) => ({ key: nextKey(), file }))]);
    };

    const remove = (key: number) => {
        setNotice(null);
        onChange(images.filter((img) => img.key !== key));
    };

    const makeMain = (key: number) => {
        const target = images.find((img) => img.key === key);
        if (!target) return;
        onChange([target, ...images.filter((img) => img.key !== key)]);
    };

    return (
        <div className="space-y-space-sm">
            <div className="flex items-center justify-between">
                <span className="text-body-sm font-label-sm text-on-surface">
                    상품 이미지 <span className="text-error">*</span>
                </span>
                <span className="text-caption text-on-surface-variant">
                    {images.length} / {MAX_IMAGES_PER_PRODUCT}장 · JPEG·PNG·WEBP, 1장 1MB 이하
                </span>
            </div>
            <input
                ref={inputRef}
                className="sr-only"
                type="file"
                accept={IMAGE_ACCEPT}
                multiple
                disabled={disabled || remaining <= 0}
                data-testid={`product-${productIndex}-images`}
                aria-label={`상품 ${productIndex + 1} 이미지 선택`}
                onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                }}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-space-sm">
                {images.map((img, i) => (
                    <div key={img.key} className="relative aspect-square rounded border border-outline-variant overflow-hidden bg-surface group">
                        <Thumb file={img.file} />
                        {i === 0 ? (
                            <span className="absolute left-1 top-1 px-1.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-label-sm">대표</span>
                        ) : (
                            <button
                                type="button"
                                className="absolute left-1 top-1 px-1.5 py-0.5 rounded bg-surface/90 text-on-surface text-[10px] font-label-sm opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:hidden"
                                disabled={disabled}
                                onClick={() => makeMain(img.key)}
                            >
                                대표로
                            </button>
                        )}
                        <button
                            type="button"
                            className="absolute right-1 top-1 w-6 h-6 rounded-full bg-surface/90 text-on-surface flex items-center justify-center hover:bg-error-container hover:text-on-error-container disabled:hidden"
                            aria-label={`이미지 ${i + 1} 삭제`}
                            disabled={disabled}
                            onClick={() => remove(img.key)}
                        >
                            <Icon name="close" className="text-[14px]" />
                        </button>
                    </div>
                ))}
                {remaining > 0 && (
                    <button
                        type="button"
                        className="aspect-square border-2 border-dashed border-outline-variant rounded bg-surface flex flex-col items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={disabled}
                        data-field={errorKey}
                        aria-label={`상품 ${productIndex + 1} 이미지 추가`}
                        aria-describedby={error ? errorId(errorKey) : undefined}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Icon name="add_a_photo" className="text-[22px]" />
                        <span className="text-caption mt-1">{images.length === 0 ? '대표 이미지' : '추가'}</span>
                    </button>
                )}
            </div>
            {notice && <p className="text-caption text-on-surface-variant">{notice}</p>}
            {remaining <= 0 && limitedByTotal && images.length < MAX_IMAGES_PER_PRODUCT && (
                <p className="text-caption text-on-surface-variant">판매글 전체 이미지 {MAX_TOTAL_IMAGES}장을 모두 사용했습니다.</p>
            )}
            {error && (
                <p id={errorId(errorKey)} tabIndex={-1} className="text-caption text-error">
                    {error}
                </p>
            )}
        </div>
    );
}

// 고른 파일을 data URL로 읽어 미리보기한다. (blob URL은 개발 모드의 effect 두 번 실행에서 먼저 해제될 수 있다)
function Thumb({ file }: { file: File }) {
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => setSrc(typeof reader.result === 'string' ? reader.result : null);
        reader.readAsDataURL(file);
        return () => reader.abort();
    }, [file]);

    if (!src) return <div className="absolute inset-0 animate-pulse bg-surface-container" />;
    return <Image src={src} alt={file.name} fill unoptimized className="object-cover" />;
}
