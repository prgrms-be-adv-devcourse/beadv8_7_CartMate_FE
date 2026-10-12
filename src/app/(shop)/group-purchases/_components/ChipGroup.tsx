'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

type Chip = {
    label: string;
    icon?: string;
};

type ChipGroupProps = {
    chips: Chip[];
    className: string;
    chipClassName: string;
    activeClassName: string;
    inactiveClassName: string;
    iconClassName?: string;
    defaultIndex?: number;
};

// 하나만 선택되는 토글 칩/버튼 그룹
export default function ChipGroup({
    chips,
    className,
    chipClassName,
    activeClassName,
    inactiveClassName,
    iconClassName = 'text-[16px]',
    defaultIndex = 0,
}: ChipGroupProps) {
    const [active, setActive] = useState(defaultIndex);

    return (
        <div className={className}>
            {chips.map((chip, i) => (
                <button
                    key={chip.label}
                    className={`${chipClassName} ${i === active ? activeClassName : inactiveClassName}`}
                    type="button"
                    onClick={() => setActive(i)}
                >
                    {chip.icon && <Icon name={chip.icon} className={iconClassName} />}
                    <span>{chip.label}</span>
                </button>
            ))}
        </div>
    );
}
