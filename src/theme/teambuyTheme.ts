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
            // muted 카드는 어두운 화면에서 배경이 바깥 카드와 같아 경계가 사라진다. 테두리로 구분한다.
            'variant:muted': {
                border: '1px solid var(--color-border)',
            },
        },
        // 기본 배지(높이 20px, 좌우 8px)는 글자가 꽉 차 보여 조금 넓힌다.
        badge: {
            base: {
                height: '24px',
                paddingInline: 'var(--spacing-2-5, 10px)',
            },
        },
    },
});
