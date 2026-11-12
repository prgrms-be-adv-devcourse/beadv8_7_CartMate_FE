import type { CSSProperties } from 'react';

type IconProps = {
    name: string;
    className?: string;
    filled?: boolean;
    /** 글자 크기(px). className 의 text-[Npx] 보다 우선한다. */
    size?: number;
};

// 구글 폰트 CSS 의 `.material-symbols-outlined { font-size: 24px }` 는 레이어 밖에 있어서
// Tailwind 의 text-[Npx](utilities 레이어)보다 항상 이긴다. 그래서 크기를 지정해도 모든 아이콘이 24px 로 그려지고,
// 옆 글자보다 커서 줄이 어긋났다. text-[Npx] 를 읽어 인라인 style 로 옮겨 지정한 크기가 실제로 적용되게 한다.
const SIZE_CLASS = /(?:^|\s)text-\[(\d+(?:\.\d+)?)px\](?=\s|$)/;

// Google Material Symbols (Outlined) 아이콘
export default function Icon({ name, className, filled = false, size }: IconProps) {
    const match = className?.match(SIZE_CLASS);
    const fontSize = size ?? (match ? Number(match[1]) : undefined);
    const rest = match ? className!.replace(SIZE_CLASS, ' ').trim() : className;

    const style: CSSProperties | undefined =
        filled || fontSize !== undefined
            ? { ...(filled && { fontVariationSettings: "'FILL' 1" }), ...(fontSize !== undefined && { fontSize }) }
            : undefined;

    return (
        <span className={`material-symbols-outlined${rest ? ` ${rest}` : ''}`} style={style} aria-hidden="true">
            {name}
        </span>
    );
}
