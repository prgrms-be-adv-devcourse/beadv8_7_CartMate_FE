'use client';

import { Fragment, useState } from 'react';
import { Button, Card, Heading, Text } from '@astryxdesign/core';
import { errorMessage } from '@/api/http';
import Icon from '@/components/ui/Icon';
import { useProductOptionTypes } from '../_lib/productOptions';

// 재고 한 행 = 상품옵션 조합 하나 + 추가금액 + 재고 수량 (BE CreateInventory와 같은 단위)
type InventoryRow = {
    key: number;
    // 옵션 종류(typeId)별로 고른 상품옵션(optionId). 아직 안 골랐으면 null
    optionIds: Record<number, number | null>;
    additionalPrice: string;
    stockQuantity: string;
};

type TableState = {
    typeIds: number[]; // 고른 옵션 종류(열) 순서
    rows: InventoryRow[];
    nextKey: number;
};

const SELECT_CLASS =
    'w-full h-9 px-space-sm bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none disabled:opacity-50';
const ROW_DIVIDER = 'border-b border-outline-variant/30';
const INPUT_CLASS = 'w-full h-9 px-space-sm bg-surface border border-outline-variant rounded text-on-surface focus:border-primary focus:outline-none';

function emptyRow(key: number, typeIds: number[]): InventoryRow {
    return {
        key,
        optionIds: Object.fromEntries(typeIds.map((typeId) => [typeId, null])),
        additionalPrice: '0',
        stockQuantity: '0',
    };
}

// BE가 거부하는 조건을 미리 보여 준다: 상품옵션 미선택 · 같은 조합 중복 · 음수 / 정수가 아닌 값
function rowProblem(row: InventoryRow, typeIds: number[], comboCount: Map<string, number>): string | null {
    if (typeIds.some((typeId) => row.optionIds[typeId] == null)) return '상품옵션을 모두 선택해주세요.';
    if ((comboCount.get(comboKey(row, typeIds)) ?? 0) > 1) return '같은 옵션 조합이 이미 있습니다.';
    const price = Number(row.additionalPrice);
    const stock = Number(row.stockQuantity);
    if (row.additionalPrice === '' || !Number.isInteger(price) || price < 0) return '추가 금액은 0 이상의 정수여야 합니다.';
    if (row.stockQuantity === '' || !Number.isInteger(stock) || stock < 0) return '재고 수량은 0 이상의 정수여야 합니다.';
    return null;
}

// 사이즈 종류는 한 상품에 하나만 쓴다. BE 옵션 데이터에 종류를 묶는 정보가 없어 typeId로 적어 둔다.
// BE data.sql 규칙상 이미 쓰는 ID는 바뀌지 않는다. 사이즈 종류가 새로 생기면 여기에 추가한다.
const SIZE_TYPE_IDS: ReadonlySet<number> = new Set([
    1, // 의류 사이즈
    3, // 신발 사이즈
    4, // 공 사이즈
    5, // 골키퍼 장갑 사이즈
]);

function comboKey(row: InventoryRow, typeIds: number[]): string {
    return typeIds.map((typeId) => row.optionIds[typeId] ?? '').join('/');
}

