'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import MyPageSidebar from '@/components/layout/MyPageSidebar';

type Address = {
    id: number;
    name: string;
    recipient: string;
    role: string;
    phone: string;
    address: string;
};

const INITIAL_ADDRESSES: Address[] = [
    {
        id: 1,
        name: 'FC 서울화이트 체육관',
        recipient: '김민수',
        role: '팀 대표',
        phone: '010-1234-5678',
        address: '[06234] 서울특별시 강남구 테헤란로 123, 팀바이빌딩 4층',
    },
    {
        id: 2,
        name: '용산 연습구장 라커룸',
        recipient: '이지훈',
        role: '총무',
        phone: '010-9876-5432',
        address: '[04312] 서울특별시 용산구 서빙고로 45, 한강맨션 상가 B1',
    },
    {
        id: 3,
        name: '송파구민체육센터 창고',
        recipient: '박성수',
        role: '장비담당',
        phone: '010-5555-4444',
        address: '[05510] 서울특별시 송파구 올림픽로 424, 체육센터 2관 관리실',
    },
];

const INPUT_CLASS =
    'w-full h-[42px] border border-outline-variant rounded px-space-md text-body-sm outline-none focus:border-primary bg-surface-container-lowest text-on-surface';
const ACTION_BUTTON_CLASS =
    'h-8 px-space-sm border border-outline-variant bg-surface hover:border-primary text-on-surface-variant text-label-sm rounded transition-colors';

type ModalState = { mode: 'add' } | { mode: 'edit'; address: Address } | null;

