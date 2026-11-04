'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

type OptionRow = {
    key: number;
    size: string;
    color: string;
    extra: string;
    stock: string;
};

const INITIAL_ROWS: OptionRow[] = [
    { key: 1, size: '95 (M)', color: '블랙 / 화이트', extra: '0', stock: '100' },
    { key: 2, size: '100 (L)', color: '블랙 / 화이트', extra: '0', stock: '150' },
];

const INPUT_CLASS = 'w-full h-9 px-space-sm bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none';

export default function OptionTable() {
    const [rows, setRows] = useState<OptionRow[]>(INITIAL_ROWS);
    const [nextKey, setNextKey] = useState(INITIAL_ROWS.length + 1);

    const addRow = () => {
        setRows([...rows, { key: nextKey, size: '', color: '', extra: '0', stock: '0' }]);
        setNextKey(nextKey + 1);
    };

    const deleteRow = (key: number) => {
        if (rows.length <= 1) {
            alert('최소 1개의 옵션 행이 필요합니다.');
            return;
        }
        setRows(rows.filter((row) => row.key !== key));
    };

    return (
        <div className="bg-surface-container-lowest p-space-xl rounded-xl border border-outline-variant/30 space-y-space-lg">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-md">
                <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">옵션 표 (사이즈 / 색상)</h2>
                    <p className="text-body-sm text-on-surface-variant">상품의 세부 옵션별 추가금액과 재고를 설정합니다.</p>
                </div>
                <button className="h-9 px-space-md rounded bg-surface-container-high text-on-surface font-label-sm hover:bg-surface-variant transition-colors flex items-center gap-space-xs" type="button" onClick={addRow}>
                    <Icon name="add" className="text-[16px]" />
                    행 추가
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-outline-variant bg-surface-container text-caption font-label-sm text-on-surface-variant">
                            <th className="p-space-md">사이즈</th>
                            <th className="p-space-md">색상</th>
                            <th className="p-space-md">추가 금액 (원)</th>
                            <th className="p-space-md">재고 수량</th>
                            <th className="p-space-md text-center w-16">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 text-body-md text-on-surface">
                        {rows.map((row) => (
                            <tr key={row.key}>
                                <td className="p-space-sm">
                                    <input className={INPUT_CLASS} type="text" defaultValue={row.size} placeholder="예: 105 (XL)" />
                                </td>
                                <td className="p-space-sm">
                                    <input className={INPUT_CLASS} type="text" defaultValue={row.color} placeholder="예: 블랙" />
                                </td>
                                <td className="p-space-sm">
                                    <input className={INPUT_CLASS} type="text" defaultValue={row.extra} />
                                </td>
                                <td className="p-space-sm">
                                    <input className={INPUT_CLASS} type="text" defaultValue={row.stock} />
                                </td>
                                <td className="p-space-sm text-center">
                                    <button className="p-1 rounded text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors" type="button" onClick={() => deleteRow(row.key)}>
                                        <Icon name="delete" className="text-[18px]" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
