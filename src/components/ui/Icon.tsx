type IconProps = {
    name: string;
    className?: string;
    filled?: boolean;
};

// Google Material Symbols (Outlined) 아이콘
export default function Icon({ name, className, filled = false }: IconProps) {
    return (
        <span
            className={`material-symbols-outlined${className ? ` ${className}` : ''}`}
            style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}