// 배송지 목록 + 추가/수정 모달 (기본 배송지 지정, 삭제 상태 관리)
export default function AddressBook() {
    const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
    const [defaultId, setDefaultId] = useState(INITIAL_ADDRESSES[0].id);
    const [modal, setModal] = useState<ModalState>(null);

    const editing = modal?.mode === 'edit' ? modal.address : null;

    function handleDelete(id: number) {
        if (window.confirm('해당 배송지를 삭제하시겠습니까?')) {
            setAddresses((prev) => prev.filter((item) => item.id !== id));
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        window.alert('배송지가 저장되었습니다.');
        setModal(null);
    }

    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[1200px] mx-auto w-full px-gutter py-space-xl">
                {/* Top breadcrumb / title context */}
                <div className="flex items-center justify-between mb-space-xl">
                    <div>
                        <div className="font-caption text-caption text-outline uppercase tracking-wider mb-1">[ MY PAGE / SHIPPING ]</div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">배송지 관리</h1>
                    </div>
                    <button
                        className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded flex items-center gap-space-xs hover:bg-on-background transition-colors"
                        type="button"
                        onClick={() => setModal({ mode: 'add' })}
                    >
                        <Icon name="add" className="text-[18px]" />
                        새 배송지 추가
                    </button>
                </div>

                {/* Layout Grid: Left Sidebar (3 cols), Right Content (9 cols) */}
                <div className="grid grid-cols-12 gap-gutter items-start">
                    <div className="col-span-3 flex flex-col gap-space-md">
                        <MyPageSidebar />
                        <div className="p-space-sm bg-surface-container border border-outline-variant rounded text-caption">
                            <div className="font-bold text-on-surface mb-1">단체 주문 안내</div>
                            <p className="text-on-surface-variant">대량 배송지 분할 등록 및 화물 택배 문의는 고객센터(1644-0000)를 이용해주세요.</p>
                        </div>
                    </div>

                    {/* Right Content (9 cols) */}
                    <section className="col-span-9 flex flex-col gap-space-md">
                        {/* Address Count Bar */}
                        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded flex items-center justify-between">
                            <div className="font-body-sm text-body-sm text-on-surface-variant">
                                등록된 배송지 <span className="font-bold text-primary">{addresses.length}</span>개{' '}
                                <span className="text-outline">(최대 10개까지 등록 가능)</span>
                            </div>
                            <div className="flex items-center gap-space-xs text-caption text-outline">
                                <Icon name="info" className="text-[14px]" />
                                기본 배송지는 주문 시 자동 선택됩니다.
                            </div>
                        </div>

                        {/* Address List Container */}
                        <div className="flex flex-col gap-space-md">
                            {addresses.map((item) => {
                                const isDefault = item.id === defaultId;
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-surface-container-lowest border p-space-lg rounded relative flex flex-col gap-space-md ${
                                            isDefault ? 'border-primary' : 'border-outline-variant'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between border-b border-surface-container pb-space-sm">
                                            <div className="flex items-center gap-space-sm">
                                                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{item.name}</span>
                                                {isDefault && (
                                                    <span className="font-caption text-caption px-2 py-0.5 bg-primary text-on-primary rounded-full">기본 배송지</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-space-xs">
                                                {!isDefault && (
                                                    <button className={ACTION_BUTTON_CLASS} type="button" onClick={() => setDefaultId(item.id)}>
                                                        기본배송지 지정
                                                    </button>
                                                )}
                                                <button
                                                    className={ACTION_BUTTON_CLASS}
                                                    type="button"
                                                    onClick={() => setModal({ mode: 'edit', address: item })}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="h-8 px-space-sm border border-outline-variant bg-surface hover:border-error hover:text-error text-on-surface-variant text-label-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-outline-variant disabled:hover:text-on-surface-variant"
                                                    disabled={isDefault}
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-space-md font-body-sm text-body-sm text-on-surface-variant">
                                            <div>
                                                <span className="text-outline block mb-1">수령인 / 연락처</span>
                                                <span className="font-bold text-on-surface">
                                                    {item.recipient} ({item.role})
                                                </span>{' '}
                                                / {item.phone}
                                            </div>
                                            <div>
                                                <span className="text-outline block mb-1">배송 주소</span>
                                                <span className="text-on-surface">{item.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>

            {/* Modal Backdrop & Dialog */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg w-[480px] p-space-xl shadow-xl flex flex-col gap-space-lg">
                        <div className="flex items-center justify-between border-b border-surface-container pb-space-md">
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                                {editing ? '배송지 수정' : '새 배송지 추가'}
                            </h3>
                            <button className="text-outline hover:text-on-surface" type="button" onClick={() => setModal(null)}>
                                <Icon name="close" />
                            </button>
                        </div>
                        <form key={editing?.id ?? 'new'} className="flex flex-col gap-space-md" onSubmit={handleSubmit}>
                            <div>
                                <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-name">
                                    배송지 명칭
                                </label>
                                <input
                                    className={INPUT_CLASS}
                                    id="input-name"
                                    placeholder="예: 우리팀 홈구장, 회사 사무실"
                                    required
                                    type="text"
                                    defaultValue={editing?.name}
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
                                        required
                                        type="text"
                                        defaultValue={editing?.recipient}
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
                                        required
                                        type="text"
                                        defaultValue={editing?.phone}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-body-sm text-body-sm text-on-surface-variant mb-space-xs" htmlFor="input-address1">
                                    주소
                                </label>
                                <div className="flex gap-space-xs mb-2">
                                    <input
                                        className="w-32 h-[42px] border border-outline-variant rounded px-space-md text-body-sm bg-surface-container text-on-surface"
                                        id="input-zipcode"
                                        placeholder="우편번호"
                                        readOnly
                                        type="text"
                                        defaultValue="06234"
                                    />
                                    <button
                                        className="h-[42px] px-space-md border border-outline-variant bg-surface hover:border-primary font-label-sm text-label-sm rounded text-on-surface-variant transition-colors"
                                        type="button"
                                    >
                                        우편번호 찾기
                                    </button>
                                </div>
                                <input
                                    className={`${INPUT_CLASS} mb-2`}
                                    id="input-address1"
                                    placeholder="기본 주소"
                                    required
                                    type="text"
                                    defaultValue="서울특별시 강남구 테헤란로 152"
                                />
                                <input className={INPUT_CLASS} id="input-address2" placeholder="상세 주소 입력" required type="text" />
                            </div>
                            <div className="flex items-center gap-space-xs pt-2">
                                <input className="w-4 h-4 accent-primary" id="input-default" type="checkbox" />
                                <label className="font-body-sm text-body-sm text-on-surface cursor-pointer" htmlFor="input-default">
                                    기본 배송지로 설정
                                </label>
                            </div>
                            <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container">
                                <button
                                    className="h-10 px-space-md border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded hover:bg-surface transition-colors"
                                    type="button"
                                    onClick={() => setModal(null)}
                                >
                                    취소
                                </button>
                                <button
                                    className="h-10 px-space-md bg-primary text-on-primary font-label-md text-label-md rounded hover:bg-on-background transition-colors"
                                    type="submit"
                                >
                                    저장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
