'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

type MemberAccordionProps = {
    header: ReactNode;
    amount: string;
    children: ReactNode;
};

// 팀원별 담은 품목 펼침/접힘 아코디언 (읽기 전용 팀원 섹션)
export default function MemberAccordion({ header, amount, children }: MemberAccordionProps) {
    const [open, setOpen] = useState(true);

    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div
                className="p-space-md flex flex-wrap items-center justify-between gap-space-sm cursor-pointer hover:bg-surface-container-low transition-colors"
                onClick={() => setOpen((prev) => !prev)}
            >
                {header}
                <div className="flex items-center gap-space-md">
                    <div className="text-right">
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">{amount}</span>
                    </div>
                    <button className="p-1 rounded-lg text-secondary hover:text-primary" type="button" aria-expanded={open}>
                        <Icon name="expand_more" className={`transition-transform duration-200${open ? '' : ' rotate-180'}`} />
                    </button>
                </div>
            </div>
            {open && <div className="p-space-lg bg-surface-container-low">{children}</div>}
        </div>
    );
}
