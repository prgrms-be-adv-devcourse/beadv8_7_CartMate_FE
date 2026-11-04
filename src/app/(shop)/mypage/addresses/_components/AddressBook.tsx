'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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
import MyPageSidebar from '@/components/layout/MyPageSidebar';
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
const ACTION_BUTTON_CLASS =
    'h-8 px-space-sm border border-outline-variant bg-surface hover:border-primary text-on-surface-variant text-label-sm rounded transition-colors disabled:opacity-50';

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
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* 상단 */}
                <div className="flex items-center justify-between mb-space-xl">
                    <div>
                        <div className="font-caption text-caption text-outline uppercase tracking-wider mb-1">[ MY PAGE / SHIPPING ]</div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">배송지 관리</h1>
                    </div>
                    <button
                        className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-space-xs hover:bg-on-background transition-colors disabled:opacity-50"
                        type="button"
                        onClick={openAdd}
                        disabled={query.isPending || full}
                        title={full ? `배송지는 최대 ${MAX_ADDRESS_COUNT}개까지 등록할 수 있습니다.` : undefined}
                    >
                        <Icon name="add" className="text-[18px]" />
                        새 배송지 추가
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-gutter items-start">
                    <div className="col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                        <div className="p-space-sm bg-surface-container border border-outline-variant rounded text-caption">
                            <div className="font-bold text-on-surface mb-1">단체 주문 안내</div>
                            <p className="text-on-surface-variant">대량 배송지 분할 등록 및 화물 택배 문의는 고객센터(1644-0000)를 이용해주세요.</p>
                        </div>
                    </div>

                    <section className="col-span-9 flex flex-col gap-space-md">
                        {/* 개수 */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded flex items-center justify-between">
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                                등록된 배송지 <span className="font-bold text-primary">{addresses.length}</span>개{' '}
                                <span className="text-outline">(최대 {MAX_ADDRESS_COUNT}개까지 등록 가능)</span>
                            </div>
                            <div className="flex items-center gap-space-xs text-caption text-outline">
                                <Icon name="info" className="text-[14px]" />
                                기본 배송지는 주문 시 자동 선택됩니다.
                            </div>
                        </div>

                        {/* 목록 */}
                        {query.isPending ? (
                            <div className="h-48 rounded bg-surface-container animate-pulse" aria-hidden />
                        ) : query.isError ? (
                            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl flex flex-col items-center gap-space-md">
                                <p className="font-body-sm text-body-sm text-error">{errorMessage(query.error, '배송지를 불러오지 못했습니다.')}</p>
                                <button className={ACTION_BUTTON_CLASS} type="button" onClick={() => void query.refetch()}>
                                    다시 시도
                                </button>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="bg-surface-container-lowest border border-outline-variant rounded p-space-xl flex flex-col items-center gap-space-md">
                                <Icon name="location_off" className="text-[32px] text-outline" />
                                <p className="font-body-sm text-body-sm text-outline">등록된 배송지가 없습니다.</p>
                                <button className={ACTION_BUTTON_CLASS} type="button" onClick={openAdd}>
                                    첫 배송지 등록하기
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-space-md">
                                {addresses.map((item) => {
                                    const isDefault = item.defaultAddress === true;
                                    const busy = busyId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`bg-surface-container-lowest border p-space-lg rounded relative flex flex-col gap-space-md ${
                                                isDefault ? 'border-primary' : 'border-outline-variant'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
                                                <div className="flex items-center gap-space-sm">
                                                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                                        {item.addressName ?? item.receiverName}
                                                    </span>
                                                    {isDefault && (
                                                        <span className="font-caption text-caption px-2 py-0.5 bg-primary text-on-primary rounded-full">기본 배송지</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-space-xs">
                                                    {!isDefault && (
                                                        <button
                                                            className={ACTION_BUTTON_CLASS}
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() => item.id !== undefined && makeDefault.mutate({ addressId: item.id })}
                                                        >
                                                            기본배송지 지정
                                                        </button>
                                                    )}
                                                    <button className={ACTION_BUTTON_CLASS} type="button" disabled={busy} onClick={() => openEdit(item)}>
                                                        수정
                                                    </button>
                                                    <button
                                                        className="h-8 px-space-sm border border-outline-variant bg-surface hover:border-error hover:text-error text-on-surface-variant text-label-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
                                                        disabled={isDefault || busy}
                                                        title={isDefault ? '기본 배송지는 다른 배송지를 기본으로 지정한 뒤 삭제할 수 있습니다.' : undefined}
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-space-md font-body-sm text-body-sm text-on-surface-variant">
                                                <div>
                                                    <span className="text-outline block mb-1">수령인 / 연락처</span>
                                                    <span className="font-bold text-on-surface">{item.receiverName}</span> / {item.receiverPhone}
                                                </div>
                                                <div>
                                                    <span className="text-outline block mb-1">배송 주소</span>
                                                    <span className="text-on-surface">
                                                        [{item.zipCode}] {item.basicAddress}
                                                        {item.detailAddress ? `, ${item.detailAddress}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* 추가·수정 모달 */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg w-[480px] p-space-xl shadow-xl flex flex-col gap-space-lg">
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
                            <div className="grid grid-cols-2 gap-space-md">
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
                                <button
                                    className="h-10 px-space-md border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded hover:bg-surface transition-colors"
                                    type="button"
                                    onClick={() => setModal(null)}
                                >
                                    취소
                                </button>
                                <button
                                    className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-on-background transition-colors disabled:opacity-60"
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving ? '저장 중...' : '저장하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}