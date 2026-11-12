import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

export const teambuyTheme = defineTheme({
    name: 'teambuy',
    extends: neutralTheme,
    tokens: {
        '--color-accent': ['#4f46e5', '#a5b4fc'],
        '--color-accent-muted': ['#e0e7ff', '#312e81'],
    },
    components: {
        // neutral 기본(12px)은 카드 안 글자가 테두리에 붙어 보여 24px로 넓힌다.
        // 목록처럼 촘촘해야 하는 카드는 padding prop으로 따로 준다.
        card: {
            base: {
                padding: 'var(--spacing-6)',
            },
        },
    },
});
