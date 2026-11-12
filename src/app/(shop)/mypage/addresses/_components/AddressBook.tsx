'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, Heading, Text } from '@astryxdesign/core';
import { useQueryClient } from '@tanstack/react-query';
import {
    getGetMyAddressesQueryKey,
    useCreateMyAddress,
    useDeleteMyAddress,
    useGetMyAddresses,
    useMakeDefaultMyAddress,
    useUpdateMyAddress,
} from '@/api/generated/member-address-controller/member-address-controller';
import { getProfileQueryKey } from '@/api/generated/member-controller/member-controller';
import type { MemberAddressResponse } from '@/api/generated/model';
import { ApiError, errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import MyPageShell from '@/components/layout/MyPageShell';
import { formatPhone } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

type Form = {
    addressName: string;
    receiverName: string;
    receiverPhone: string;
    zipCode: string;
    basicAddress: string;
    detailAddress: string;
    makeDefault: boolean;
};

const EMPTY_FORM: Form = {
    addressName: '',
    receiverName: '',
    receiverPhone: '',
    zipCode: '',
    basicAddress: '',
    detailAddress: '',
    makeDefault: false,
};

const MAX_ADDRESS_COUNT = 10; // BE MemberPolicy.MAX_ADDRESS_COUNT 와 같은 값

const INPUT_CLASS =
    'w-full h-[42px] border border-outline-variant rounded px-space-md text-body-sm outline-none focus:border-primary bg-surface-container-lowest text-on-surface';

type ModalState = { mode: 'add' } | { mode: 'edit'; address: MemberAddressResponse } | null;

// ===== 다음(카카오) 우편번호 서비스 =====
// 필요할 때 한 번만 스크립트를 불러온다.
type DaumPostcodeData = { zonecode: string; roadAddress: string; jibunAddress: string; buildingName: string };
type DaumPostcode = new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };

declare global {
    interface Window {
        daum?: { Postcode: DaumPostcode };
    }
}

let postcodeScript: Promise<void> | null = null;

function loadPostcode(): Promise<void> {
    if (window.daum?.Postcode) return Promise.resolve();
    if (!postcodeScript) {
        postcodeScript = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.onload = () => resolve();
            script.onerror = () => {
                postcodeScript = null;
                reject(new Error('우편번호 서비스를 불러오지 못했습니다.'));
            };
            document.body.appendChild(script);
        });
    }
    return postcodeScript;
}

