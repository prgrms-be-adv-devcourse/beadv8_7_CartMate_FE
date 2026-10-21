'use client';

import Icon from '@/components/ui/Icon';
import { OPTION_TYPES, errorId, nextKey, type OptionRow } from './salesPostDraft';

const SELECT_CLASS =
    'w-full h-9 px-space-sm bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed';

type Props = {
    productIndex: number;
    rows: OptionRow[];
    error?: string;
    errorKey: string;
    disabled: boolean;
    onChange: (rows: OptionRow[]) => void;
};

// 상품 옵션(#47). BE는 { 옵션 종류 id, 옵션 값 id } 쌍만 저장한다.
// 옵션별 추가 금액·재고는 BE가 받지 않아 칸을 비활성 + "준비 중"으로 둔다.
export default function OptionTable({ productIndex, rows, error, errorKey, disabled, onChange }: Props) {
    const addRow = () => {
        const type = OPTION_TYPES[0];
        onChange([...rows, { key: nextKey(), typeId: type.id, optionId: type.options[0].id }]);
    };

    const updateRow = (key: number, patch: Partial<OptionRow>) => {
        onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    };

    return (
        <div className="space-y-space-sm" data-testid={`product-${productIndex}-options`}>
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-body-sm font-label-sm text-on-surface">옵션 (사이즈 / 색상)</span>
                    <p className="text-caption text-on-surface-variant">옵션이 없으면 비워 두세요.</p>
                </div>
                <button
                    className="h-9 px-space-md rounded bg-surface-container-high text-on-surface font-label-sm hover:bg-surface-variant transition-colors flex items-center gap-space-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                    onClick={addRow}
                    disabled={disabled}
                    data-testid={`product-${productIndex}-add-option`}
                    data-field={errorKey}
                    aria-describedby={error ? errorId(errorKey) : undefined}
                >
                    <Icon name="add" className="text-[16px]" />
                    옵션 추가
                </button>
            </div>
            {rows.length > 0 && (
                <div className="overflow-x-auto border border-outline-variant/40 rounded">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container text-caption font-label-sm text-on-surface-variant">
                                <th className="p-space-sm">옵션 종류</th>
                                <th className="p-space-sm">옵션 값</th>
                                <th className="p-space-sm whitespace-nowrap">추가 금액 (준비 중)</th>
                                <th className="p-space-sm whitespace-nowrap">재고 (준비 중)</th>
                                <th className="p-space-sm text-center w-14">삭제</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30 text-body-md text-on-surface">
                            {rows.map((row, i) => {
                                const type = OPTION_TYPES.find((t) => t.id === row.typeId) ?? OPTION_TYPES[0];
                                return (
                                    <tr key={row.key}>
                                        <td className="p-space-sm min-w-28">
                                            <select
                                                className={SELECT_CLASS}
                                                aria-label={`옵션 ${i + 1} 종류`}
                                                value={row.typeId}
                                                disabled={disabled}
                                                onChange={(e) => {
                                                    const next = OPTION_TYPES.find((t) => t.id === Number(e.target.value)) ?? OPTION_TYPES[0];
                                                    updateRow(row.key, { typeId: next.id, optionId: next.options[0].id });
                                                }}
                                            >
                                                {OPTION_TYPES.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-space-sm min-w-28">
                                            <select
                                                className={SELECT_CLASS}
                                                aria-label={`옵션 ${i + 1} 값`}
                                                value={row.optionId}
                                                disabled={disabled}
                                                onChange={(e) => updateRow(row.key, { optionId: Number(e.target.value) })}
                                            >
                                                {type.options.map((o) => (
                                                    <option key={o.id} value={o.id}>
                                                        {o.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-space-sm">
                                            <input className={SELECT_CLASS} type="text" placeholder="0" disabled title="준비 중인 기능입니다" aria-label="추가 금액 (준비 중)" />
                                        </td>
                                        <td className="p-space-sm">
                                            <input className={SELECT_CLASS} type="text" placeholder="-" disabled title="준비 중인 기능입니다" aria-label="재고 (준비 중)" />
                                        </td>
                                        <td className="p-space-sm text-center">
                                            <button
                                                className="p-1 rounded text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-60"
                                                type="button"
                                                aria-label={`옵션 ${i + 1} 삭제`}
                                                disabled={disabled}
                                                onClick={() => onChange(rows.filter((r) => r.key !== row.key))}
                                            >
                                                <Icon name="delete" className="text-[18px]" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {error && (
                <p id={errorId(errorKey)} className="text-caption text-error">
                    {error}
                </p>
            )}
        </div>
    );
}
