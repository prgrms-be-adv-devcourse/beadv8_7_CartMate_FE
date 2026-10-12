'use client';

import { useState } from 'react';

const SCOPES = [
    { value: 'all', title: '전체 상품 공지', desc: '모든 그룹 구매 참여자에게 노출됩니다.' },
    { value: 'specific', title: '특정 상품 지정', desc: '선택한 특정 판매글 참여자에게만 노출됩니다.' },
];

export default function NoticeScopeSelect() {
    const [scope, setScope] = useState('all');

    return (
        <>
            <div className="flex flex-col gap-space-xs">
                <label className="text-label-md font-label-md text-on-surface">
                    공지 범위 선택 <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-space-md">
                    {SCOPES.map((item) => (
                        <label key={item.value} className="flex items-center gap-space-sm p-space-md rounded-lg border border-outline-variant bg-surface cursor-pointer hover:border-on-surface transition-all">
                            <input className="w-4 h-4 accent-primary" name="notice-scope" type="radio" value={item.value} checked={scope === item.value} onChange={() => setScope(item.value)} />
                            <div className="flex flex-col">
                                <span className="text-label-md font-label-md text-on-surface">{item.title}</span>
                                <span className="text-body-sm text-on-surface-variant">{item.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
            {scope === 'specific' && (
                <div className="flex flex-col gap-space-xs p-space-md bg-surface-container rounded-lg border border-outline-variant">
                    <label className="text-label-sm font-label-sm text-on-surface" htmlFor="product-target">대상 상품 검색</label>
                    <div className="flex gap-space-sm">
                        <input className="flex-1 h-[42px] px-space-md bg-surface border border-outline-variant rounded text-on-surface placeholder:text-outline focus:border-on-surface focus:outline-none text-body-md" id="product-target" placeholder="상품명 또는 판매글 번호 입력" type="text" />
                        <button className="px-space-lg h-[42px] bg-secondary text-on-secondary rounded text-label-md font-label-md hover:opacity-90 transition-opacity" type="button">상품 찾기</button>
                    </div>
                    <div className="text-caption text-on-surface-variant mt-space-xs">선택된 상품: 없음</div>
                </div>
            )}
        </>
    );
}
