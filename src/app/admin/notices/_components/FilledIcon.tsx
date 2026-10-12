// 채워진(FILL 1) Material Symbols 아이콘. 공통 Icon 은 style 을 받지 않아 로컬로 둔다.
export default function FilledIcon({ name, className }: { name: string; className?: string }) {
    return (
        <span
            className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}