// 재고 표: 옵션 종류를 고르면 열이 생기고, 행마다 그 종류의 상품옵션을 select로 고른다.
// 옵션 종류를 하나도 고르지 않으면 옵션 없는 상품의 "기본" 재고 한 행만 둔다.
export default function OptionTable() {
    const { types, optionsByTypeId, isLoading, error } = useProductOptionTypes();
    // 옵션 종류와 재고 행은 서로 맞물려 바뀌므로(종류를 빼면 행의 선택도 빠진다) 한 상태로 묶어
    // 항상 직전 상태를 기준으로 함께 갱신한다. 따로 두면 연달아 바뀔 때 한쪽이 옛 값을 볼 수 있다.
    const [table, setTable] = useState<TableState>({ typeIds: [], rows: [emptyRow(1, [])], nextKey: 2 });
    const { typeIds, rows } = table;
    const setRows = (update: (rows: InventoryRow[]) => InventoryRow[]) =>
        setTable((prev) => ({ ...prev, rows: update(prev.rows) }));

    const typeName = (typeId: number) => types.find((type) => type.typeId === typeId)?.typeName ?? `옵션 종류 ${typeId}`;
    const hasSizeType = typeIds.some((typeId) => SIZE_TYPE_IDS.has(typeId));
    // 이미 고른 종류는 빼고, 사이즈 종류를 하나 골랐으면 다른 사이즈 종류도 뺀다
    const selectableTypes = types.filter(
        (type) => !typeIds.includes(type.typeId) && !(hasSizeType && SIZE_TYPE_IDS.has(type.typeId)),
    );
    const hasOptions = typeIds.length > 0;

    const comboCount = new Map<string, number>();
    if (hasOptions) {
        for (const row of rows) {
            if (typeIds.every((typeId) => row.optionIds[typeId] != null)) {
                const key = comboKey(row, typeIds);
                comboCount.set(key, (comboCount.get(key) ?? 0) + 1);
            }
        }
    }

    function addType(typeId: number) {
        setTable((prev) =>
            prev.typeIds.includes(typeId) ||
            (SIZE_TYPE_IDS.has(typeId) && prev.typeIds.some((id) => SIZE_TYPE_IDS.has(id)))
                ? prev
                : {
                      ...prev,
                      typeIds: [...prev.typeIds, typeId],
                      rows: prev.rows.map((row) => ({ ...row, optionIds: { ...row.optionIds, [typeId]: null } })),
                  },
        );
    }

    function removeType(typeId: number) {
        setTable((prev) => {
            const remaining = prev.typeIds.filter((id) => id !== typeId);
            const rows = prev.rows.map((row) => {
                const optionIds = { ...row.optionIds };
                delete optionIds[typeId];
                return { ...row, optionIds };
            });
            // 옵션 종류가 모두 빠지면 조합이 하나("기본")뿐이라 첫 행만 남긴다
            return { ...prev, typeIds: remaining, rows: remaining.length === 0 ? rows.slice(0, 1) : rows };
        });
    }

    function addRow() {
        setTable((prev) => ({
            ...prev,
            rows: [...prev.rows, emptyRow(prev.nextKey, prev.typeIds)],
            nextKey: prev.nextKey + 1,
        }));
    }

    function deleteRow(key: number) {
        setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.key !== key)));
    }

    function updateRow(key: number, change: Partial<Omit<InventoryRow, 'key'>>) {
        setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...change } : row)));
    }

    function selectOption(key: number, typeId: number, value: string) {
        setRows((prev) =>
            prev.map((row) =>
                row.key === key ? { ...row, optionIds: { ...row.optionIds, [typeId]: value === '' ? null : Number(value) } } : row,
            ),
        );
    }

    return (
        <Card className="space-y-space-lg" padding={8}>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-md">
                <div>
                    <Heading level={2}>옵션 · 재고</Heading>
                    <Text color="secondary">옵션 종류를 고르고, 옵션 조합별 추가 금액과 재고 수량을 설정합니다.</Text>
                </div>
                <Button
                    label="행 추가"
                    size="sm"
                    icon={<Icon name="add" className="text-[16px]" />}
                    onClick={addRow}
                    isDisabled={!hasOptions}
                />
            </div>

            <div className="flex flex-col gap-space-sm">
                <label className="text-body-sm font-label-sm text-on-surface" htmlFor="option-type-picker">
                    옵션 선택
                </label>
                <div className="flex flex-wrap items-center gap-space-sm">
                    <select
                        id="option-type-picker"
                        className={`${SELECT_CLASS} max-w-60`}
                        value=""
                        disabled={isLoading || selectableTypes.length === 0}
                        onChange={(e) => {
                            if (e.target.value !== '') addType(Number(e.target.value));
                        }}
                    >
                        <option value="">{isLoading ? '불러오는 중...' : '옵션 종류 추가'}</option>
                        {selectableTypes.map((type) => (
                            <option key={type.typeId} value={type.typeId}>
                                {type.typeName}
                            </option>
                        ))}
                    </select>
                    {typeIds.map((typeId) => (
                        <span
                            key={typeId}
                            className="inline-flex items-center gap-1 h-8 pl-space-sm pr-1 rounded-full bg-surface-container text-body-sm text-on-surface"
                        >
                            {typeName(typeId)}
                            <button
                                type="button"
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-outline-variant/40"
                                aria-label={`${typeName(typeId)} 옵션 종류 제거`}
                                onClick={() => removeType(typeId)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                {error ? (
                    <Text className="text-error" role="alert">
                        {errorMessage(error, '옵션 목록을 불러오지 못했습니다.')}
                    </Text>
                ) : (
                    !hasOptions && <Text color="secondary">옵션 종류를 고르지 않으면 옵션 없는 상품으로 재고 한 줄(기본)만 등록합니다.</Text>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-outline-variant bg-surface-container text-caption font-label-sm text-on-surface-variant">
                            {hasOptions ? (
                                typeIds.map((typeId) => (
                                    <th key={typeId} className="p-space-md min-w-32">
                                        {typeName(typeId)}
                                    </th>
                                ))
                            ) : (
                                <th className="p-space-md">옵션</th>
                            )}
                            <th className="p-space-md min-w-28">추가 금액 (원)</th>
                            <th className="p-space-md min-w-28">재고 수량</th>
                            <th className="p-space-md text-center w-16">관리</th>
                        </tr>
                    </thead>
                    <tbody className="text-body-md text-on-surface">
                        {rows.map((row) => {
                            const problem = rowProblem(row, typeIds, comboCount);
                            const columnCount = (hasOptions ? typeIds.length : 1) + 3;
                            // 행 구분선은 안내 줄이 있으면 안내 줄 아래에 둔다(행과 안내가 한 덩어리로 보이게)
                            return (
                                <Fragment key={row.key}>
                                    <tr className={problem ? undefined : ROW_DIVIDER}>
                                        {hasOptions ? (
                                            typeIds.map((typeId) => (
                                                <td key={typeId} className="p-space-sm">
                                                    <select
                                                        className={SELECT_CLASS}
                                                        aria-label={typeName(typeId)}
                                                        value={row.optionIds[typeId] ?? ''}
                                                        onChange={(e) => selectOption(row.key, typeId, e.target.value)}
                                                    >
                                                        <option value="">선택</option>
                                                        {(optionsByTypeId.get(typeId) ?? []).map((option) => (
                                                            <option key={option.optionId} value={option.optionId}>
                                                                {option.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            ))
                                        ) : (
                                            <td className="p-space-sm text-on-surface-variant">기본</td>
                                        )}
                                        <td className="p-space-sm">
                                            <input
                                                className={INPUT_CLASS}
                                                type="number"
                                                min={0}
                                                step={1}
                                                aria-label="추가 금액"
                                                value={row.additionalPrice}
                                                onChange={(e) => updateRow(row.key, { additionalPrice: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-space-sm">
                                            <input
                                                className={INPUT_CLASS}
                                                type="number"
                                                min={0}
                                                step={1}
                                                aria-label="재고 수량"
                                                value={row.stockQuantity}
                                                onChange={(e) => updateRow(row.key, { stockQuantity: e.target.value })}
                                            />
                                        </td>
                                        <td className="p-space-sm text-center">
                                            <Button
                                                label="재고 행 삭제"
                                                size="sm"
                                                variant="ghost"
                                                icon={<Icon name="delete" className="text-[18px]" />}
                                                isIconOnly
                                                isDisabled={rows.length <= 1}
                                                onClick={() => deleteRow(row.key)}
                                            />
                                        </td>
                                    </tr>
                                    {problem && (
                                        <tr className={ROW_DIVIDER}>
                                            <td colSpan={columnCount} className="px-space-sm pb-space-sm pt-0">
                                                <Text className="text-error text-caption">{problem}</Text>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