// 배송지 목록 + 추가/수정 모달
export default function AddressBook() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const query = useGetMyAddresses();
    const addresses = query.data?.data ?? [];

    // 비로그인이면 로그인 페이지로
    useEffect(() => {
        if (query.error instanceof ApiError && query.error.status === 401) {
            router.replace(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.addresses)}`);
        }
    }, [query.error, router]);

    // 배송지가 바뀌면 목록과, 기본 배송지를 보여 주는 회원정보·주문서도 다시 받는다
    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: getGetMyAddressesQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getProfileQueryKey() });
    };

    const [modal, setModal] = useState<ModalState>(null);
    const [form, setForm] = useState<Form>(EMPTY_FORM);
    const [formError, setFormError] = useState<string | null>(null);

    const create = useCreateMyAddress({
        mutation: {
            onSuccess: () => {
                refresh();
                setModal(null);
            },
            onError: (e) => setFormError(errorMessage(e, '저장 중 오류가 발생했습니다.')),
        },
    });
    const update = useUpdateMyAddress({
        mutation: {
            onSuccess: () => {
                refresh();
                setModal(null);
            },
            onError: (e) => setFormError(errorMessage(e, '저장 중 오류가 발생했습니다.')),
        },
    });
    const makeDefault = useMakeDefaultMyAddress({
        mutation: {
            onSuccess: refresh,
            onError: (e) => alert(errorMessage(e, '기본 배송지 지정에 실패했습니다.')),
        },
    });
    const remove = useDeleteMyAddress({
        mutation: {
            onSuccess: refresh,
            onError: (e) => alert(errorMessage(e, '삭제에 실패했습니다.')),
        },
    });

    const saving = create.isPending || update.isPending;
    const busyId = makeDefault.isPending
        ? makeDefault.variables?.addressId
        : remove.isPending
          ? remove.variables?.addressId
          : undefined;

    const openAdd = () => {
        // 첫 배송지면 자동으로 기본 배송지가 되므로 체크해 둔다
        setForm({ ...EMPTY_FORM, makeDefault: addresses.length === 0 });
        setFormError(null);
        setModal({ mode: 'add' });
    };

    const openEdit = (address: MemberAddressResponse) => {
        setForm({
            addressName: address.addressName ?? '',
            receiverName: address.receiverName ?? '',
            receiverPhone: address.receiverPhone ?? '',
            zipCode: address.zipCode ?? '',
            basicAddress: address.basicAddress ?? '',
            detailAddress: address.detailAddress ?? '',
            makeDefault: address.defaultAddress === true,
        });
        setFormError(null);
        setModal({ mode: 'edit', address });
    };

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));

    const openPostcode = async () => {
        try {
            await loadPostcode();
            new window.daum!.Postcode({
                oncomplete: (data) => {
                    const base = data.roadAddress || data.jibunAddress;
                    setForm((prev) => ({
                        ...prev,
                        zipCode: data.zonecode,
                        basicAddress: data.buildingName ? `${base} (${data.buildingName})` : base,
                    }));
                },
            }).open();
        } catch (e) {
            setFormError(errorMessage(e, '우편번호 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'));
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);

        if (!form.receiverName.trim() || !/^010-\d{4}-\d{4}$/.test(form.receiverPhone)) {
            setFormError('받는 분과 연락처(010-0000-0000)를 입력해주세요.');
            return;
        }
        if (!/^\d{5}$/.test(form.zipCode) || !form.basicAddress.trim()) {
            setFormError('우편번호 찾기로 주소를 입력해주세요.');
            return;
        }

        const data = {
            addressName: form.addressName.trim() || undefined,
            receiverName: form.receiverName.trim(),
            receiverPhone: form.receiverPhone,
            zipCode: form.zipCode,
            basicAddress: form.basicAddress.trim(),
            detailAddress: form.detailAddress.trim() || undefined,
            makeDefault: form.makeDefault,
        };

        if (modal?.mode === 'edit' && modal.address.id !== undefined) {
            update.mutate({ addressId: modal.address.id, data });
        } else {
            create.mutate({ data });
        }
    };

    const handleDelete = (address: MemberAddressResponse) => {
        if (address.id === undefined) return;
        if (!window.confirm(`[${address.addressName ?? address.basicAddress}] 배송지를 삭제하시겠습니까?`)) return;
        remove.mutate({ addressId: address.id });
    };

    const full = addresses.length >= MAX_ADDRESS_COUNT;
    const editing = modal?.mode === 'edit' ? modal.address : null;

    return (
        <>
            <MyPageShell
                title="배송지 관리"
                description="주문할 때 받을 곳을 등록하고 기본 배송지를 정합니다."
                headerActions={
                    <div title={full ? `배송지는 최대 ${MAX_ADDRESS_COUNT}개까지 등록할 수 있습니다.` : undefined}>
                        <Button label="새 배송지 추가" variant="primary" type="button" onClick={openAdd} isDisabled={query.isPending || full} />
                    </div>
                }
            >
                {/* 회원정보 수정 화면과 같은 틀: 카드 하나 + 제목 줄 + 안쪽 상자 목록 */}
                <Card>
                    <div className="flex flex-wrap gap-space-sm items-center justify-between mb-space-xl">
                        <div>
                            <Heading level={2}>등록된 배송지</Heading>
                            <Text color="secondary">기본 배송지는 주문할 때 자동으로 선택됩니다.</Text>
                        </div>
                        <span className="font-caption text-caption px-space-sm py-1 bg-surface-container border border-outline-variant text-on-surface-variant rounded">
                            {query.isPending ? '-' : addresses.length} / {MAX_ADDRESS_COUNT}개
                        </span>
                    </div>

                    {query.isPending ? (
                        <div className="h-32 rounded bg-surface-container animate-pulse" aria-hidden />
                    ) : query.isError ? (
                        <div className="flex flex-wrap gap-space-sm items-center justify-between p-space-md border border-outline-variant bg-surface-container-low rounded">
                            <p className="font-body-sm text-body-sm text-error">{errorMessage(query.error, '배송지를 불러오지 못했습니다.')}</p>
                            <Button label="다시 시도" variant="secondary" size="sm" type="button" onClick={() => void query.refetch()} />
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="flex flex-wrap gap-space-sm items-center justify-between p-space-md border border-outline-variant bg-surface-container-low rounded">
                            <div className="font-body-sm text-body-sm text-outline">등록된 배송지가 없습니다.</div>
                            <Button label="등록" variant="secondary" size="sm" type="button" onClick={openAdd} />
                        </div>
                    ) : (
                        <ul className="flex flex-col gap-space-md">
                            {addresses.map((item) => {
                                const isDefault = item.defaultAddress === true;
                                const busy = busyId === item.id;
                                return (
                                    <li
                                        key={item.id}
                                        className="flex flex-wrap gap-space-md items-start justify-between p-space-md border border-outline-variant bg-surface-container-low rounded"
                                    >
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <div className="flex items-center gap-space-xs mb-1">
                                                <span className="font-body-lg text-body-lg text-on-surface font-semibold">
                                                    {item.addressName ?? item.receiverName}
                                                </span>
                                                {isDefault && <Badge variant="blue" label="기본" />}
                                            </div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                                                {item.receiverName} · {item.receiverPhone}
                                            </div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                                                [{item.zipCode}] {item.basicAddress}
                                                {item.detailAddress ? `, ${item.detailAddress}` : ''}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-space-xs">
                                            {!isDefault && (
                                                <Button
                                                    label="기본으로 지정"
                                                    variant="secondary"
                                                    size="sm"
                                                    type="button"
                                                    isDisabled={busy}
                                                    onClick={() => item.id !== undefined && makeDefault.mutate({ addressId: item.id })}
                                                />
                                            )}
                                            <Button label="수정" variant="secondary" size="sm" type="button" isDisabled={busy} onClick={() => openEdit(item)} />
                                            <span title={isDefault ? '기본 배송지는 다른 배송지를 기본으로 지정한 뒤 삭제할 수 있습니다.' : undefined}>
                                                <Button
                                                    label="삭제"
                                                    variant="secondary"
                                                    size="sm"
                                                    type="button"
                                                    isDisabled={isDefault || busy}
                                                    onClick={() => handleDelete(item)}
                                                />
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    <p className="mt-space-xl pt-space-md border-t border-surface-container font-caption text-caption text-outline">
                        대량 배송지 분할 등록이나 화물 택배는 고객센터(1644-0000)로 문의해주세요.
                    </p>
                </Card>
            </MyPageShell>

            {/* 추가·수정 모달 */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg w-full max-w-[480px] max-h-full overflow-y-auto p-space-xl shadow-xl flex flex-col gap-space-lg">
                        <div className="flex items-center justify-between border-b border-surface-container pb-space-md">
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{editing ? '배송지 수정' : '새 배송지 추가'}</h3>
                            <button className="text-outline hover:text-on-surface" type="button" onClick={() => setModal(null)} aria-label="닫기">
                                <Icon name="close" />
                            </button>
                        </div>
                        <form className="flex flex-col gap-space-md" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-name">
                                    배송지 명칭 <span className="text-outline">(선택)</span>
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="input-name"
                                    placeholder="예: 우리팀 홈구장, 회사 사무실"
                                    maxLength={50}
                                    value={form.addressName}
                                    onChange={(e) => set('addressName', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-recipient">
                                        수령인
                                    </label>
                                    <input
                                        className={INPUT_CLASS}
                                        id="input-recipient"
                                        placeholder="이름 입력"
                                        maxLength={50}
                                        value={form.receiverName}
                                        onChange={(e) => set('receiverName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-phone">
                                        연락처
                                    </label>
                                    <input
                                        className={INPUT_CLASS}
                                        id="input-phone"
                                        placeholder="010-0000-0000"
                                        inputMode="numeric"
                                        value={form.receiverPhone}
                                        onChange={(e) => set('receiverPhone', formatPhone(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-zipcode">
                                    주소
                                </label>
                                <div className="flex gap-space-xs mb-2">
                                    <input
                                        className="w-32 h-[42px] border border-outline-variant rounded px-space-md text-body-sm bg-surface-container text-on-surface"
                                        id="input-zipcode"
                                        placeholder="우편번호"
                                        readOnly
                                        value={form.zipCode}
                                    />
                                    <button
                                        className="h-[42px] px-space-md border border-outline-variant bg-surface hover:border-primary font-label-sm text-label-sm rounded text-on-surface-variant transition-colors"
                                        type="button"
                                        onClick={openPostcode}
                                    >
                                        우편번호 찾기
                                    </button>
                                </div>
                                <input
                                    className={`${INPUT_CLASS} mb-2 bg-surface-container`}
                                    id="input-address1"
                                    placeholder="우편번호 찾기로 입력됩니다"
                                    readOnly
                                    value={form.basicAddress}
                                />
                                <input
                                    className={INPUT_CLASS}
                                    id="input-address2"
                                    placeholder="상세 주소 입력 (동·호수 등)"
                                    maxLength={255}
                                    value={form.detailAddress}
                                    onChange={(e) => set('detailAddress', e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-space-xs pt-2">
                                <input
                                    className="w-4 h-4 accent-primary"
                                    id="input-default"
                                    type="checkbox"
                                    checked={form.makeDefault}
                                    // 이미 기본인 배송지를 수정할 때는 해제할 수 없다 (다른 배송지를 기본으로 지정해서 바꾼다)
                                    disabled={editing?.defaultAddress === true || addresses.length === 0}
                                    onChange={(e) => set('makeDefault', e.target.checked)}
                                />
                                <label className="font-body-sm text-body-sm text-on-surface cursor-pointer" htmlFor="input-default">
                                    기본 배송지로 설정
                                </label>
                            </div>

                            {formError && (
                                <p className="font-body-sm text-body-sm text-error" role="alert">
                                    {formError}
                                </p>
                            )}

                            <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container">
                                <Button label="취소" variant="secondary" type="button" onClick={() => setModal(null)} />
                                <Button label="저장하기" variant="primary" type="submit" isLoading={saving} isDisabled={saving} />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
