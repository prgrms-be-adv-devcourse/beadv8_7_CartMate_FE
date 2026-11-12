import { defineTheme } from '@astryxdesign/core/theme';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

export const teambuyTheme = defineTheme({
    name: 'teambuy',
    extends: neutralTheme,
    tokens: {
        '--color-accent': ['#4f46e5', '#a5b4fc'],
        '--color-accent-muted': ['#e0e7ff', '#312e81'],
    },
});
