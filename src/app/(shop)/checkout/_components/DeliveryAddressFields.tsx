'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import type { DeliveryAddressRequest, MemberProfileResponse } from '@/api/generated/model';
import { formatPhone } from '@/lib/format';

// 배송지 입력은 개인 주문서와 개인물품 공동구매 주문이 함께 쓴다. 길이 제한은 BE DeliveryAddressRequest 검증과 맞춘다.
export const deliveryAddressSchema = z.object({
    receiverName: z.string().trim().min(1, '받는 분 이름을 입력해주세요.').max(50, '50자 이하로 입력해주세요.'),
    receiverPhone: z
        .string()
        .trim()
        .min(1, '연락처를 입력해주세요.')
        .regex(/^0\d{1,2}-\d{3,4}-\d{4}$/, '010-0000-0000 형식으로 입력해주세요.'),
    zipCode: z.string().trim().min(1, '우편번호를 입력해주세요.').max(10, '10자 이하로 입력해주세요.'),
    address: z.string().trim().min(1, '주소를 입력해주세요.').max(255, '255자 이하로 입력해주세요.'),
    addressDetail: z.string().trim().max(255, '255자 이하로 입력해주세요.'),
});

export type DeliveryAddressInput = z.input<typeof deliveryAddressSchema>;

export const INPUT_CLASS =
    'w-full h-10 px-space-md border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface focus:border-primary outline-none';

// 회원 정보(연락처·기본 배송지)로 배송지 칸을 미리 채운다.
export function deliveryAddressDefaults(me: MemberProfileResponse | undefined): DeliveryAddressInput {
    return {
        // 닉네임은 실명이 아닐 수 있어 받는 분 이름은 비워 둔다.
        receiverName: '',
        receiverPhone: formatPhone(me?.phone ?? ''),
        zipCode: me?.defaultAddress?.zipCode ?? '',
        address: me?.defaultAddress?.basicAddress ?? '',
        addressDetail: me?.defaultAddress?.detailAddress ?? '',
    };
}

export function toDeliveryAddressRequest(values: z.output<typeof deliveryAddressSchema>): DeliveryAddressRequest {
    return {
        receiverName: values.receiverName,
        receiverPhone: values.receiverPhone,
        zipCode: values.zipCode,
        address: values.address,
        addressDetail: values.addressDetail || undefined,
    };
}

// 배송지 입력 칸. 바깥 폼을 FormProvider로 감싸서 쓴다.
export default function DeliveryAddressFields() {
    const {
        register,
        setValue,
        formState: { errors },
    } = useFormContext<DeliveryAddressInput>();

    return (
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
